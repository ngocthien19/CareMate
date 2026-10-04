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
    if (range === 'all') c.setFullYear(2000);
    return c;
  }, [range]);

  // List ca đặt lịch (đã thanh toán phí gói)
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

  // Tổng doanh thu
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
      {/* ===== HEADER — nền TEAL đơn sắc ===== */}
      <div className="relative rounded-2xl overflow-hidden bg-teal-600 p-6 shadow-lg">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-400/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-400/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-pulse" />
            <span className="text-[10px] font-semibold text-white">
              Đối soát tài chính
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            💵 Tài chính & VNPay
          </h1>
          <p className="text-sm text-teal-50 mt-1">
            Theo dõi doanh thu, đối soát giao dịch và hoàn tiền
          </p>
        </div>
      </div>

      {/* ===== RANGE TABS ===== */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-1.5 inline-flex flex-wrap gap-1 shadow-sm">
        {RANGE_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setRange(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              range === t.key
                ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                : 'text-gray-600 hover:bg-rose-500 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== STATS — 3 ô màu ===== */}
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
          color="rose"
        />
      </div>

      {/* ===== REFUND PENDING ===== */}
      {refundable.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-amber-800 mb-3 flex items-center gap-2">
            💸 Ca cần hoàn tiền ({refundable.length})
          </p>
          <div className="space-y-2">
            {refundable.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-xl p-3 flex items-center justify-between gap-3 border-2 border-amber-200"
              >
                <div>
                  <p className="text-sm font-bold text-gray-800">
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
                  className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-md shadow-rose-200"
                >
                  💸 Hoàn tiền
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== TABS ===== */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-1.5 inline-flex gap-1 shadow-sm">
        <button
          onClick={() => setTab('bookings')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
            tab === 'bookings'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
              : 'text-gray-600 hover:bg-rose-500 hover:text-white'
          }`}
        >
          📋 Ca đã đặt ({bookingList.length})
        </button>
        <button
          onClick={() => setTab('transactions')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
            tab === 'transactions'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
              : 'text-gray-600 hover:bg-rose-500 hover:text-white'
          }`}
        >
          💳 Lịch sử giao dịch ({txnList.length})
        </button>
      </div>

      {/* ===== TAB: DANH SÁCH CA ĐẶT LỊCH ===== */}
      {tab === 'bookings' && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm">
          <div className="px-5 py-3 bg-teal-50 border-b-2 border-teal-100">
            <p className="font-bold text-teal-700 flex items-center gap-2">
              📋 Tất cả ca đã đặt ({bookingList.length})
            </p>
            <p className="text-xs text-teal-600 mt-0.5">
              Chỉ hiển thị các ca đã thanh toán phí gói cơ bản
            </p>
          </div>

          {bookingList.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-gray-500 text-sm font-medium">
                Chưa có ca nào
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-teal-50 border-b-2 border-teal-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-bold text-teal-700">
                      Mã ca
                    </th>
                    <th className="text-left px-4 py-3 font-bold text-teal-700">
                      Khách hàng
                    </th>
                    <th className="text-left px-4 py-3 font-bold text-teal-700">
                      Y tá
                    </th>
                    <th className="text-left px-4 py-3 font-bold text-teal-700">
                      Bệnh viện
                    </th>
                    <th className="text-left px-4 py-3 font-bold text-teal-700">
                      Ngày đặt
                    </th>
                    <th className="text-right px-4 py-3 font-bold text-teal-700">
                      Phí gói
                    </th>
                    <th className="text-right px-4 py-3 font-bold text-teal-700">
                      Phụ phí
                    </th>
                    <th className="text-left px-4 py-3 font-bold text-teal-700">
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
                      <tr key={b.id} className="hover:bg-teal-50/30 transition">
                        <td className="px-4 py-3 font-mono text-xs text-teal-700 font-bold">
                          {b.id}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {patient?.avatar ? (
                              <img
                                src={patient.avatar}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover border-2 border-teal-200"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                                {patient?.name?.charAt(0)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-gray-800 text-xs truncate">
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
                              className="w-7 h-7 rounded-full object-cover border-2 border-teal-200"
                            />
                            <span className="text-xs text-gray-700 font-medium">
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
                        <td className="px-4 py-3 text-right font-bold text-teal-700 text-xs">
                          {b.amount?.toLocaleString('vi-VN')}đ
                        </td>
                        <td className="px-4 py-3 text-right text-xs">
                          {hasOvertime ? (
                            <span className="font-bold text-amber-600">
                              +{b.overtimeAmount?.toLocaleString('vi-VN')}đ
                            </span>
                          ) : b.overtimePaymentStatus === 'unpaid' ? (
                            <span className="text-[10px] text-amber-600 italic font-semibold">
                              Chưa TT
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-[10px] px-2 py-1 rounded-full border-2 font-bold whitespace-nowrap ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Footer tổng */}
                <tfoot className="bg-teal-50 border-t-2 border-teal-100">
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-3 text-right font-bold text-teal-700 text-sm"
                    >
                      TỔNG CỘNG
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-teal-700 text-sm">
                      {totals.base.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-amber-600 text-sm">
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

      {/* ===== TAB: LỊCH SỬ GIAO DỊCH ===== */}
      {tab === 'transactions' && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm">
          <div className="px-5 py-3 bg-teal-50 border-b-2 border-teal-100">
            <p className="font-bold text-teal-700 flex items-center gap-2">
              💳 Lịch sử giao dịch VNPay ({txnList.length})
            </p>
          </div>

          {txnList.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-2">💳</div>
              <p className="text-gray-500 text-sm font-medium">
                Chưa có giao dịch
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-teal-50 border-b-2 border-teal-100">
                <tr>
                  <th className="text-left px-4 py-3 font-bold text-teal-700">
                    Mã GD
                  </th>
                  <th className="text-left px-4 py-3 font-bold text-teal-700">
                    Ca khám
                  </th>
                  <th className="text-left px-4 py-3 font-bold text-teal-700">
                    Loại
                  </th>
                  <th className="text-right px-4 py-3 font-bold text-teal-700">
                    Số tiền
                  </th>
                  <th className="text-left px-4 py-3 font-bold text-teal-700">
                    Ngày
                  </th>
                  <th className="text-left px-4 py-3 font-bold text-teal-700">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {txnList.map((t) => (
                  <tr key={t.id} className="hover:bg-teal-50/30 transition">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {t.id}
                    </td>
                    <td className="px-4 py-3 text-gray-800 font-semibold">
                      {t.bookingId}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold border-2 ${
                          t.type === 'base'
                            ? 'bg-teal-50 text-teal-700 border-teal-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {t.type === 'base' ? '💵 Phí gói' : '⚡ Phụ phí'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-rose-600">
                      {t.amount.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {t.date}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-teal-100 text-teal-700 border-2 border-teal-200 px-2 py-1 rounded-full font-bold">
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
    teal: { text: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
    orange: { text: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    rose: { text: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
  };
  const c = colorMap[color] || colorMap.teal;

  return (
    <div className={`rounded-2xl border-2 p-5 shadow-sm ${c.bg}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <p className="text-xs text-gray-600 font-semibold">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${c.text}`}>
        {value.toLocaleString('vi-VN')}đ
      </p>
    </div>
  );
}