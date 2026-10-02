// src/pages/admin/Finance.jsx
import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';

const RANGE_TABS = [
  { key: 'day', label: 'Hôm nay' },
  { key: 'week', label: 'Tuần này' },
  { key: 'month', label: 'Tháng này' },
];

export default function AdminFinance() {
  const { bookings, transactions, updateBooking } = useStore();
  const [range, setRange] = useState('month');

  // Lọc theo khoảng thời gian
  const filtered = useMemo(() => {
    const now = new Date();
    const cutoff = new Date();
    if (range === 'day') cutoff.setDate(now.getDate() - 1);
    if (range === 'week') cutoff.setDate(now.getDate() - 7);
    if (range === 'month') cutoff.setDate(now.getDate() - 30);
    return bookings.filter((b) => new Date(b.createdAt || 0) >= cutoff);
  }, [bookings, range]);

  // Tổng doanh thu
  const totals = useMemo(() => {
    let base = 0;
    let overtime = 0;
    filtered.forEach((b) => {
      base += b.amount || 0;
      if (b.overtimePaymentStatus === 'paid') {
        overtime += b.overtimeAmount || 0;
      }
    });
    return { base, overtime, grand: base + overtime };
  }, [filtered]);

  // Giao dịch
  const txnList = useMemo(
    () =>
      transactions
        .map((t) => ({
          ...t,
          booking: bookings.find((b) => b.id === t.bookingId),
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [transactions, bookings]
  );

  // Ca cần hoàn tiền (hủy hợp lệ — demo)
  const refundable = bookings.filter(
    (b) => b.status === 'cancelled' && b.refundStatus !== 'refunded'
  );

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Tài chính & VNPay
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Theo dõi doanh thu, đối soát giao dịch và hoàn tiền
        </p>
      </div>

      {/* Range tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-1.5 inline-flex">
        {RANGE_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setRange(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              range === t.key
                ? 'bg-teal-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatBox
          label="Phí gói cơ bản"
          value={totals.base}
          icon="💵"
          color="teal"
        />
        <StatBox
          label="Phụ phí phát sinh"
          value={totals.overtime}
          icon="⚡"
          color="orange"
        />
        <StatBox
          label="Tổng doanh thu"
          value={totals.grand}
          icon="💰"
          color="purple"
        />
      </div>

      {/* Refund pending */}
      {refundable.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
          <p className="font-bold text-amber-800 mb-3">
            💸 Ca cần hoàn tiền ({refundable.length})
          </p>
          <div className="space-y-2">
            {refundable.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-lg p-3 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Ca {b.id}
                  </p>
                  <p className="text-xs text-gray-500">
                    {b.date} • {b.amount?.toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <button
                  onClick={() => {
                    updateBooking(b.id, { refundStatus: 'refunded' });
                    toast.success('Đã hoàn tiền qua VNPay');
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
                >
                  💸 Hoàn tiền
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bảng giao dịch */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b">
          <p className="font-bold text-gray-800">📊 Lịch sử giao dịch</p>
        </div>

        {txnList.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            Chưa có giao dịch
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Mã GD
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Ca khám
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Loại
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">
                  Số tiền
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {txnList.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">
                    {t.id}
                  </td>
                  <td className="px-4 py-3 text-gray-800">
                    {t.bookingId}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        t.type === 'base'
                          ? 'bg-teal-50 text-teal-700'
                          : 'bg-orange-50 text-orange-700'
                      }`}
                    >
                      {t.type === 'base' ? 'Phí gói' : 'Phụ phí'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">
                    {t.amount.toLocaleString('vi-VN')}đ
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                      ✓ Thành công
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, icon, color }) {
  const colorMap = {
    teal: 'text-teal-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${colorMap[color]}`}>
        {value.toLocaleString('vi-VN')}đ
      </p>
    </div>
  );
}