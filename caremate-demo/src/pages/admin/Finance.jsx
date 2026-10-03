// src/pages/admin/Finance.jsx
import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { HOSPITALS, NURSES } from '../../mock';

const RANGE_TABS = [
  { key: 'day', label: 'Hôm nay' },
  { key: 'week', label: 'Tuần này' },
  { key: 'month', label: 'Tháng này' },
  { key: 'all', label: 'Tất cả' },
];

const STATUS_LABEL = {
  confirmed: { label: 'Chờ bắt đầu', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  picking_up: { label: 'Đang đón BN', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  at_hospital: { label: 'Đã tới viện', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  examining: { label: 'Đang khám', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  done_exam: { label: 'Đã lấy thuốc', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  completed: { label: 'Đã hoàn tất', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700 border-red-200' },
};

export default function AdminFinance() {
  const { bookings, patients, transactions, updateBooking } = useStore();
  const [range, setRange] = useState('all');
  const [tab, setTab] = useState('bookings'); // 'bookings' | 'transactions'

  // Lọc theo khoảng thời gian
  const cutoff = useMemo(() => {
    const now = new Date();
    const c = new Date();
    if (range === 'day') c.setDate(now.getDate() - 1);
    if (range === 'week') c.setDate(now.getDate() - 7);
    if (range === 'month') c.setDate(now.getDate() - 30);
    if (range === 'all') c.setFullYear(2000); // rất xa
    return c;
  }, [range]);

  // 👇 List ca đặt lịch (đã thanh toán phí gói)
  const bookingList = useMemo(
    () =>
      bookings
        .filter(
          (b) =>
            b.paymentStatus === 'paid' &&
            new Date(b.createdAt || 0) >= cutoff
        )
        .sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        ),
    [bookings, cutoff]
  );

  // 👇 Tổng doanh thu — tính từ bookings
  const totals = useMemo(() => {
    let base = 0;
    let overtime = 0;
    bookingList.forEach((b) => {
      base += b.amount || 0;
      if (b.overtimePaymentStatus === 'paid') {
        overtime += b.overtimeAmount || 0;
      }
    });
    return { base, overtime, grand: base + overtime };
  }, [bookingList]);

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

  // Ca cần hoàn tiền
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
      <div className="bg-white rounded-xl border border-gray-200 p-1.5 inline-flex flex-wrap gap-1">
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

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-1.5 inline-flex gap-1">
        <button
          onClick={() => setTab('bookings')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            tab === 'bookings'
              ? 'bg-teal-600 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          📋 Ca đã đặt ({bookingList.length})
        </button>
        <button
          onClick={() => setTab('transactions')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            tab === 'transactions'
              ? 'bg-teal-600 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          💳 Lịch sử giao dịch ({txnList.length})
        </button>
      </div>

      {/* Tab: Danh sách ca đặt lịch */}
      {tab === 'bookings' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b">
            <p className="font-bold text-gray-800">
              📋 Tất cả ca đã đặt ({bookingList.length})
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Chỉ hiển thị các ca đã thanh toán phí gói cơ bản
            </p>
          </div>

          {bookingList.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              Chưa có ca nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      Mã ca
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      Khách hàng
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      Y tá
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      Bệnh viện
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      Ngày đặt
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-700">
                      Phí gói
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-700">
                      Phụ phí
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookingList.map((b) => {
                    const patient = patients.find(
                      (p) => p.id === b.patientId
                    );
                    const nurse = NURSES.find((n) => n.id === b.nurseId);
                    const hospital = HOSPITALS.find(
                      (h) => h.id === b.hospitalId
                    );
                    const statusInfo =
                      STATUS_LABEL[b.status] || STATUS_LABEL.confirmed;
                    const hasOvertime = b.overtimePaymentStatus === 'paid';

                    return (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs text-teal-700 font-semibold">
                          {b.id}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={patient?.avatar}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-800 text-xs truncate">
                                {patient?.name}
                              </p>
                              <p className="text-[10px] text-gray-500">
                                {patient?.relation}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={nurse?.avatar}
                              alt=""
                              className="w-7 h-7 rounded-full object-cover border"
                            />
                            <span className="text-xs text-gray-700">
                              {nurse?.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700">
                          {hospital?.name}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {b.createdAt
                            ? new Date(b.createdAt).toLocaleDateString('vi-VN')
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-teal-700 text-xs">
                          {b.amount?.toLocaleString('vi-VN')}đ
                        </td>
                        <td className="px-4 py-3 text-right text-xs">
                          {hasOvertime ? (
                            <span className="font-semibold text-orange-600">
                              +{b.overtimeAmount?.toLocaleString('vi-VN')}đ
                            </span>
                          ) : b.overtimePaymentStatus === 'unpaid' ? (
                            <span className="text-[10px] text-amber-600 italic">
                              Chưa TT
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-[10px] px-2 py-1 rounded-full border font-medium whitespace-nowrap ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Footer tổng */}
                <tfoot className="bg-gray-50 border-t">
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-3 text-right font-bold text-gray-700 text-sm"
                    >
                      TỔNG CỘNG
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-teal-700 text-sm">
                      {totals.base.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-orange-600 text-sm">
                      {totals.overtime > 0
                        ? `+${totals.overtime.toLocaleString('vi-VN')}đ`
                        : '—'}
                    </td>
                    <td className="px-4 py-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Lịch sử giao dịch */}
      {tab === 'transactions' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b">
            <p className="font-bold text-gray-800">
              💳 Lịch sử giao dịch VNPay ({txnList.length})
            </p>
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
                    Ngày
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
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {t.date}
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
      )}
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