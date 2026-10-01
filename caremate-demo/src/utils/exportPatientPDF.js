// src/utils/exportPatientPDF.js
import jsPDF from 'jspdf';

/**
 * Xuất PDF tóm tắt bệnh án
 * @param {Object} patient - Thông tin bệnh nhân
 * @param {Array} ehrList - Danh sách lần khám (EHR)
 */
export function exportPatientPDF(patient, ehrList = []) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // ===== MÀU SẮC =====
  const TEAL = [13, 148, 136];
  const DARK = [31, 41, 55];
  const GRAY = [107, 114, 128];
  const RED = [220, 38, 38];
  const AMBER = [217, 119, 6];

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = 0;

  // ============================================
  // HEADER — Logo + tiêu đề
  // ============================================
  // Nền teal header
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
  doc.text('Dich vu dong hanh y te tai TP.HCM', margin + 14, 16);

  // Ngày xuất
  doc.setFontSize(8);
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(
    now.getMonth() + 1
  ).padStart(2, '0')}/${now.getFullYear()}`;
  doc.text(`Xuat ngay: ${dateStr}`, pageW - margin, 15, { align: 'right' });

  y = 36;

  // ============================================
  // TIÊU ĐỀ
  // ============================================
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('TOM TAT BENH AN DIEN TU', pageW / 2, y, { align: 'center' });

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
  doc.text('THONG TIN BENH NHAN', margin + 4, y);

  y += 7;
  doc.setTextColor(...DARK);
  doc.setFontSize(9);

  // Hàng 1: Tên + Quan hệ
  doc.setFont('helvetica', 'bold');
  doc.text('Ho ten:', margin + 4, y);
  doc.setFont('helvetica', 'normal');
  doc.text(safeText(patient.name), margin + 22, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Quan he:', margin + 100, y);
  doc.setFont('helvetica', 'normal');
  doc.text(safeText(patient.relation), margin + 120, y);

  y += 6;
  // Hàng 2: Năm sinh + Giới tính
  doc.setFont('helvetica', 'bold');
  doc.text('Nam sinh:', margin + 4, y);
  doc.setFont('helvetica', 'normal');
  doc.text(safeText(patient.dob), margin + 22, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Gioi tinh:', margin + 100, y);
  doc.setFont('helvetica', 'normal');
  doc.text(safeText(patient.gender), margin + 120, y);

  y += 6;
  // Hàng 3: BHYT
  doc.setFont('helvetica', 'bold');
  doc.text('Ma BHYT:', margin + 4, y);
  doc.setFont('helvetica', 'normal');
  doc.text(safeText(patient.bhyt || '—'), margin + 22, y);

  doc.setFont('helvetica', 'bold');
  doc.text('SDT:', margin + 100, y);
  doc.setFont('helvetica', 'normal');
  doc.text(safeText(patient.emergencyPhone || '—'), margin + 120, y);

  y += 6;
  // Hàng 4: Địa chỉ
  doc.setFont('helvetica', 'bold');
  doc.text('Dia chi:', margin + 4, y);
  doc.setFont('helvetica', 'normal');
  const addrLines = doc.splitTextToSize(safeText(patient.address || '—'), 150);
  doc.text(addrLines, margin + 22, y);

  y += 7 + (addrLines.length - 1) * 5;

  // ============================================
  // CẢNH BÁO Y TẾ
  // ============================================
  if (patient.allergies?.length > 0 || patient.conditions?.length > 0) {
    const boxH =
      8 +
      (patient.allergies?.length > 0 ? 8 : 0) +
      (patient.conditions?.length > 0 ? 8 : 0);

    doc.setFillColor(254, 242, 242); // đỏ nhạt
    doc.setDrawColor(...RED);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, pageW - margin * 2, boxH, 2, 2, 'FD');

    y += 6;
    doc.setTextColor(...RED);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('CANH BAO Y TE', margin + 4, y);

    y += 6;
    doc.setFontSize(9);

    if (patient.allergies?.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Di ung thuoc:', margin + 4, y);
      doc.setFont('helvetica', 'normal');
      doc.text(safeText(patient.allergies.join(', ')), margin + 30, y);
      y += 6;
    }

    if (patient.conditions?.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Benh ly nen:', margin + 4, y);
      doc.setFont('helvetica', 'normal');
      doc.text(safeText(patient.conditions.join(', ')), margin + 30, y);
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
  doc.text(`LICH SU KHAM (${ehrList.length} lan)`, margin, y);
  y += 7;

  if (ehrList.length === 0) {
    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.text('Chua co lan kham nao.', margin, y);
    y += 6;
  } else {
    ehrList.forEach((ehr, idx) => {
      // Kiểm tra còn chỗ không, nếu không → sang trang
      if (y > pageH - 60) {
        doc.addPage();
        y = 20;
      }

      // ===== Card lần khám =====
      const cardStartY = y;
      const cardX = margin;
      const cardW = pageW - margin * 2;

      // Tính chiều cao card động
      const diagnosisLines = doc.splitTextToSize(safeText(ehr.diagnosis || ''), cardW - 12);
      const adviceLines = ehr.advice
        ? doc.splitTextToSize(safeText(ehr.advice), cardW - 12)
        : [];
      const prescLines = ehr.prescription
        ? doc.splitTextToSize(safeText(ehr.prescription), cardW - 12)
        : [];

      const cardH =
        12 + // header
        6 + // hospital
        diagnosisLines.length * 4.5 +
        4 +
        (adviceLines.length > 0 ? adviceLines.length * 4.5 + 4 : 0) +
        (ehr.vitals ? 12 : 0) +
        (prescLines.length > 0 ? prescLines.length * 4.5 + 8 : 0) +
        (ehr.nurse ? 6 : 0) +
        4;

      // Khung card
      doc.setFillColor(249, 250, 251);
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.2);
      doc.roundedRect(cardX, cardStartY, cardW, cardH, 2, 2, 'FD');

      // Thanh màu teal bên trái
      doc.setFillColor(...TEAL);
      doc.roundedRect(cardX, cardStartY, 1.5, cardH, 0.75, 0.75, 'F');

      y = cardStartY + 6;

      // Số thứ tự + Ngày khám
      doc.setTextColor(...TEAL);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Lan ${idx + 1}  •  ${safeText(ehr.date)}`, cardX + 5, y);

      y += 6;
      // Bệnh viện
      doc.setTextColor(...DARK);
      doc.setFontSize(9);
      doc.text(safeText(ehr.hospital || '—'), cardX + 5, y);

      // Bác sĩ bên phải
      doc.setTextColor(...GRAY);
      doc.setFontSize(8);
      if (ehr.doctor) {
        doc.text(safeText(ehr.doctor), cardX + cardW - 5, y, { align: 'right' });
      }

      y += 5;
      // Chẩn đoán
      doc.setTextColor(...GRAY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Chan doan:', cardX + 5, y);
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
        doc.text('Dan do:', cardX + 5, y);
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
        doc.text('Sinh hieu:', cardX + 5, y);
        y += 4;
        doc.setTextColor(...DARK);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Huyet ap: ${ehr.vitals.bp || '—'}  |  Mach: ${ehr.vitals.pulse || '—'} bpm  |  Can nang: ${ehr.vitals.weight || '—'} kg`,
          cardX + 5,
          y
        );
        y += 5;
      }

      // Đơn thuốc
      if (prescLines.length > 0) {
        y += 1;
        doc.setFillColor(239, 246, 255);
        doc.roundedRect(cardX + 5, y - 3, cardW - 10, prescLines.length * 4.5 + 4, 1, 1, 'F');
        doc.setTextColor(30, 64, 175);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('Don thuoc:', cardX + 7, y + 1);
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
        doc.text(`Y ta CareMate: ${safeText(ehr.nurse)}`, cardX + 5, y);
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

    // Đường kẻ
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.2);
    doc.line(margin, pageH - 12, pageW - margin, pageH - 12);

    // Nội dung footer
    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(
      'Tai lieu chi mang tinh tham khao - duoc tao tu he thong CareMate',
      margin,
      pageH - 7
    );
    doc.text(`Trang ${i} / ${totalPages}`, pageW - margin, pageH - 7, {
      align: 'right',
    });
  }

  // ============================================
  // LƯU FILE
  // ============================================
  const safeName = (patient.name || 'benh-nhan')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();

  doc.save(`caremate-benh-an-${safeName}.pdf`);
}

// Loại bỏ ký tự tiếng Việt có dấu → tránh lỗi font mặc định của jsPDF
// (jsPDF mặc định chỉ hỗ trợ Latin-1)
function safeText(text) {
  if (!text) return '';
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}