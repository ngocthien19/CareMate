// src/components/VNPayMock.jsx
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function VNPayMock({ amount, onSuccess, onCancel }) {
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      onSuccess({
        transactionId: `VNPAY_${Date.now()}`,
        amount,
        time: new Date().toISOString(),
        method: 'VNPAYQR',
      });
    }, 1800);
    return () => clearTimeout(timer);
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
            <p className="text-xs text-gray-500">{t('payment.nationalGateway')}</p>
          </div>
        </div>
      </div>

      <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />

      <p className="text-lg font-semibold text-gray-800">
        {t('payment.processing')}
      </p>
      <p className="text-sm text-gray-500 mt-2">
        {t('payment.amount')}{' '}
        <b className="text-blue-700">{amount.toLocaleString('vi-VN')} VNĐ</b>
      </p>

      <p className="text-xs text-gray-400 mt-8">{t('payment.doNotClose')}</p>

      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-6 text-xs text-gray-400 hover:text-gray-600 underline"
        >
          {t('payment.cancelTransaction')}
        </button>
      )}
    </div>
  );
}