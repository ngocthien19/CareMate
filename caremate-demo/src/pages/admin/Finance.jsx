// src/pages/admin/Finance.jsx
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { HOSPITALS, NURSES } from '../../mock';

const RANGE_TABS = [
  { key: 'day', labelKey: 'adminFinance.rangeToday' },
  { key: 'week', labelKey: 'adminFinance.rangeWeek' },
  { key: 'month', labelKey: 'adminFinance.rangeMonth' },
  { key: 'all', labelKey: 'adminFinance.rangeAll' },
];

const STATUS_COLOR = {
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  picking_up: 'bg-teal-100 text-teal-700 border-teal-200',
  at_hospital: 'bg-teal-100 text-teal-700 border-teal-200',
  examining: 'bg-teal-100 text-teal-700 border-teal-200',
  done_exam: 'bg-amber-100 text-amber-700 border-amber-200',
  completed: 'bg-gray-100 text-gray-700 border-gray-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

export default function AdminFinance() {
  const { t } = useTranslation();
  const { bookings, patients, transactions, updateBooking } = useStore();
  const [range, setRange] = useState('all');
  const [tab, setTab] = useState('bookings');

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

  const txnList = useMemo(
    () =>
      transactions
        .map((txn) => ({
          ...txn,
          booking: bookings.find((b) => b.id === txn.bookingId),
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [transactions, bookings]
  );

  const refundable = bookings.filter(
    (b) => b.status === 'cancelled' && b.refundStatus !== 'refunded'
  );

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* ===== HEADER ===== */}
      <div className="relative rounded-2xl overflow-hidden bg-teal-600 p-5 md:p-6 shadow-lg">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-400/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-400/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-pulse" />
            <span className="text-[10px] font-semibold text-white">
              {t('adminFinance.headerBadge')}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white">
            💵 {t('adminFinance.headerTitle')}
          </h1>
          <p className="text-xs md:text-sm text-teal-50 mt-1">
            {t('adminFinance.headerSubtitle')}
          </p>
        </div>
      </div>

      {/* ===== RANGE TABS ===== */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-1.5 inline-flex flex-wrap gap-1 shadow-sm">
        {RANGE_TABS.map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setRange(tabItem.key)}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition ${
              range === tabItem.key
                ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                : 'text-gray-600 hover:bg-rose-500 hover:text-white'
            }`}
          >
            {t(tabItem.labelKey)}
          </button>
        ))}
      </div>

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatBox
          label={t('adminFinance.statBaseFee')}
          value={totals.base}
          icon="💵"
          color="teal"
        />
        <StatBox
          label={t('adminFinance.statOvertimeFee')}
          value={totals.overtime}
          icon="⚡"
          color="orange"
        />
        <StatBox
          label={t('adminFinance.statTotalRevenue')}
          value={totals.grand}
          icon="💰"
          color="rose"
        />
      </div>

      {/* ===== REFUND PENDING ===== */}
      {refundable.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-amber-800 mb-3 flex items-center gap-2 text-sm md:text-base">
            💸 {t('adminFinance.refundTitle', { count: refundable.length })}
          </p>
          <div className="space-y-2">
            {refundable.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-2 border-amber-200"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {t('adminFinance.refundCase', { id: b.id })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {b.date} • {b.amount?.toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <button
                  onClick={() => {
                    updateBooking(b.id, { refundStatus: 'refunded' });
                    toast.success(t('adminFinance.refundSuccess'));
                  }}
                  className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-md shadow-rose-200 w-full sm:w-auto whitespace-nowrap"
                >
                  💸 {t('adminFinance.refundBtn')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== TABS ===== */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-1.5 inline-flex gap-1 shadow-sm flex-wrap">
        <button
          onClick={() => setTab('bookings')}
          className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition ${
            tab === 'bookings'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
              : 'text-gray-600 hover:bg-rose-500 hover:text-white'
          }`}
        >
          📋 {t('adminFinance.tabBookings', { count: bookingList.length })}
        </button>
        <button
          onClick={() => setTab('transactions')}
          className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition ${
            tab === 'transactions'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
              : 'text-gray-600 hover:bg-rose-500 hover:text-white'
          }`}
        >
          💳 {t('adminFinance.tabTransactions', { count: txnList.length })}
        </button>
      </div>

      {/* ===== TAB: DANH SÁCH CA ĐẶT LỊCH ===== */}
      {tab === 'bookings' && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm">
          <div className="px-4 md:px-5 py-3 bg-teal-50 border-b-2 border-teal-100">
            <p className="font-bold text-teal-700 flex items-center gap-2 text-sm md:text-base">
              📋{' '}
              {t('adminFinance.bookingsHeader', {
                count: bookingList.length,
              })}
            </p>
            <p className="text-xs text-teal-600 mt-0.5">
              {t('adminFinance.bookingsSubheader')}
            </p>
          </div>

          {bookingList.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-gray-500 text-sm font-medium">
                {t('adminFinance.bookingsEmpty')}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[900px]">
                  <thead className="bg-teal-50 border-b-2 border-teal-100">
                    <tr>
                      <th className="text-left px-3 md:px-4 py-3 font-bold text-teal-700 whitespace-nowrap">
                        {t('adminFinance.tableOrderId')}
                      </th>
                      <th className="text-left px-3 md:px-4 py-3 font-bold text-teal-700 whitespace-nowrap">
                        {t('adminFinance.tableCustomer')}
                      </th>
                      <th className="text-left px-3 md:px-4 py-3 font-bold text-teal-700 whitespace-nowrap">
                        {t('adminFinance.tableNurse')}
                      </th>
                      <th className="text-left px-3 md:px-4 py-3 font-bold text-teal-700 whitespace-nowrap">
                        {t('adminFinance.tableHospital')}
                      </th>
                      <th className="text-left px-3 md:px-4 py-3 font-bold text-teal-700 whitespace-nowrap">
                        {t('adminFinance.tableCreatedAt')}
                      </th>
                      <th className="text-right px-3 md:px-4 py-3 font-bold text-teal-700 whitespace-nowrap">
                        {t('adminFinance.tableBasePrice')}
                      </th>
                      <th className="text-right px-3 md:px-4 py-3 font-bold text-teal-700 whitespace-nowrap">
                        {t('adminFinance.tableOvertimePrice')}
                      </th>
                      <th className="text-left px-3 md:px-4 py-3 font-bold text-teal-700 whitespace-nowrap">
                        {t('adminFinance.tableStatus')}
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
                      const statusColor =
                        STATUS_COLOR[b.status] || STATUS_COLOR.confirmed;
                      const statusLabel = t(`common.status.${b.status}`);
                      const hasOvertime = b.overtimePaymentStatus === 'paid';

                      const hospitalName =
                        b.hospitalName || hospital?.name || '—';

                      const relationLabel = patient?.relation
                        ? t(`patients.relations.${patient.relation}`, {
                            defaultValue: patient.relation,
                          })
                        : '';

                      return (
                        <tr
                          key={b.id}
                          className="hover:bg-teal-50/30 transition"
                        >
                          <td className="px-3 md:px-4 py-3 font-mono text-xs text-teal-700 font-bold whitespace-nowrap">
                            {b.id}
                          </td>
                          <td className="px-3 md:px-4 py-3">
                            <div className="flex items-center gap-2">
                              {patient?.avatar ? (
                                <img
                                  src={patient.avatar}
                                  alt=""
                                  className="w-8 h-8 rounded-full object-cover border-2 border-teal-200 shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                  {patient?.name?.charAt(0)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-bold text-gray-800 text-xs truncate">
                                  {patient?.name}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  {relationLabel}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 md:px-4 py-3">
                            <div className="flex items-center gap-2">
                              <img
                                src={nurse?.avatar}
                                alt=""
                                className="w-7 h-7 rounded-full object-cover border-2 border-teal-200 shrink-0"
                              />
                              <span className="text-xs text-gray-700 font-medium whitespace-nowrap">
                                {nurse?.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 md:px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                            {hospitalName}
                          </td>
                          <td className="px-3 md:px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                            {b.createdAt
                              ? new Date(b.createdAt).toLocaleDateString(
                                  'vi-VN'
                                )
                              : '—'}
                          </td>
                          <td className="px-3 md:px-4 py-3 text-right font-bold text-teal-700 text-xs whitespace-nowrap">
                            {b.amount?.toLocaleString('vi-VN')}đ
                          </td>
                          <td className="px-3 md:px-4 py-3 text-right text-xs whitespace-nowrap">
                            {hasOvertime ? (
                              <span className="font-bold text-amber-600">
                                +{b.overtimeAmount?.toLocaleString('vi-VN')}đ
                              </span>
                            ) : b.overtimePaymentStatus === 'unpaid' ? (
                              <span className="text-[10px] text-amber-600 italic font-semibold">
                                {t('adminFinance.overtimeUnpaid')}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-3 md:px-4 py-3">
                            <span
                              className={`text-[10px] px-2 py-1 rounded-full border-2 font-bold whitespace-nowrap inline-block ${statusColor}`}
                            >
                              {statusLabel}
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
                        className="px-3 md:px-4 py-3 text-right font-bold text-teal-700 text-sm"
                      >
                        {t('adminFinance.tableTotal')}
                      </td>
                      <td className="px-3 md:px-4 py-3 text-right font-bold text-teal-700 text-sm whitespace-nowrap">
                        {totals.base.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-3 md:px-4 py-3 text-right font-bold text-amber-600 text-sm whitespace-nowrap">
                        {totals.overtime > 0
                          ? `+${totals.overtime.toLocaleString('vi-VN')}đ`
                          : '—'}
                      </td>
                      <td className="px-3 md:px-4 py-3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Hint scroll trên mobile */}
              <div className="sm:hidden bg-teal-50 border-t-2 border-teal-100 px-4 py-2 text-center">
                <p className="text-[10px] text-teal-600 font-semibold">
                  {t('adminFinance.scrollHint')}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== TAB: LỊCH SỬ GIAO DỊCH ===== */}
      {tab === 'transactions' && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm">
          <div className="px-4 md:px-5 py-3 bg-teal-50 border-b-2 border-teal-100">
            <p className="font-bold text-teal-700 flex items-center gap-2 text-sm md:text-base">
              💳 {t('adminFinance.transactionsHeader', { count: txnList.length })}
            </p>
          </div>

          {txnList.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-2">💳</div>
              <p className="text-gray-500 text-sm font-medium">
                {t('adminFinance.transactionsEmpty')}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead className="bg-teal-50 border-b-2 border-teal-100">
                    <tr>
                      <th className="text-left px-3 md:px-4 py-3 font-bold text-teal-700 whitespace-nowrap">
                        {t('adminFinance.tableTxnId')}
                      </th>
                      <th className="text-left px-3 md:px-4 py-3 font-bold text-teal-700 whitespace-nowrap">
                        {t('adminFinance.tableTxnBooking')}
                      </th>
                      <th className="text-left px-3 md:px-4 py-3 font-bold text-teal-700 whitespace-nowrap">
                        {t('adminFinance.tableTxnType')}
                      </th>
                      <th className="text-right px-3 md:px-4 py-3 font-bold text-teal-700 whitespace-nowrap">
                        {t('adminFinance.tableTxnAmount')}
                      </th>
                      <th className="text-left px-3 md:px-4 py-3 font-bold text-teal-700 whitespace-nowrap">
                        {t('adminFinance.tableTxnDate')}
                      </th>
                      <th className="text-left px-3 md:px-4 py-3 font-bold text-teal-700 whitespace-nowrap">
                        {t('adminFinance.tableTxnStatus')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {txnList.map((txn) => (
                      <tr
                        key={txn.id}
                        className="hover:bg-teal-50/30 transition"
                      >
                        <td className="px-3 md:px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">
                          {txn.id}
                        </td>
                        <td className="px-3 md:px-4 py-3 text-gray-800 font-semibold whitespace-nowrap">
                          {txn.bookingId}
                        </td>
                        <td className="px-3 md:px-4 py-3">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-bold border-2 whitespace-nowrap inline-block ${
                              txn.type === 'base'
                                ? 'bg-teal-50 text-teal-700 border-teal-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {txn.type === 'base'
                              ? `💵 ${t('adminFinance.txnTypeBase')}`
                              : `⚡ ${t('adminFinance.txnTypeOvertime')}`}
                          </span>
                        </td>
                        <td className="px-3 md:px-4 py-3 text-right font-bold text-rose-600 whitespace-nowrap">
                          {txn.amount.toLocaleString('vi-VN')}đ
                        </td>
                        <td className="px-3 md:px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {txn.date}
                        </td>
                        <td className="px-3 md:px-4 py-3">
                          <span className="text-xs bg-teal-100 text-teal-700 border-2 border-teal-200 px-2 py-1 rounded-full font-bold whitespace-nowrap inline-block">
                            ✓ {t('adminFinance.txnSuccess')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Hint scroll trên mobile */}
              <div className="sm:hidden bg-teal-50 border-t-2 border-teal-100 px-4 py-2 text-center">
                <p className="text-[10px] text-teal-600 font-semibold">
                  {t('adminFinance.scrollHint')}
                </p>
              </div>
            </>
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
    <div className={`rounded-2xl border-2 p-4 md:p-5 shadow-sm ${c.bg}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl md:text-2xl">{icon}</span>
        <p className="text-xs text-gray-600 font-semibold">{label}</p>
      </div>
      <p className={`text-xl md:text-2xl font-bold ${c.text}`}>
        {value.toLocaleString('vi-VN')}đ
      </p>
    </div>
  );
}