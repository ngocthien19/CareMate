// src/components/VNPayMock.jsx
import { useEffect } from 'react';

/**
 * Giả lập cổng thanh toán VNPay
 * - Hiện loading 1.8s → trả về transactionId
 */
export default function VNPayMock({ amount, onSuccess, onCancel }) {
  useEffect(() => {
    const t = setTimeout(() => {
      onSuccess({
        transactionId: `VNPAY_${Date.now()}`,
        amount,
        time: new Date().toISOString(),
        method: 'VNPAYQR',
      });
    }, 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center">
      {/* Logo VNPay */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-xl">
            VN
          </div>
          <div>
            <h1 className="text-2xl font-bold text-blue-800">VNPAY</h1>
            <p className="text-xs text-gray-500">Cổng thanh toán quốc gia</p>
          </div>
        </div>
      </div>

      {/* Spinner */}
      <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />

      <p className="text-lg font-semibold text-gray-800">
        Đang xử lý giao dịch...
      </p>
      <p className="text-sm text-gray-500 mt-2">
        Số tiền:{' '}
        <b className="text-blue-700">{amount.toLocaleString('vi-VN')} VNĐ</b>
      </p>

      <p className="text-xs text-gray-400 mt-8">
        Vui lòng không đóng trình duyệt trong lúc chờ
      </p>

      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-6 text-xs text-gray-400 hover:text-gray-600 underline"
        >
          Hủy giao dịch
        </button>
      )}
    </div>
  );
}