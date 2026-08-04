package com.shms.service;

import com.shms.dto.*;
import com.shms.model.*;
import com.shms.repository.*;
import com.shms.util.NotificationClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BillingService {

    @Autowired
    private AdmissionRepository admissionRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private InsuranceClaimRepository claimRepository;

    @Autowired
    private PatientInsuranceRepository insuranceRepository;

    @Autowired
    private BedRepository bedRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private BillingAccountRepository billingAccountRepository;

    @Autowired
    private BillingChargeRepository billingChargeRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private InvoiceItemRepository invoiceItemRepository;

    @Autowired
    private PaymentRecordRepository paymentRecordRepository;

    @Autowired
    private InvoicePdfService invoicePdfService;

    @Autowired
    private NotificationClient notificationClient;

    // ── 1. ADMIT PATIENT (Auto-Creates Billing Account & Room Charge) ──────────
    @Transactional
    public Admission admitPatient(Long patientId, Long doctorId, Long bedId, String reason) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new RuntimeException("Bed not found"));

        if (Boolean.TRUE.equals(bed.getIsOccupied())) {
            throw new RuntimeException("Bed is already occupied");
        }

        // Mark bed as occupied
        bed.setIsOccupied(true);
        bedRepository.save(bed);

        // Create Admission
        Admission admission = Admission.builder()
                .patient(patient)
                .doctor(doctor)
                .bed(bed)
                .admissionReason(reason)
                .status(Admission.AdmissionStatus.ADMITTED)
                .build();

        Admission savedAdmission = admissionRepository.save(admission);

        // STEP 1: Automatically Create Active Billing Account
        BillingAccount billingAccount = BillingAccount.builder()
                .admission(savedAdmission)
                .patient(patient)
                .status(BillingAccount.AccountStatus.ACTIVE)
                .build();

        BillingAccount savedAccount = billingAccountRepository.save(billingAccount);

        // Add Initial Room Charge for Day 1
        BigDecimal dailyRate = bed.getDailyCharge() != null ? bed.getDailyCharge() : BigDecimal.valueOf(500);
        BillingCharge initialRoomCharge = BillingCharge.builder()
                .account(savedAccount)
                .chargeName("Room Charge - " + (bed.getBedNumber() != null ? bed.getBedNumber() : "Standard Bed"))
                .category(BillingCharge.ChargeCategory.ROOM)
                .amount(dailyRate)
                .quantity(1)
                .totalAmount(dailyRate)
                .notes("Initial admission room charge")
                .build();

        billingChargeRepository.save(initialRoomCharge);

        System.out.println("====================================");
        System.out.println("PATIENT ADMITTED: " + patient.getUser().getName() + " | Billing Account #" + savedAccount.getAccountId() + " CREATED");
        System.out.println("====================================");

        return savedAdmission;
    }

    // ── 2. AUTO / MANUAL CHARGE COLLECTION ─────────────────────────────────
    @Transactional
    public BillingCharge addCharge(AddChargeDTO dto, Long staffUserId) {
        Admission admission = admissionRepository.findById(dto.getAdmissionId())
                .orElseThrow(() -> new RuntimeException("Admission not found"));

        BillingAccount account = billingAccountRepository.findByAdmissionAdmissionIdAndStatus(
                        dto.getAdmissionId(), BillingAccount.AccountStatus.ACTIVE)
                .orElseGet(() -> {
                    BillingAccount newAcc = BillingAccount.builder()
                            .admission(admission)
                            .patient(admission.getPatient())
                            .status(BillingAccount.AccountStatus.ACTIVE)
                            .build();
                    return billingAccountRepository.save(newAcc);
                });

        BigDecimal qty = BigDecimal.valueOf(dto.getQuantity() != null ? dto.getQuantity() : 1);
        BigDecimal total = dto.getAmount().multiply(qty);

        BillingCharge charge = BillingCharge.builder()
                .account(account)
                .chargeName(dto.getChargeName())
                .category(dto.getCategory())
                .amount(dto.getAmount())
                .quantity(dto.getQuantity() != null ? dto.getQuantity() : 1)
                .totalAmount(total)
                .createdByUserId(staffUserId)
                .notes(dto.getNotes())
                .build();

        return billingChargeRepository.save(charge);
    }

    // ── 3. LIVE BILL MONITORING ─────────────────────────────────────────────
    @Transactional(readOnly = true)
    public LiveBillDTO getLiveBill(Long admissionId) {
        Admission admission = admissionRepository.findById(admissionId)
                .orElseThrow(() -> new RuntimeException("Admission not found"));

        BillingAccount account = billingAccountRepository.findByAdmissionAdmissionId(admissionId)
                .orElseThrow(() -> new RuntimeException("Billing account not found for admission"));

        List<BillingCharge> charges = billingChargeRepository.findByAccountAccountIdOrderByChargeDateDesc(account.getAccountId());

        long daysAdmitted = ChronoUnit.DAYS.between(admission.getAdmittedAt(), LocalDateTime.now());
        if (daysAdmitted < 1) daysAdmitted = 1;

        Bed bed = admission.getBed();
        BigDecimal dailyRoomRate = (bed != null && bed.getDailyCharge() != null) ? bed.getDailyCharge() : BigDecimal.valueOf(500);

        // Sum existing logged charges
        BigDecimal accruedChargesTotal = charges.stream()
                .map(BillingCharge::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Check if room charges are explicitly tracked or calculate room dynamic total
        BigDecimal roomChargesTotal = charges.stream()
                .filter(c -> c.getCategory() == BillingCharge.ChargeCategory.ROOM)
                .map(BillingCharge::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // If logged room charges < calculated room days, calculate difference
        BigDecimal calculatedRoomTotal = dailyRoomRate.multiply(BigDecimal.valueOf(daysAdmitted));
        if (roomChargesTotal.compareTo(calculatedRoomTotal) < 0) {
            accruedChargesTotal = accruedChargesTotal.add(calculatedRoomTotal.subtract(roomChargesTotal));
            roomChargesTotal = calculatedRoomTotal;
        }

        Map<String, BigDecimal> categoryBreakdown = new HashMap<>();
        for (BillingCharge c : charges) {
            String cat = c.getCategory().name();
            categoryBreakdown.put(cat, categoryBreakdown.getOrDefault(cat, BigDecimal.ZERO).add(c.getTotalAmount()));
        }
        categoryBreakdown.put("ROOM", roomChargesTotal);

        List<LiveBillDTO.ChargeItemDTO> chargeItems = charges.stream()
                .map(c -> LiveBillDTO.ChargeItemDTO.builder()
                        .chargeId(c.getChargeId())
                        .chargeName(c.getChargeName())
                        .category(c.getCategory().name())
                        .amount(c.getAmount())
                        .quantity(c.getQuantity())
                        .totalAmount(c.getTotalAmount())
                        .chargeDate(c.getChargeDate())
                        .notes(c.getNotes())
                        .build())
                .collect(Collectors.toList());

        return LiveBillDTO.builder()
                .accountId(account.getAccountId())
                .admissionId(admissionId)
                .patientId(admission.getPatient().getPatientId())
                .patientName(admission.getPatient().getUser().getName())
                .registrationNumber(admission.getPatient().getRegistrationNumber())
                .doctorName(admission.getDoctor() != null ? admission.getDoctor().getUser().getName() : "N/A")
                .bedNumber(bed != null ? bed.getBedNumber() : "N/A")
                .wardName(bed != null && bed.getWard() != null ? bed.getWard().getName() : "General")
                .admittedAt(admission.getAdmittedAt())
                .daysAdmitted(daysAdmitted)
                .dailyRoomCharge(dailyRoomRate)
                .roomChargesTotal(roomChargesTotal)
                .accruedChargesTotal(accruedChargesTotal)
                .runningTotal(accruedChargesTotal)
                .categoryBreakdown(categoryBreakdown)
                .charges(chargeItems)
                .build();
    }

    // ── 4 & 5. DISCHARGE & FINAL INVOICE GENERATION ─────────────────────────
    @Transactional
    public InvoiceResponseDTO generateFinalInvoice(Long admissionId, DischargeBillingDTO dto) {
        Admission admission = admissionRepository.findById(admissionId)
                .orElseThrow(() -> new RuntimeException("Admission not found"));

        if (admission.getStatus() == Admission.AdmissionStatus.DISCHARGED) {
            // If already discharged, return existing invoice
            Optional<Invoice> existingInvoice = invoiceRepository.findByAdmissionAdmissionId(admissionId);
            if (existingInvoice.isPresent()) {
                return mapInvoiceToDTO(existingInvoice.get());
            }
        }

        BillingAccount account = billingAccountRepository.findByAdmissionAdmissionId(admissionId)
                .orElseGet(() -> {
                    BillingAccount acc = BillingAccount.builder()
                            .admission(admission)
                            .patient(admission.getPatient())
                            .status(BillingAccount.AccountStatus.ACTIVE)
                            .build();
                    return billingAccountRepository.save(acc);
                });

        // Set discharge summary & timestamp
        if (dto.getDischargeSummary() != null) {
            admission.setDischargeSummary(dto.getDischargeSummary());
        }
        LocalDateTime dischargeTime = LocalDateTime.now();

        // Calculate stay days
        long daysAdmitted = ChronoUnit.DAYS.between(admission.getAdmittedAt(), dischargeTime);
        if (daysAdmitted < 1) daysAdmitted = 1;

        // Collect all logged charges
        List<BillingCharge> loggedCharges = billingChargeRepository.findByAccountAccountId(account.getAccountId());

        // Check room charges
        Bed bed = admission.getBed();
        BigDecimal dailyRoomRate = (bed != null && bed.getDailyCharge() != null) ? bed.getDailyCharge() : BigDecimal.valueOf(500);
        BigDecimal totalRoomChargeNeeded = dailyRoomRate.multiply(BigDecimal.valueOf(daysAdmitted));

        BigDecimal loggedRoomTotal = loggedCharges.stream()
                .filter(c -> c.getCategory() == BillingCharge.ChargeCategory.ROOM)
                .map(BillingCharge::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Add remaining room charge if any
        if (loggedRoomTotal.compareTo(totalRoomChargeNeeded) < 0) {
            BigDecimal diff = totalRoomChargeNeeded.subtract(loggedRoomTotal);
            BillingCharge remainingRoomCharge = BillingCharge.builder()
                    .account(account)
                    .chargeName("Room Charge Adjustment (" + daysAdmitted + " days @ ₹" + dailyRoomRate + "/day)")
                    .category(BillingCharge.ChargeCategory.ROOM)
                    .amount(diff)
                    .quantity(1)
                    .totalAmount(diff)
                    .notes("Discharge room charge auto balance")
                    .build();
            loggedCharges.add(billingChargeRepository.save(remainingRoomCharge));
        }

        // Calculate Subtotal
        BigDecimal subtotal = loggedCharges.stream()
                .map(BillingCharge::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Apply Discount
        BigDecimal discountAmt = BigDecimal.ZERO;
        if (dto.getDiscountAmount() != null && dto.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            discountAmt = dto.getDiscountAmount();
        } else if (dto.getDiscountPercentage() != null && dto.getDiscountPercentage().compareTo(BigDecimal.ZERO) > 0) {
            discountAmt = subtotal.multiply(dto.getDiscountPercentage()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }

        BigDecimal afterDiscount = subtotal.subtract(discountAmt);
        if (afterDiscount.compareTo(BigDecimal.ZERO) < 0) afterDiscount = BigDecimal.ZERO;

        // Apply GST
        BigDecimal gstPct = dto.getGstPercentage() != null ? dto.getGstPercentage() : BigDecimal.ZERO;
        BigDecimal gstAmt = afterDiscount.multiply(gstPct).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal grandTotal = afterDiscount.add(gstAmt);

        // Invoice Number Generation
        String invNum = "INV-" + System.currentTimeMillis();

        // Create Invoice entity
        Invoice invoice = Invoice.builder()
                .invoiceNumber(invNum)
                .account(account)
                .admission(admission)
                .patient(admission.getPatient())
                .subtotal(subtotal)
                .discountAmount(discountAmt)
                .discountPercentage(dto.getDiscountPercentage())
                .gstPercentage(gstPct)
                .gstAmount(gstAmt)
                .grandTotal(grandTotal)
                .paidAmount(BigDecimal.ZERO)
                .dueAmount(grandTotal)
                .paymentStatus(Invoice.PaymentStatus.PENDING)
                .paymentMethod(dto.getPaymentMethod())
                .build();

        Invoice savedInvoice = invoiceRepository.save(invoice);

        // Save Itemized Invoice Items
        List<InvoiceItem> items = new ArrayList<>();
        for (BillingCharge c : loggedCharges) {
            InvoiceItem item = InvoiceItem.builder()
                    .invoice(savedInvoice)
                    .chargeId(c.getChargeId())
                    .description(c.getChargeName())
                    .category(c.getCategory().name())
                    .unitPrice(c.getAmount())
                    .quantity(c.getQuantity())
                    .totalPrice(c.getTotalAmount())
                    .build();
            items.add(invoiceItemRepository.save(item));
        }

        // Close Billing Account
        account.setStatus(BillingAccount.AccountStatus.CLOSED);
        account.setClosedAt(LocalDateTime.now());
        billingAccountRepository.save(account);

        InvoiceResponseDTO responseDTO = mapInvoiceToDTO(savedInvoice);

        // Generate and store PDF
        try {
            String appDataDir = System.getProperty("user.home") + File.separator + ".shms" + File.separator + "invoices";
            String pdfPath = invoicePdfService.saveInvoicePdfToFile(responseDTO, appDataDir);
            savedInvoice.setPdfPath(pdfPath);
            invoiceRepository.save(savedInvoice);
            responseDTO.setPdfPath(pdfPath);
        } catch (Exception e) {
            System.err.println("Warning: Could not save invoice PDF file: " + e.getMessage());
        }

        // Process initial deposit/payment if provided
        if (dto.getInitialPaymentAmount() != null && dto.getInitialPaymentAmount().compareTo(BigDecimal.ZERO) > 0) {
            processPayment(PaymentTransactionDTO.builder()
                    .invoiceId(savedInvoice.getInvoiceId())
                    .amount(dto.getInitialPaymentAmount())
                    .paymentMethod(dto.getPaymentMethod() != null ?
                            PaymentRecord.PaymentMethod.valueOf(dto.getPaymentMethod().toUpperCase()) :
                            PaymentRecord.PaymentMethod.CASH)
                    .notes("Initial discharge payment")
                    .build());
        }

        return mapInvoiceToDTO(savedInvoice);
    }

    // Backward compatible Initiate Discharge
    @Transactional
    public BillingResponseDTO initiateDischarge(Long admissionId, DischargeRequestDTO request) {
        DischargeBillingDTO dischargeDTO = DischargeBillingDTO.builder()
                .dischargeSummary(request.getDischargeSummary())
                .build();

        InvoiceResponseDTO invoiceResponse = generateFinalInvoice(admissionId, dischargeDTO);

        Admission admission = admissionRepository.findById(admissionId).orElseThrow();
        Patient patient = admission.getPatient();

        // Check insurance
        Optional<PatientInsurance> insuranceOpt = insuranceRepository.findByPatientPatientIdAndIsActiveTrue(patient.getPatientId());
        if (insuranceOpt.isPresent()) {
            PatientInsurance insurance = insuranceOpt.get();
            InsuranceClaim claim = InsuranceClaim.builder()
                    .patient(patient)
                    .insurance(insurance)
                    .admission(admission)
                    .totalBill(invoiceResponse.getGrandTotal())
                    .claimedAmount(invoiceResponse.getGrandTotal())
                    .status(InsuranceClaim.ClaimStatus.SUBMITTED)
                    .build();

            claimRepository.save(claim);

            return BillingResponseDTO.builder()
                    .admissionId(admissionId)
                    .patientName(patient.getUser().getName())
                    .totalBill(invoiceResponse.getGrandTotal())
                    .bedCharges(invoiceResponse.getSubtotal())
                    .consultationCharges(BigDecimal.ZERO)
                    .hasInsurance(true)
                    .insuranceProvider(insurance.getProviderName())
                    .claimedAmount(invoiceResponse.getGrandTotal())
                    .claimStatus("SUBMITTED")
                    .message("Insurance claim submitted. Invoice generated: " + invoiceResponse.getInvoiceNumber())
                    .build();
        }

        return BillingResponseDTO.builder()
                .admissionId(admissionId)
                .patientName(patient.getUser().getName())
                .totalBill(invoiceResponse.getGrandTotal())
                .bedCharges(invoiceResponse.getSubtotal())
                .consultationCharges(BigDecimal.ZERO)
                .hasInsurance(false)
                .patientCopay(invoiceResponse.getGrandTotal())
                .message("Invoice #" + invoiceResponse.getInvoiceNumber() + " generated. Patient pays: ₹" + invoiceResponse.getGrandTotal())
                .build();
    }

    // ── 7. PAYMENT PROCESSING ───────────────────────────────────────────────
    @Transactional
    public InvoiceResponseDTO processPayment(PaymentTransactionDTO request) {
        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        BigDecimal paidSoFar = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : BigDecimal.ZERO;
        BigDecimal newPaidTotal = paidSoFar.add(request.getAmount());
        BigDecimal due = invoice.getGrandTotal().subtract(newPaidTotal);

        if (due.compareTo(BigDecimal.ZERO) < 0) {
            due = BigDecimal.ZERO;
        }

        invoice.setPaidAmount(newPaidTotal);
        invoice.setDueAmount(due);
        invoice.setPaymentMethod(request.getPaymentMethod().name());

        if (due.compareTo(BigDecimal.ZERO) == 0) {
            invoice.setPaymentStatus(Invoice.PaymentStatus.PAID);
        } else {
            invoice.setPaymentStatus(Invoice.PaymentStatus.PARTIAL);
        }

        Invoice savedInvoice = invoiceRepository.save(invoice);

        // Record Payment History Transaction
        String txnRef = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        PaymentRecord record = PaymentRecord.builder()
                .invoice(savedInvoice)
                .patient(savedInvoice.getPatient())
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .transactionRef(txnRef)
                .notes(request.getNotes())
                .build();

        paymentRecordRepository.save(record);

        // Also save legacy Payment record for backward compatibility
        Payment legacyPayment = Payment.builder()
                .patient(savedInvoice.getPatient())
                .admission(savedInvoice.getAdmission())
                .amount(request.getAmount())
                .paymentType(Payment.PaymentType.OTHER)
                .paymentMethod(Payment.PaymentMethod.valueOf(request.getPaymentMethod().name()))
                .status(Payment.PaymentStatus.SUCCESS)
                .transactionRef(txnRef)
                .paidAt(LocalDateTime.now())
                .build();

        paymentRepository.save(legacyPayment);

        // Finalise Discharge & Free Bed if paid or discharged
        Admission admission = savedInvoice.getAdmission();
        if (admission != null && admission.getStatus() == Admission.AdmissionStatus.ADMITTED) {
            admission.setStatus(Admission.AdmissionStatus.DISCHARGED);
            admission.setDischargedAt(LocalDateTime.now());
            admissionRepository.save(admission);

            Bed bed = admission.getBed();
            if (bed != null) {
                bed.setIsOccupied(false);
                bedRepository.save(bed);
            }

            notificationClient.sendDischargeNotification(admission);
        }

        return mapInvoiceToDTO(savedInvoice);
    }

    // Backward compatible confirm payment
    @Transactional
    public Payment confirmPayment(Long patientId, PaymentRequestDTO request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        String txnRef = "SHMS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Payment payment = Payment.builder()
                .patient(patient)
                .amount(request.getAmount())
                .paymentType(request.getPaymentType())
                .paymentMethod(request.getPaymentMethod())
                .status(Payment.PaymentStatus.SUCCESS)
                .transactionRef(txnRef)
                .paidAt(LocalDateTime.now())
                .build();

        if (request.getAdmissionId() != null) {
            Admission admission = admissionRepository.findById(request.getAdmissionId())
                    .orElseThrow(() -> new RuntimeException("Admission not found"));
            payment.setAdmission(admission);

            admission.setStatus(Admission.AdmissionStatus.DISCHARGED);
            admission.setDischargedAt(LocalDateTime.now());
            admissionRepository.save(admission);

            Bed bed = admission.getBed();
            if (bed != null) {
                bed.setIsOccupied(false);
                bedRepository.save(bed);
            }

            // Also update any pending invoice
            Optional<Invoice> invOpt = invoiceRepository.findByAdmissionAdmissionId(request.getAdmissionId());
            if (invOpt.isPresent()) {
                Invoice inv = invOpt.get();
                inv.setPaidAmount(inv.getGrandTotal());
                inv.setDueAmount(BigDecimal.ZERO);
                inv.setPaymentStatus(Invoice.PaymentStatus.PAID);
                invoiceRepository.save(inv);
            }
        }

        return paymentRepository.save(payment);
    }

    // ── 8. INVOICE HISTORY & SEARCH ─────────────────────────────────────────
    @Transactional(readOnly = true)
    public InvoiceResponseDTO getInvoiceDetails(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        return mapInvoiceToDTO(invoice);
    }

    @Transactional(readOnly = true)
    public InvoiceResponseDTO getInvoiceByAdmission(Long admissionId) {
        Invoice invoice = invoiceRepository.findByAdmissionAdmissionId(admissionId)
                .orElseThrow(() -> new RuntimeException("Invoice not found for admission"));
        return mapInvoiceToDTO(invoice);
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponseDTO> searchInvoices(String query) {
        List<Invoice> list = invoiceRepository.searchInvoices(query != null ? query.trim() : "");
        return list.stream().map(this::mapInvoiceToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponseDTO> getPatientInvoices(Long patientId) {
        List<Invoice> list = invoiceRepository.findByPatientPatientIdOrderByGeneratedAtDesc(patientId);
        return list.stream().map(this::mapInvoiceToDTO).collect(Collectors.toList());
    }

    // ── HELPER MAPPERS & READ METHODS ───────────────────────────────────────
    public List<Bed> getAvailableBeds() {
        return bedRepository.findByIsOccupiedFalse();
    }

    public List<Admission> getAllAdmissions() {
        return admissionRepository.findAll();
    }

    public List<Admission> getActiveAdmissions() {
        return admissionRepository.findByStatus(Admission.AdmissionStatus.ADMITTED);
    }

    public List<InsuranceClaim> getPendingClaims() {
        return claimRepository.findByStatus(InsuranceClaim.ClaimStatus.SUBMITTED);
    }

    public List<InsuranceClaim> getAllClaims() {
        return claimRepository.findAll();
    }

    public List<Payment> getPaymentHistory(Long patientId) {
        return paymentRepository.findByPatientPatientId(patientId);
    }

    @Transactional
    public InsuranceClaim updateClaimStatus(Long claimId, InsuranceClaimUpdateDTO dto) {
        InsuranceClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        claim.setStatus(dto.getStatus());

        if (dto.getStatus() == InsuranceClaim.ClaimStatus.APPROVED) {
            claim.setApprovedAmount(dto.getApprovedAmount());
            BigDecimal copay = claim.getTotalBill().subtract(dto.getApprovedAmount());
            claim.setPatientCopay(copay.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : copay);
            claim.setSettledAt(LocalDateTime.now());
            notificationClient.sendInsuranceUpdate(claim, "Your insurance claim has been approved. Copay: ₹" + claim.getPatientCopay());
        } else if (dto.getStatus() == InsuranceClaim.ClaimStatus.REJECTED) {
            claim.setRejectionReason(dto.getRejectionReason());
            claim.setPatientCopay(claim.getTotalBill());
            notificationClient.sendInsuranceUpdate(claim, "Your insurance claim was rejected. Reason: " + dto.getRejectionReason());
        }

        return claimRepository.save(claim);
    }

    private InvoiceResponseDTO mapInvoiceToDTO(Invoice inv) {
        List<InvoiceItem> items = invoiceItemRepository.findByInvoiceInvoiceId(inv.getInvoiceId());
        List<PaymentRecord> records = paymentRecordRepository.findByInvoiceInvoiceIdOrderByPaymentDateDesc(inv.getInvoiceId());

        List<InvoiceResponseDTO.InvoiceItemDTO> itemDTOs = items.stream()
                .map(i -> InvoiceResponseDTO.InvoiceItemDTO.builder()
                        .itemId(i.getItemId())
                        .description(i.getDescription())
                        .category(i.getCategory())
                        .unitPrice(i.getUnitPrice())
                        .quantity(i.getQuantity())
                        .totalPrice(i.getTotalPrice())
                        .build())
                .collect(Collectors.toList());

        List<InvoiceResponseDTO.PaymentRecordDTO> recordDTOs = records.stream()
                .map(r -> InvoiceResponseDTO.PaymentRecordDTO.builder()
                        .recordId(r.getRecordId())
                        .amount(r.getAmount())
                        .paymentMethod(r.getPaymentMethod().name())
                        .transactionRef(r.getTransactionRef())
                        .paymentDate(r.getPaymentDate())
                        .notes(r.getNotes())
                        .build())
                .collect(Collectors.toList());

        Admission admission = inv.getAdmission();
        Patient patient = inv.getPatient();
        Bed bed = admission != null ? admission.getBed() : null;

        return InvoiceResponseDTO.builder()
                .invoiceId(inv.getInvoiceId())
                .invoiceNumber(inv.getInvoiceNumber())
                .admissionId(admission != null ? admission.getAdmissionId() : null)
                .patientId(patient != null ? patient.getPatientId() : null)
                .patientName(patient != null && patient.getUser() != null ? patient.getUser().getName() : "N/A")
                .registrationNumber(patient != null ? patient.getRegistrationNumber() : "N/A")
                .phone(patient != null && patient.getUser() != null ? patient.getUser().getPhone() : "")
                .email(patient != null && patient.getUser() != null ? patient.getUser().getEmail() : "")
                .doctorName(admission != null && admission.getDoctor() != null && admission.getDoctor().getUser() != null ?
                        admission.getDoctor().getUser().getName() : "N/A")
                .departmentName(admission != null && admission.getDoctor() != null && admission.getDoctor().getDepartment() != null ?
                        admission.getDoctor().getDepartment().getName() : "General Medicine")
                .bedNumber(bed != null ? bed.getBedNumber() : "N/A")
                .wardName(bed != null && bed.getWard() != null ? bed.getWard().getName() : "Standard")
                .admissionDate(admission != null ? admission.getAdmittedAt() : null)
                .dischargeDate(admission != null ? admission.getDischargedAt() : null)
                .invoiceDate(inv.getGeneratedAt())
                .subtotal(inv.getSubtotal())
                .discountAmount(inv.getDiscountAmount())
                .discountPercentage(inv.getDiscountPercentage())
                .gstPercentage(inv.getGstPercentage())
                .gstAmount(inv.getGstAmount())
                .grandTotal(inv.getGrandTotal())
                .paidAmount(inv.getPaidAmount())
                .dueAmount(inv.getDueAmount())
                .paymentStatus(inv.getPaymentStatus().name())
                .paymentMethod(inv.getPaymentMethod())
                .pdfPath(inv.getPdfPath())
                .items(itemDTOs)
                .paymentRecords(recordDTOs)
                .build();
    }
}