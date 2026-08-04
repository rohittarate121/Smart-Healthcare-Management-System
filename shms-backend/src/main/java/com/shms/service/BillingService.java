package com.shms.service;

import com.shms.dto.BillingResponseDTO;
import com.shms.dto.DischargeRequestDTO;
import com.shms.dto.InsuranceClaimUpdateDTO;
import com.shms.dto.PaymentRequestDTO;
import com.shms.model.*;
import com.shms.repository.*;
import com.shms.util.NotificationClient;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

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
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private NotificationClient notificationClient;


    // ── Admit patient ─────────────────────────────────────────────────────
    @Transactional
    public Admission admitPatient(
            Long patientId,
            Long doctorId,
            Long bedId,
            String reason) {
    	
    		Doctor doctor = doctorRepository
    				.findById(doctorId)
    				.orElseThrow(() ->
    					new RuntimeException("Doctor not found"));


        Patient patient = patientRepository
                .findById(patientId)
                .orElseThrow(() ->
                    new RuntimeException("Patient not found"));

        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() ->
                    new RuntimeException("Bed not found"));

        if (bed.getIsOccupied()) {
            throw new RuntimeException(
                "Bed is already occupied");
        }

        // Mark bed as occupied
        bed.setIsOccupied(true);
        bedRepository.save(bed);

        // We need doctor — query from doctor repo
        // Pass doctor as parameter from controller
        Admission admission = Admission.builder()
                .patient(patient)
                .doctor(doctor)
                .bed(bed)
                .admissionReason(reason)
                .status(Admission.AdmissionStatus.ADMITTED)
                .build();

        Admission saved = admissionRepository.save(admission);

        System.out.println("====================================");
        System.out.println("PATIENT ADMITTED: "
            + patient.getUser().getName()
            + " to Bed: " + bed.getBedNumber());
        System.out.println("====================================");

        return saved;
    }

    // ── Generate bill and initiate discharge ──────────────────────────────
    @Transactional
    public BillingResponseDTO initiateDischarge(
            Long admissionId,
            DischargeRequestDTO request) {

        Admission admission = admissionRepository
                .findById(admissionId)
                .orElseThrow(() ->
                    new RuntimeException(
                        "Admission not found"));

        if (admission.getStatus()
                == Admission.AdmissionStatus.DISCHARGED) {
            throw new RuntimeException(
                "Patient already discharged");
        }

        Patient patient = admission.getPatient();
        Bed bed = admission.getBed();

        // Calculate days admitted
        long daysAdmitted = ChronoUnit.DAYS.between(
                admission.getAdmittedAt(),
                LocalDateTime.now());

        if (daysAdmitted < 1) daysAdmitted = 1;

        // Calculate charges
        BigDecimal bedCharges = bed.getDailyCharge()
                .multiply(BigDecimal.valueOf(daysAdmitted));

        BigDecimal consultationCharge =
                BigDecimal.valueOf(500);

        BigDecimal totalBill = bedCharges
                .add(consultationCharge);

        // Update discharge summary
        admission.setDischargeSummary(
                request.getDischargeSummary());
        admissionRepository.save(admission);

        // Check insurance
        Optional<PatientInsurance> insuranceOpt =
                insuranceRepository
                    .findByPatientPatientIdAndIsActiveTrue(
                        patient.getPatientId());

        if (insuranceOpt.isPresent()) {
            PatientInsurance insurance = insuranceOpt.get();

            InsuranceClaim claim = InsuranceClaim.builder()
                    .patient(patient)
                    .insurance(insurance)
                    .admission(admission)
                    .totalBill(totalBill)
                    .claimedAmount(totalBill)
                    .status(
                        InsuranceClaim.ClaimStatus.SUBMITTED)
                    .build();

            claimRepository.save(claim);

            return BillingResponseDTO.builder()
                    .admissionId(admissionId)
                    .patientName(patient.getUser().getName())
                    .totalBill(totalBill)
                    .bedCharges(bedCharges)
                    .consultationCharges(consultationCharge)
                    .hasInsurance(true)
                    .insuranceProvider(
                        insurance.getProviderName())
                    .claimedAmount(totalBill)
                    .claimStatus("SUBMITTED")
                    .message("Insurance claim submitted. "
                        + "Awaiting admin approval.")
                    .build();
        }

        return BillingResponseDTO.builder()
                .admissionId(admissionId)
                .patientName(patient.getUser().getName())
                .totalBill(totalBill)
                .bedCharges(bedCharges)
                .consultationCharges(consultationCharge)
                .hasInsurance(false)
                .patientCopay(totalBill)
                .message("No insurance. Patient pays: "
                    + totalBill)
                .build();
    }

    // ── Admin approves or rejects claim ───────────────────────────────────
    @Transactional
    public InsuranceClaim updateClaimStatus(
            Long claimId,
            InsuranceClaimUpdateDTO dto) {

        InsuranceClaim claim = claimRepository
                .findById(claimId)
                .orElseThrow(() ->
                    new RuntimeException("Claim not found"));

        claim.setStatus(dto.getStatus());

        if (dto.getStatus()
                == InsuranceClaim.ClaimStatus.APPROVED) {
            claim.setApprovedAmount(dto.getApprovedAmount());
            BigDecimal copay = claim.getTotalBill()
                    .subtract(dto.getApprovedAmount());
            claim.setPatientCopay(
                copay.compareTo(BigDecimal.ZERO) < 0
                    ? BigDecimal.ZERO : copay);
            claim.setSettledAt(LocalDateTime.now());
            
            // Send notification
            notificationClient.sendInsuranceUpdate(
                    claim,
                    "Your insurance claim has been approved. " +
                    "Patient copay: ₹" + claim.getPatientCopay()
            );
            
        } else if (dto.getStatus()
                == InsuranceClaim.ClaimStatus.REJECTED) {
            claim.setRejectionReason(
                dto.getRejectionReason());
            claim.setPatientCopay(claim.getTotalBill());
            
            // Send notification
            notificationClient.sendInsuranceUpdate(
                    claim,
                    "Your insurance claim was rejected. " +
                    "Reason: " + dto.getRejectionReason()
            );
        }
        

        return claimRepository.save(claim);
    }

    // ── Confirm payment and finalise discharge ────────────────────────────
    @Transactional
    public Payment confirmPayment(
            Long patientId,
            PaymentRequestDTO request) {

        Patient patient = patientRepository
                .findById(patientId)
                .orElseThrow(() ->
                    new RuntimeException("Patient not found"));

        String txnRef = "SHMS-"
                + UUID.randomUUID()
                    .toString()
                    .substring(0, 8)
                    .toUpperCase();

        Payment payment = Payment.builder()
                .patient(patient)
                .amount(request.getAmount())
                .paymentType(request.getPaymentType())
                .paymentMethod(request.getPaymentMethod())
                .status(Payment.PaymentStatus.SUCCESS)
                .transactionRef(txnRef)
                .paidAt(LocalDateTime.now())
                .build();

        if (request.getApptId() != null) {
            Appointment appt = appointmentRepository
                    .findById(request.getApptId())
                    .orElseThrow(() ->
                        new RuntimeException(
                            "Appointment not found"));
            payment.setAppointment(appt);
        }

        if (request.getAdmissionId() != null) {
            Admission admission = admissionRepository
                    .findById(request.getAdmissionId())
                    .orElseThrow(() ->
                        new RuntimeException(
                            "Admission not found"));
            payment.setAdmission(admission);

            // Finalise discharge
            admission.setStatus(
                Admission.AdmissionStatus.DISCHARGED);
            admission.setDischargedAt(LocalDateTime.now());
            admissionRepository.save(admission);

            // Free bed
            Bed bed = admission.getBed();
            bed.setIsOccupied(false);
            bedRepository.save(bed);

            System.out.println(
                "====================================");
            System.out.println("PATIENT DISCHARGED: "
                + patient.getUser().getName()
                + " | Bed " + bed.getBedNumber()
                + " now available");
            System.out.println(
                "====================================");
            // Add after marking admission as DISCHARGED:
            notificationClient.sendDischargeNotification(admission);
        }

        Payment saved = paymentRepository.save(payment);

        System.out.println("====================================");
        System.out.println("PAYMENT SUCCESS: "
            + request.getAmount()
            + " | TXN: " + txnRef);
        System.out.println("====================================");
        
        

        return saved;
    }

    // ── Get available beds ────────────────────────────────────────────────
    public List<Bed> getAvailableBeds() {
        return bedRepository.findByIsOccupiedFalse();
    }

    // ── Get all admissions ────────────────────────────────────────────────
    public List<Admission> getAllAdmissions() {
        return admissionRepository.findAll();
    }

    // ── Get active admissions ─────────────────────────────────────────────
    public List<Admission> getActiveAdmissions() {
        return admissionRepository.findByStatus(
            Admission.AdmissionStatus.ADMITTED);
    }

    // ── Get pending claims ────────────────────────────────────────────────
    public List<InsuranceClaim> getPendingClaims() {
        return claimRepository.findByStatus(
            InsuranceClaim.ClaimStatus.SUBMITTED);
    }

    // ── Get all claims ────────────────────────────────────────────────────
    public List<InsuranceClaim> getAllClaims() {
        return claimRepository.findAll();
    }

    // ── Get payment history ───────────────────────────────────────────────
    public List<Payment> getPaymentHistory(
            Long patientId) {
        return paymentRepository
                .findByPatientPatientId(patientId);
    }
}