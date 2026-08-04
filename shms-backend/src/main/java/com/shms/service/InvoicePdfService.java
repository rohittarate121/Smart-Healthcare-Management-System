package com.shms.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.shms.dto.InvoiceResponseDTO;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class InvoicePdfService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm");

    public byte[] generateInvoicePdf(InvoiceResponseDTO invoice) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            // Font styles
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.DARK_GRAY);
            Font subHeaderFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new Color(14, 116, 144));
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);
            Font tableHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);

            // 1. Hospital Header
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{60, 40});

            PdfPCell cellLeft = new PdfPCell();
            cellLeft.setBorder(Rectangle.NO_BORDER);
            cellLeft.addElement(new Paragraph("SMART HEALTHCARE MANAGEMENT SYSTEM", headerFont));
            cellLeft.addElement(new Paragraph("123 Healthcare Blvd, Medical District", subHeaderFont));
            cellLeft.addElement(new Paragraph("Phone: +91 (020) 555-0199 | Email: billing@shms-hospital.org", subHeaderFont));
            cellLeft.addElement(new Paragraph("GSTIN: 27AAAAA0000A1Z5", subHeaderFont));
            headerTable.addCell(cellLeft);

            PdfPCell cellRight = new PdfPCell();
            cellRight.setBorder(Rectangle.NO_BORDER);
            cellRight.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph invTitle = new Paragraph("INVOICE", titleFont);
            invTitle.setAlignment(Element.ALIGN_RIGHT);
            cellRight.addElement(invTitle);
            Paragraph invNum = new Paragraph("Invoice #: " + invoice.getInvoiceNumber(), boldFont);
            invNum.setAlignment(Element.ALIGN_RIGHT);
            cellRight.addElement(invNum);
            Paragraph invDate = new Paragraph("Date: " + (invoice.getInvoiceDate() != null ? invoice.getInvoiceDate().format(DATE_FORMATTER) : "N/A"), normalFont);
            invDate.setAlignment(Element.ALIGN_RIGHT);
            cellRight.addElement(invDate);
            Paragraph payStatus = new Paragraph("Status: " + invoice.getPaymentStatus(), boldFont);
            payStatus.setAlignment(Element.ALIGN_RIGHT);
            cellRight.addElement(payStatus);
            headerTable.addCell(cellRight);

            document.add(headerTable);
            document.add(new Paragraph(" "));

            // Divider
            PdfPTable divider = new PdfPTable(1);
            divider.setWidthPercentage(100);
            PdfPCell divCell = new PdfPCell();
            divCell.setFixedHeight(2);
            divCell.setBackgroundColor(new Color(14, 116, 144));
            divCell.setBorder(Rectangle.NO_BORDER);
            divider.addCell(divCell);
            document.add(divider);
            document.add(new Paragraph(" "));

            // 2. Patient & Admission Information Table
            PdfPTable infoTable = new PdfPTable(4);
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{22, 28, 22, 28});

            addInfoCell(infoTable, "Patient Name:", boldFont);
            addInfoCell(infoTable, invoice.getPatientName(), normalFont);
            addInfoCell(infoTable, "Patient ID:", boldFont);
            addInfoCell(infoTable, invoice.getRegistrationNumber(), normalFont);

            addInfoCell(infoTable, "Attending Doctor:", boldFont);
            addInfoCell(infoTable, invoice.getDoctorName(), normalFont);
            addInfoCell(infoTable, "Department:", boldFont);
            addInfoCell(infoTable, invoice.getDepartmentName() != null ? invoice.getDepartmentName() : "General", normalFont);

            addInfoCell(infoTable, "Bed / Ward:", boldFont);
            addInfoCell(infoTable, (invoice.getBedNumber() != null ? invoice.getBedNumber() : "") + " (" + (invoice.getWardName() != null ? invoice.getWardName() : "Standard") + ")", normalFont);
            addInfoCell(infoTable, "Admission Date:", boldFont);
            addInfoCell(infoTable, invoice.getAdmissionDate() != null ? invoice.getAdmissionDate().format(DATE_FORMATTER) : "N/A", normalFont);

            addInfoCell(infoTable, "Discharge Date:", boldFont);
            addInfoCell(infoTable, invoice.getDischargeDate() != null ? invoice.getDischargeDate().format(DATE_FORMATTER) : "N/A", normalFont);
            addInfoCell(infoTable, "Payment Method:", boldFont);
            addInfoCell(infoTable, invoice.getPaymentMethod() != null ? invoice.getPaymentMethod() : "N/A", normalFont);

            document.add(infoTable);
            document.add(new Paragraph(" "));

            // 3. Itemized Charges Table
            PdfPTable itemTable = new PdfPTable(5);
            itemTable.setWidthPercentage(100);
            itemTable.setWidths(new float[]{10, 45, 15, 15, 15});

            addTableHeader(itemTable, "#", tableHeaderFont);
            addTableHeader(itemTable, "Description / Category", tableHeaderFont);
            addTableHeader(itemTable, "Unit Price", tableHeaderFont);
            addTableHeader(itemTable, "Qty", tableHeaderFont);
            addTableHeader(itemTable, "Total (₹)", tableHeaderFont);

            int index = 1;
            if (invoice.getItems() != null) {
                for (InvoiceResponseDTO.InvoiceItemDTO item : invoice.getItems()) {
                    addTableCell(itemTable, String.valueOf(index++), normalFont, Element.ALIGN_CENTER);
                    addTableCell(itemTable, item.getDescription() + " (" + item.getCategory() + ")", normalFont, Element.ALIGN_LEFT);
                    addTableCell(itemTable, "₹ " + String.format("%.2f", item.getUnitPrice()), normalFont, Element.ALIGN_RIGHT);
                    addTableCell(itemTable, String.valueOf(item.getQuantity()), normalFont, Element.ALIGN_CENTER);
                    addTableCell(itemTable, "₹ " + String.format("%.2f", item.getTotalPrice()), normalFont, Element.ALIGN_RIGHT);
                }
            }

            document.add(itemTable);
            document.add(new Paragraph(" "));

            // 4. Financial Totals Section
            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(45);
            summaryTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
            summaryTable.setWidths(new float[]{55, 45});

            addSummaryRow(summaryTable, "Subtotal:", "₹ " + String.format("%.2f", invoice.getSubtotal()), normalFont, false);
            if (invoice.getDiscountAmount() != null && invoice.getDiscountAmount().doubleValue() > 0) {
                addSummaryRow(summaryTable, "Discount:", "- ₹ " + String.format("%.2f", invoice.getDiscountAmount()), normalFont, false);
            }
            if (invoice.getGstAmount() != null && invoice.getGstAmount().doubleValue() > 0) {
                addSummaryRow(summaryTable, "GST (" + invoice.getGstPercentage() + "%):", "+ ₹ " + String.format("%.2f", invoice.getGstAmount()), normalFont, false);
            }
            addSummaryRow(summaryTable, "Grand Total:", "₹ " + String.format("%.2f", invoice.getGrandTotal()), boldFont, true);
            addSummaryRow(summaryTable, "Paid Amount:", "₹ " + String.format("%.2f", invoice.getPaidAmount()), normalFont, false);
            addSummaryRow(summaryTable, "Due Amount:", "₹ " + String.format("%.2f", invoice.getDueAmount()), boldFont, true);

            document.add(summaryTable);
            document.add(new Paragraph(" "));

            // 5. Signatures and Footer
            PdfPTable footerTable = new PdfPTable(2);
            footerTable.setWidthPercentage(100);
            footerTable.setWidths(new float[]{50, 50});

            PdfPCell signLeft = new PdfPCell(new Paragraph("Patient / Relative Signature\n\n_________________________", normalFont));
            signLeft.setBorder(Rectangle.NO_BORDER);
            signLeft.setHorizontalAlignment(Element.ALIGN_LEFT);
            footerTable.addCell(signLeft);

            PdfPCell signRight = new PdfPCell(new Paragraph("Authorized Billing Signatory\n\n_________________________", boldFont));
            signRight.setBorder(Rectangle.NO_BORDER);
            signRight.setHorizontalAlignment(Element.ALIGN_RIGHT);
            footerTable.addCell(signRight);

            document.add(footerTable);
            document.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return baos.toByteArray();
    }

    public String saveInvoicePdfToFile(InvoiceResponseDTO invoice, String directoryPath) {
        try {
            File dir = new File(directoryPath);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            String fileName = "Invoice_" + invoice.getInvoiceNumber() + ".pdf";
            File file = new File(dir, fileName);
            byte[] bytes = generateInvoicePdf(invoice);
            try (FileOutputStream fos = new FileOutputStream(file)) {
                fos.write(bytes);
            }
            return file.getAbsolutePath();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private void addInfoCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(3);
        table.addCell(cell);
    }

    private void addTableHeader(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(new Color(14, 116, 144));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(5);
        table.addCell(cell);
    }

    private void addTableCell(PdfPTable table, String text, Font font, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(alignment);
        cell.setPadding(4);
        table.addCell(cell);
    }

    private void addSummaryRow(PdfPTable table, String label, String val, Font font, boolean isBorder) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, font));
        labelCell.setBorder(isBorder ? Rectangle.TOP | Rectangle.BOTTOM : Rectangle.NO_BORDER);
        labelCell.setPadding(3);
        table.addCell(labelCell);

        PdfPCell valCell = new PdfPCell(new Phrase(val, font));
        valCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        valCell.setBorder(isBorder ? Rectangle.TOP | Rectangle.BOTTOM : Rectangle.NO_BORDER);
        valCell.setPadding(3);
        table.addCell(valCell);
    }
}
