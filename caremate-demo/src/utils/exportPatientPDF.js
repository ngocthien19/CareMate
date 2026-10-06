// src/utils/exportPatientPDF.js
import jsPDF from 'jspdf';

/**
 * Xuất PDF tóm tắt bệnh án
 * @param {Object} patient - Thông tin bệnh nhân
 * @param {Array} ehrList - Danh sách lần khám (EHR)
 * @param {Function} t - Hàm dịch i18n (từ useTranslation)
 * @param {Object} extras - Labels đã dịch sẵn cho các trường động
 * @param {string} extras.relationLabel - Label của quan hệ (đã dịch)
 * @param {string} extras.genderLabel - Label của giới tính (đã dịch)
 * @param {string[]} extras.allergyLabels - Labels của dị ứng (đã dịch)
 * @param {string[]} extras.conditionLabels - Labels của bệnh nền (đã dịch)
 */
export function exportPatientPDF(
  patient,
  ehrList = [],
  t = (key, opts) => key,
  extras = {}
) {
  const {
    relationLabel = patient.relation,
    genderLabel = patient.gender,
    allergyLabels = patient.allergies || [],
    conditionLabels = patient.conditions || [],
  } = extras;

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // ===== MÀU SẮC =====
  const TEAL = [13, 148, 136];
  const DARK = [31, 41, 55];
  const GRAY = [107, 114, 128];
  const RED = [220, 38, 38];

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = 0;

  // ============================================
  // HEADER — Logo + tiêu đề
  // ============================================
  doc.setFillColor(...TEAL);
  doc.rect(0, 0, pageW, 26, 'F');

  // Logo chữ C
  doc.setFillColor(255, 255, 255);
  doc.circle(margin + 5, 13, 5, 'F');
  doc.setTextColor(...TEAL);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('C', margin + 3.5, 15);

  // Tên thương hiệu
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text('CareMate', margin + 14, 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(safeText(t('pdf.tagline')), margin + 14, 16);

  // Ngày xuất
  doc.setFontSize(8);
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(
    now.getMonth() + 1
  ).padStart(2, '0')}/${now.getFullYear()}`;
  doc.text(
    `${safeText(t('pdf.exportedOn'))} ${dateStr}`,
    pageW - margin,
    15,
    { align: 'right' }
  );

  y = 36;

  // ============================================
  // TIÊU ĐỀ
  // ============================================
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(safeText(t('pdf.title')), pageW / 2, y, { align: 'center' });

  y += 4;
  doc.setDrawColor(...TEAL);
  doc.setLineWidth(0.5);
  doc.line(pageW / 2 - 30, y, pageW / 2 + 30, y);

  y += 12;

  // ============================================
  // THÔNG TIN BỆNH NHÂN
  // ============================================
  doc.setFillColor(240, 253, 250);
  doc.roundedRect(margin, y, pageW - margin * 2, 42, 2, 2, 'F');

  y += 6;
  doc.setTextColor(...TEAL);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(safeText(t('pdf.patientInfo')), margin + 4, y);

  y += 7;
  doc.setTextColor(...DARK);
  doc.setFontSize(9);

  // Hàng 1: Tên + Quan hệ
  doc.setFont('helvetica', 'bold');
  doc.text(safeText(t('pdf.fullName')), margin + 4, y);
  doc.setFont('helvetica', 'normal');
  doc.text(safeText(patient.name), margin + 32, y);

  doc.setFont('helvetica', 'bold');
  doc.text(safeText(t('pdf.relation')), margin + 105, y);
  doc.setFont('helvetica', 'normal');
  doc.text(safeText(relationLabel), margin + 140, y);

  y += 6;
  // Hàng 2: Năm sinh + Giới tính
  doc.setFont('helvetica', 'bold');
  doc.text(safeText(t('pdf.dob')), margin + 4, y);
  doc.setFont('helvetica', 'normal');
  doc.text(safeText(patient.dob), margin + 32, y);

  doc.setFont('helvetica', 'bold');
  doc.text(safeText(t('pdf.gender')), margin + 105, y);
  doc.setFont('helvetica', 'normal');
  doc.text(safeText(genderLabel), margin + 140, y);

  y += 6;
  // Hàng 3: BHYT + SĐT
  doc.setFont('helvetica', 'bold');
  doc.text(safeText(t('pdf.bhyt')), margin + 4, y);
  doc.setFont('helvetica', 'normal');
  doc.text(safeText(patient.bhyt || '—'), margin + 32, y);

  doc.setFont('helvetica', 'bold');
  doc.text(safeText(t('pdf.phone')), margin + 105, y);
  doc.setFont('helvetica', 'normal');
  doc.text(safeText(patient.emergencyPhone || '—'), margin + 140, y);

  y += 6;
  // Hàng 4: Địa chỉ
  doc.setFont('helvetica', 'bold');
  doc.text(safeText(t('pdf.address')), margin + 4, y);
  doc.setFont('helvetica', 'normal');
  const addrLines = doc.splitTextToSize(safeText(patient.address || '—'), 135);
  doc.text(addrLines, margin + 32, y);

  y += 7 + (addrLines.length - 1) * 5;

  // ============================================
  // CẢNH BÁO Y TẾ
  // ============================================
  if (allergyLabels.length > 0 || conditionLabels.length > 0) {
    const boxH =
      8 +
      (allergyLabels.length > 0 ? 8 : 0) +
      (conditionLabels.length > 0 ? 8 : 0);

    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(...RED);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, pageW - margin * 2, boxH, 2, 2, 'FD');

    y += 6;
    doc.setTextColor(...RED);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(safeText(t('pdf.medicalWarning')), margin + 4, y);

    y += 6;
    doc.setFontSize(9);

    if (allergyLabels.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text(safeText(t('pdf.allergies')), margin + 4, y);
      doc.setFont('helvetica', 'normal');
      doc.text(safeText(allergyLabels.join(', ')), margin + 32, y);
      y += 6;
    }

    if (conditionLabels.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text(safeText(t('pdf.conditions')), margin + 4, y);
      doc.setFont('helvetica', 'normal');
      doc.text(safeText(conditionLabels.join(', ')), margin + 32, y);
      y += 6;
    }
    y += 4;
  }

  y += 6;

  // ============================================
  // LỊCH SỬ KHÁM
  // ============================================
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(
    safeText(t('pdf.visitHistory', { count: ehrList.length })),
    margin,
    y
  );
  y += 7;

  if (ehrList.length === 0) {
    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.text(safeText(t('pdf.noVisits')), margin, y);
    y += 6;
  } else {
    ehrList.forEach((ehr, idx) => {
      if (y > pageH - 60) {
        doc.addPage();
        y = 20;
      }

      const cardStartY = y;
      const cardX = margin;
      const cardW = pageW - margin * 2;

      const diagnosisLines = doc.splitTextToSize(
        safeText(ehr.diagnosis || ''),
        cardW - 12
      );
      const adviceLines = ehr.advice
        ? doc.splitTextToSize(safeText(ehr.advice), cardW - 12)
        : [];
      const prescLines = ehr.prescription
        ? doc.splitTextToSize(safeText(ehr.prescription), cardW - 12)
        : [];

      const cardH =
        12 +
        6 +
        diagnosisLines.length * 4.5 +
        4 +
        (adviceLines.length > 0 ? adviceLines.length * 4.5 + 4 : 0) +
        (ehr.vitals ? 12 : 0) +
        (prescLines.length > 0 ? prescLines.length * 4.5 + 8 : 0) +
        (ehr.nurse ? 6 : 0) +
        4;

      doc.setFillColor(249, 250, 251);
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.2);
      doc.roundedRect(cardX, cardStartY, cardW, cardH, 2, 2, 'FD');

      doc.setFillColor(...TEAL);
      doc.roundedRect(cardX, cardStartY, 1.5, cardH, 0.75, 0.75, 'F');

      y = cardStartY + 6;

      // Số thứ tự + Ngày khám
      doc.setTextColor(...TEAL);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(
        `${safeText(
          t('pdf.visitNumber', { num: idx + 1 })
        )}  •  ${safeText(ehr.date)}`,
        cardX + 5,
        y
      );

      y += 6;
      doc.setTextColor(...DARK);
      doc.setFontSize(9);
      doc.text(safeText(ehr.hospital || '—'), cardX + 5, y);

      doc.setTextColor(...GRAY);
      doc.setFontSize(8);
      if (ehr.doctor) {
        doc.text(safeText(ehr.doctor), cardX + cardW - 5, y, {
          align: 'right',
        });
      }

      y += 5;
      // Chẩn đoán
      doc.setTextColor(...GRAY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(safeText(t('pdf.diagnosis')), cardX + 5, y);
      y += 4;
      doc.setTextColor(...DARK);
      doc.setFont('helvetica', 'normal');
      doc.text(diagnosisLines, cardX + 5, y);
      y += diagnosisLines.length * 4.5 + 2;

      // Dặn dò
      if (adviceLines.length > 0) {
        doc.setTextColor(...GRAY);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(safeText(t('pdf.advice')), cardX + 5, y);
        y += 4;
        doc.setTextColor(...DARK);
        doc.setFont('helvetica', 'normal');
        doc.text(adviceLines, cardX + 5, y);
        y += adviceLines.length * 4.5 + 2;
      }

      // Sinh hiệu
      if (ehr.vitals) {
        doc.setTextColor(...GRAY);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(safeText(t('pdf.vitals')), cardX + 5, y);
        y += 4;
        doc.setTextColor(...DARK);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `${safeText(t('pdf.bp'))}: ${ehr.vitals.bp || '—'}  |  ${safeText(
            t('pdf.pulse')
          )}: ${ehr.vitals.pulse || '—'} bpm  |  ${safeText(
            t('pdf.weight')
          )}: ${ehr.vitals.weight || '—'} kg`,
          cardX + 5,
          y
        );
        y += 5;
      }

      // Đơn thuốc
      if (prescLines.length > 0) {
        y += 1;
        doc.setFillColor(239, 246, 255);
        doc.roundedRect(
          cardX + 5,
          y - 3,
          cardW - 10,
          prescLines.length * 4.5 + 4,
          1,
          1,
          'F'
        );
        doc.setTextColor(30, 64, 175);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(safeText(t('pdf.prescription')), cardX + 7, y + 1);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.text(prescLines, cardX + 7, y);
        y += prescLines.length * 4.5 + 3;
      }

      // Y tá
      if (ehr.nurse) {
        doc.setTextColor(...GRAY);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.text(
          `${safeText(t('pdf.nurseLabel'))} ${safeText(ehr.nurse)}`,
          cardX + 5,
          y
        );
        y += 4;
      }

      y = cardStartY + cardH + 6;
    });
  }

  // ============================================
  // FOOTER mỗi trang
  // ============================================
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.2);
    doc.line(margin, pageH - 12, pageW - margin, pageH - 12);

    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(safeText(t('pdf.footer')), margin, pageH - 7);
    doc.text(
      safeText(t('pdf.page', { current: i, total: totalPages })),
      pageW - margin,
      pageH - 7,
      { align: 'right' }
    );
  }

  // ============================================
  // LƯU FILE
  // ============================================
  const safeName = (patient.name || 'patient')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();

  const fileName = t('pdf.fileName', { name: safeName });
  doc.save(fileName);
}

// Loại bỏ ký tự tiếng Việt có dấu → tránh lỗi font mặc định của jsPDF
function safeText(text) {
  if (!text) return '';
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}