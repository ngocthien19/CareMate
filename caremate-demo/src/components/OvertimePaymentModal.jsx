// src/components/OvertimePaymentModal.jsx
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import Modal from './Modal';
import VNPayMock from './VNPayMock';
import { calcOvertimeFee } from '../utils/calcOvertimeFee';

/**
 * Modal quyết toán phụ phí phát sinh
 * @param {boolean} open
 * @param {function} onClose
 * @param {object} booking
 * @param {function} onPaid - callback sau khi thanh toán thành công
 */
export default function OvertimePaymentModal({ open, onClose, booking, onPaid }) {
  const [paying, setPaying] = useState(false);

  if (!booking) return null;

  const info = calcOvertimeFee(booking.startTime, booking.endTime);

  // Nếu không có phụ phí → không mở
  if (!info.isOvertime) return null;

  const qrData = JSON.stringify({
    type: 'overtime_payment',
    bookingId: booking.id,
    amount: info.overtimeFee,
    overtimeHours: info.overtimeHours,
    generatedAt: new Date().toISOString(),
  });

  const handlePaymentSuccess = (txn) => {
    setPaying(false);
    toast.success('Đã thanh toán phụ phí thành công!');
    onPaid?.(txn, info.overtimeFee);
  };

  return (
    <>
      <Modal
        open={open && !paying}
        onClose={onClose}
        title="Quyết toán phụ phí phát sinh"
        maxWidth="max-w-lg"
      >
        <div className="space-y-5">
          {/* Thông báo vượt giờ */}
          <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl">⚠️</span>
              <div className="flex-1">
                <p className="font-bold text-orange-700">
                  Ca khám vượt quá 4 giờ
                </p>
                <p className="text-sm text-orange-600 mt-1">
                  Theo quy định gói, thời gian vượt quá sẽ tính phụ phí{' '}
                  <b>+120.000 VNĐ/giờ</b>
                </p>
              </div>
            </div>
          </div>

          {/* Chi tiết thời gian */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <p className="font-bold text-gray-800 mb-2">
              📊 Chi tiết thời lượng
            </p>
            <div className="flex justify-between">
              <span className="text-gray-500">Tổng thời gian</span>
              <span className="font-medium text-gray-800">
                {info.formattedDuration}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Trong gói (đã trả)</span>
              <span className="font-medium text-gray-800">4h 00p</span>
            </div>
            <div className="flex justify-between text-orange-700">
              <span>Vượt giờ</span>
              <span className="font-semibold">
                {info.overtimeHours.toFixed(2)} giờ
              </span>
            </div>
          </div>

          {/* Số tiền */}
          <div className="bg-gradient-to-br from-orange-50 to-rose-50 border-2 border-orange-200 rounded-xl p-5">
            <p className="text-xs text-gray-500 mb-1">Phụ phí cần thanh toán</p>
            <p className="text-3xl font-bold text-orange-600">
              +{info.formattedFee} VNĐ
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Phí gói gốc {BASE_PRICE_LABEL} đã thanh toán khi đặt lịch
            </p>
          </div>

          {/* QR */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Quét mã QR bằng app VNPay hoặc ngân hàng để thanh toán
            </p>
            <div className="inline-block bg-white p-4 rounded-xl border-2 border-blue-200">
              <QRCodeSVG
                value={qrData}
                size={180}
                level="M"
                fgColor="#1e40af"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              Mã QR có hiệu lực trong 15 phút
            </p>
          </div>

          {/* Nút */}
          <div className="space-y-2">
            <button
              onClick={() => setPaying(true)}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
            >
              <div className="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center text-xs font-bold">
                VN
              </div>
              Thanh toán qua VNPay
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 border border-gray-300 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition text-sm"
            >
              Thanh toán sau
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            💡 Bạn có thể quay lại thanh toán sau tại trang{' '}
            <b>Báo cáo sau khám</b>
          </p>
        </div>
      </Modal>

      {/* VNPay mock */}
      {paying && (
        <VNPayMock
          amount={info.overtimeFee}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setPaying(false)}
        />
      )}
    </>
  );
}

const BASE_PRICE_LABEL = '499.000 VNĐ';