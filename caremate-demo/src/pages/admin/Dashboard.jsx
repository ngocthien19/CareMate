// src/pages/admin/Dashboard.jsx
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { HOSPITALS } from '../../mock';
import Modal from '../../components/Modal';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const {
    bookings,
    patients,
    nurses,
    updateBooking,
    sosAlerts,
    resolveSOS,
  } = useStore();

  const [now, setNow] = useState(Date.now());
  const [reassignModal, setReassignModal] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Update timer mỗi 5s
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  // TẤT CẢ ca khám — sort theo createdAt mới nhất
  const allBookings = useMemo(
    () =>
      [...bookings].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      ),
    [bookings]
  );

  // Filter theo trạng thái
  const filtered = useMemo(() => {
    if (statusFilter === 'all') return allBookings;
    if (statusFilter === 'active')
      return allBookings.filter(
        (b) => b.status !== 'completed' && b.status !== 'confirmed'
      );
    if (statusFilter === 'confirmed')
      return allBookings.filter((b) => b.status === 'confirmed');
    if (statusFilter === 'completed')
      return allBookings.filter((b) => b.status === 'completed');
    return allBookings;
  }, [allBookings, statusFilter]);

  // Ca đang diễn ra (dùng cho stats)
  const active = allBookings.filter(
    (b) => b.status !== 'completed' && b.status !== 'confirmed'
  );
  const waiting = allBookings.filter((b) => b.status === 'confirmed');
  const completed = allBookings.filter((b) => b.status === 'completed');
  const overtimeList = active.filter((b) => {
    if (!b.startTime) return false;
    return (now - b.startTime) / 3600000 > 4;
  });

  // SOS chưa xử lý
  const activeSOS = sosAlerts.filter((a) => !a.resolved);

  const FILTER_TABS = [
    {
      key: 'all',
      labelKey: 'adminDashboard.filterAll',
      count: allBookings.length,
    },
    {
      key: 'active',
      labelKey: 'adminDashboard.filterActive',
      count: active.length,
    },
    {
      key: 'confirmed',
      labelKey: 'adminDashboard.filterWaiting',
      count: waiting.length,
    },
    {
      key: 'completed',
      labelKey: 'adminDashboard.filterCompleted',
      count: completed.length,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* ===== HEADER ===== */}
      <div className="relative rounded-2xl overflow-hidden bg-teal-600 p-6 shadow-lg">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-400/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-400/10 rounded-full blur-3xl" />

        <div className="relative flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-pulse" />
              <span className="text-[10px] font-semibold text-white">
                {t('adminDashboard.headerBadge')}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              📊 {t('adminDashboard.headerTitle')}
            </h1>
            <p className="text-sm text-teal-50 mt-1">
              {t('adminDashboard.headerSubtitle')}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2 text-right">
            <p className="text-[10px] text-teal-50 font-semibold">
              {t('adminDashboard.activeLabel')}
            </p>
            <p className="text-3xl font-bold text-white leading-none">
              {active.length}
            </p>
          </div>
        </div>
      </div>

      {/* ===== CẢNH BÁO SOS ===== */}
      {activeSOS.length > 0 && (
        <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-5 shadow-lg shadow-red-100">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl animate-pulse">🚨</span>
            <div className="flex-1">
              <p className="font-bold text-red-700 text-lg">
                {t('adminDashboard.sosTitle', { count: activeSOS.length })}
              </p>
              <p className="text-xs text-red-600 mt-0.5 font-semibold">
                {t('adminDashboard.sosSubtitle')}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {activeSOS.map((s) => (
              <SOSCard
                key={s.id}
                sos={s}
                onResolve={() => {
                  resolveSOS(s.id);
                  toast.success(t('adminDashboard.sosResolved'));
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard
          label={t('adminDashboard.statTotal')}
          value={allBookings.length}
          icon="📋"
          color="gray"
        />
        <StatCard
          label={t('adminDashboard.statActive')}
          value={active.length}
          icon="🟢"
          color="teal"
        />
        <StatCard
          label={t('adminDashboard.statWaiting')}
          value={waiting.length}
          icon="⏳"
          color="blue"
        />
        <StatCard
          label={t('adminDashboard.statOvertime')}
          value={overtimeList.length}
          icon="⚠️"
          color="orange"
        />
        <StatCard
          label={t('adminDashboard.statSos')}
          value={activeSOS.length}
          icon="🚨"
          color="red"
        />
      </div>

      {/* ===== FILTER TABS ===== */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-1.5 inline-flex flex-wrap gap-1 shadow-sm">
        {FILTER_TABS.map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setStatusFilter(tabItem.key)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${
              statusFilter === tabItem.key
                ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                : 'text-gray-600 hover:bg-rose-500 hover:text-white'
            }`}
          >
            {t(tabItem.labelKey)}
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                statusFilter === tabItem.key
                  ? 'bg-white/25 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {tabItem.count}
            </span>
          </button>
        ))}
      </div>

      {/* ===== BẢNG TẤT CẢ CA KHÁM ===== */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm">
        <div className="px-5 py-3 bg-teal-50 border-b-2 border-teal-100 flex items-center justify-between flex-wrap gap-2">
          <p className="font-bold text-teal-700 flex items-center gap-2">
            📋 {t('adminDashboard.listTitle', { count: filtered.length })}
          </p>
          <p className="text-xs text-teal-600 bg-white border border-teal-200 px-2.5 py-1 rounded-full font-semibold">
            {t('adminDashboard.listAutoUpdate')}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-gray-500 text-sm font-medium">
              {t('adminDashboard.listEmpty')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((b) => (
              <BookingRow
                key={b.id}
                booking={b}
                now={now}
                patient={patients.find((p) => p.id === b.patientId)}
                nurse={nurses.find((n) => n.id === b.nurseId)}
                hospital={HOSPITALS.find((h) => h.id === b.hospitalId)}
                onReassign={() => setReassignModal(b)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ===== MODAL RE-ASSIGN ===== */}
      <Modal
        open={!!reassignModal}
        onClose={() => setReassignModal(null)}
        title={t('adminDashboard.reassignModalTitle')}
        maxWidth="max-w-md"
      >
        {reassignModal && (
          <ReassignForm
            booking={reassignModal}
            nurses={nurses.filter((n) => n.id !== reassignModal.nurseId)}
            onSave={(newNurseId) => {
              updateBooking(reassignModal.id, { nurseId: newNurseId });
              toast.success(t('adminDashboard.reassignSuccess'));
              setReassignModal(null);
            }}
            onCancel={() => setReassignModal(null)}
          />
        )}
      </Modal>
    </div>
  );
}

// ===== StatCard =====
function StatCard({ label, value, icon, color }) {
  const colorMap = {
    gray: { text: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' },
    teal: { text: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
    blue: { text: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    orange: { text: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
    red: { text: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  };

  const c = colorMap[color] || colorMap.gray;

  return (
    <div className={`rounded-2xl border-2 p-4 shadow-sm ${c.bg}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-2xl">{icon}</span>
        <span className={`text-2xl font-bold ${c.text}`}>{value}</span>
      </div>
      <p className="text-xs text-gray-600 font-semibold">{label}</p>
    </div>
  );
}

// ===== BookingRow =====
function BookingRow({ booking, now, patient, nurse, hospital, onReassign }) {
  const { t } = useTranslation();
  const elapsed = booking.startTime
    ? (now - booking.startTime) / 3600000
    : 0;
  const isOT = elapsed > 4;
  const h = Math.floor(elapsed);
  const m = Math.floor((elapsed % 1) * 60);
  const overtimeMinutes = Math.max(0, Math.floor(elapsed * 60 - 4 * 60));
  const fee = overtimeMinutes * 2000;

  const hospitalName = booking.hospitalName || hospital?.name || '—';

  const STATUS_COLOR = {
    confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
    picking_up: 'bg-teal-100 text-teal-700 border-teal-200',
    at_hospital: 'bg-teal-100 text-teal-700 border-teal-200',
    examining: 'bg-teal-100 text-teal-700 border-teal-200',
    done_exam: 'bg-amber-100 text-amber-700 border-amber-200',
    completed: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const statusColor =
    STATUS_COLOR[booking.status] || STATUS_COLOR.confirmed;
  const statusLabel = t(`common.status.${booking.status}`);
  const isCompleted = booking.status === 'completed';

  return (
    <div className="px-5 py-3 flex items-center justify-between gap-3 flex-wrap hover:bg-teal-50/40 transition">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {patient?.avatar ? (
          <img
            src={patient.avatar}
            alt=""
            className="w-10 h-10 rounded-full object-cover border-2 border-teal-200 ring-2 ring-teal-50"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">
            {patient?.name?.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate">
            {patient?.name}{' '}
            <span className="text-xs text-gray-400 font-normal">
              #{booking.id}
            </span>
          </p>
          <p className="text-xs text-gray-500 truncate">
            🏥 {hospitalName} • 👩‍⚕️ {nurse?.name}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`text-xs px-2 py-1 rounded-full border-2 font-semibold whitespace-nowrap ${statusColor}`}
        >
          {statusLabel}
        </span>

        {/* Timer: chỉ hiện khi đang chạy */}
        {booking.startTime && !isCompleted && (
          <div className="text-right">
            <p
              className={`text-sm font-mono font-bold ${
                isOT ? 'text-orange-600' : 'text-teal-700'
              }`}
            >
              {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}
            </p>
            {isOT && (
              <p className="text-[10px] text-orange-600 font-bold">
                +{fee.toLocaleString('vi-VN')}đ ({overtimeMinutes}p)
              </p>
            )}
          </div>
        )}

        {/* Hiện duration cho ca hoàn tất */}
        {isCompleted && booking.startTime && booking.endTime && (
          <div className="text-right">
            <p className="text-sm font-mono font-bold text-gray-600">
              {(() => {
                const total = (booking.endTime - booking.startTime) / 3600000;
                const hh = Math.floor(total);
                const mm = Math.floor((total % 1) * 60);
                return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
              })()}
            </p>
            <p className="text-[10px] text-gray-500 font-semibold">
              {t('adminDashboard.durationLabel')}
            </p>
          </div>
        )}

        {/* Nút đổi y tá */}
        {!isCompleted && (
          <button
            onClick={onReassign}
            className="text-xs text-white font-bold bg-rose-500 hover:bg-rose-600 px-3 py-1.5 rounded-lg transition shadow-md shadow-rose-200"
          >
            🔄 {t('adminDashboard.changeNurseBtn')}
          </button>
        )}
      </div>
    </div>
  );
}

// ===== SOSCard =====
function SOSCard({ sos, onResolve }) {
  const { t } = useTranslation();
  const timeStr = new Date(sos.time).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const minutesAgo = Math.floor((Date.now() - new Date(sos.time)) / 60000);

  return (
    <div className="bg-white border-2 border-red-300 rounded-2xl overflow-hidden shadow-md">
      <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="animate-pulse">🔴</span>
          <span className="font-bold text-sm">SOS • Ca {sos.bookingId}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span>🕒 {timeStr}</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full font-semibold">
            {minutesAgo < 1
              ? t('adminDashboard.sosCard.justNow')
              : t('adminDashboard.sosCard.minutesAgo', { count: minutesAgo })}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <p className="text-xs text-red-600 font-bold mb-2 uppercase">
            👤 {t('adminDashboard.sosCard.patientSection')}
          </p>
          <div className="flex items-center gap-3">
            {sos.patientAvatar ? (
              <img
                src={sos.patientAvatar}
                alt={sos.patientName}
                className="w-14 h-14 rounded-full object-cover border-2 border-red-200"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xl">
                {sos.patientName?.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800">
                {sos.patientName || '—'}
                {sos.patientRelation && (
                  <span className="text-sm text-gray-500 font-normal">
                    {' '}
                    ({sos.patientRelation})
                  </span>
                )}
              </p>
              {sos.patientPhone && (
                <a
                  href={`tel:${sos.patientPhone}`}
                  className="text-sm font-bold text-rose-600 hover:underline flex items-center gap-1 mt-0.5"
                >
                  📞 {sos.patientPhone}
                </a>
              )}
              {sos.patientBhkyt && (
                <p className="text-xs text-gray-500 mt-0.5">
                  🆔 {t('adminDashboard.sosCard.bhytPrefix')} {sos.patientBhkyt}
                </p>
              )}
            </div>
          </div>

          {(sos.patientAllergies?.length > 0 ||
            sos.patientConditions?.length > 0) && (
            <div className="mt-3 space-y-1.5">
              {sos.patientAllergies?.length > 0 && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg px-3 py-2">
                  <p className="text-xs text-red-700 font-bold">
                    🚨 {t('adminDashboard.sosCard.allergyPrefix')}{' '}
                    {sos.patientAllergies
                      .map((a) =>
                        t(`patients.allergies.${a}`, { defaultValue: a })
                      )
                      .join(', ')}
                  </p>
                </div>
              )}
              {sos.patientConditions?.length > 0 && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg px-3 py-2">
                  <p className="text-xs text-amber-700 font-bold">
                    ⚠️ {t('adminDashboard.sosCard.conditionPrefix')}{' '}
                    {sos.patientConditions
                      .map((c) =>
                        t(`patients.conditions.${c}`, { defaultValue: c })
                      )
                      .join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-teal-600 font-bold mb-2 uppercase">
            👩‍⚕️ {t('adminDashboard.sosCard.nurseSection')}
          </p>
          <div className="flex items-center gap-3">
            {sos.nurseAvatar ? (
              <img
                src={sos.nurseAvatar}
                alt={sos.nurseName}
                className="w-10 h-10 rounded-full object-cover border-2 border-teal-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">
                {sos.nurseName?.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 text-sm">
                {sos.nurseName || '—'}
              </p>
              {sos.nursePhone && (
                <a
                  href={`tel:${sos.nursePhone}`}
                  className="text-xs text-teal-600 hover:underline font-semibold"
                >
                  📞 {sos.nursePhone}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-teal-50 border border-teal-100">
            <p className="text-teal-600 font-semibold mb-0.5">
              🏥 {t('adminDashboard.sosCard.hospitalTo')}
            </p>
            <p className="font-bold text-gray-800">
              {sos.hospitalName || '—'}
            </p>
            {sos.hospitalAddress && (
              <p className="text-gray-500 mt-0.5">{sos.hospitalAddress}</p>
            )}
          </div>
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-100">
            <p className="text-rose-600 font-semibold mb-0.5">
              📍 {t('adminDashboard.sosCard.pickupPoint')}
            </p>
            <p className="font-bold text-gray-800">
              {sos.pickupAddress || '—'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
            <p className="text-amber-600 font-semibold mb-0.5">
              📊 {t('adminDashboard.sosCard.caseStatus')}
            </p>
            <p className="font-bold text-gray-800">
              {t(`common.status.${sos.status}`)}
            </p>
          </div>
          {sos.bookingStartTime && (
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-gray-600 font-semibold mb-0.5">
                ⏱ {t('adminDashboard.sosCard.servedTime')}
              </p>
              <p className="font-bold text-gray-800 font-mono">
                {(() => {
                  const h = Math.floor(
                    (Date.now() - sos.bookingStartTime) / 3600000
                  );
                  const m = Math.floor(
                    ((Date.now() - sos.bookingStartTime) % 3600000) / 60000
                  );
                  return `${h}h ${m}p`;
                })()}
              </p>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-gray-100 flex gap-2 flex-wrap">
          {sos.patientPhone && (
            <a
              href={`tel:${sos.patientPhone}`}
              className="flex-1 min-w-[140px] bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold py-2.5 px-4 rounded-lg transition text-center shadow-md shadow-teal-200"
            >
              📞 {t('adminDashboard.sosCard.callFamily')}
            </a>
          )}
          {sos.nursePhone && (
            <a
              href={`tel:${sos.nursePhone}`}
              className="flex-1 min-w-[140px] bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold py-2.5 px-4 rounded-lg transition text-center shadow-md shadow-rose-200"
            >
              📞 {t('adminDashboard.sosCard.callNurse')}
            </a>
          )}
          <button
            onClick={onResolve}
            className="flex-1 min-w-[140px] bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2.5 px-4 rounded-lg transition shadow-md shadow-red-300"
          >
            ✓ {t('adminDashboard.sosCard.resolvedBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Reassign Form =====
function ReassignForm({ booking, nurses, onSave, onCancel }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(null);

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-3 text-xs text-amber-700">
        ⚠️ {t('adminDashboard.reassignWarning', { id: booking.id })}
      </div>

      <p className="text-sm font-bold text-gray-700">
        {t('adminDashboard.reassignSelectLabel')}
      </p>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {nurses.map((n) => (
          <button
            key={n.id}
            onClick={() => setSelected(n.id)}
            className={`w-full p-3 rounded-xl border-2 text-left transition flex items-center gap-3 ${
              selected === n.id
                ? 'border-rose-400 bg-rose-50'
                : 'border-gray-200 hover:bg-rose-500 hover:text-white hover:border-rose-500'
            }`}
          >
            <img
              src={n.avatar}
              alt={n.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-teal-200"
            />
            <div className="flex-1 min-w-0">
              <p
                className={`font-bold text-sm ${
                  selected === n.id ? 'text-gray-800' : ''
                }`}
              >
                {n.name}
              </p>
              <p
                className={`text-xs ${
                  selected === n.id ? 'text-gray-500' : 'opacity-80'
                }`}
              >
                {n.exp} {t('adminDashboard.yearsExpShort')} • ⭐{' '}
                {n.rating?.toFixed(1)}
              </p>
            </div>
            {selected === n.id && (
              <span className="text-rose-500 font-bold">✓</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
        >
          {t('common.cancel')}
        </button>
        <button
          onClick={() => selected && onSave(selected)}
          disabled={!selected}
          className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50 shadow-md shadow-rose-200"
        >
          {t('adminDashboard.reassignConfirmBtn')}
        </button>
      </div>
    </div>
  );
}