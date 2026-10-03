// src/pages/admin/Dashboard.jsx
import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { HOSPITALS } from '../../mock';
import Modal from '../../components/Modal';

export default function AdminDashboard() {
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
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);

  // 👇 TẤT CẢ ca khám — sort theo createdAt mới nhất
  const allBookings = useMemo(
    () =>
      [...bookings].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      ),
    [bookings]
  );

  // 👇 Filter theo trạng thái
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
    { key: 'all', label: 'Tất cả', count: allBookings.length },
    { key: 'active', label: 'Đang diễn ra', count: active.length },
    { key: 'confirmed', label: 'Chờ bắt đầu', count: waiting.length },
    { key: 'completed', label: 'Đã hoàn tất', count: completed.length },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Giám sát ca khám
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Theo dõi toàn bộ ca khám tại TP.HCM
        </p>
      </div>

      {/* Cảnh báo SOS */}
      {activeSOS.length > 0 && (
        <div className="bg-red-50 border-2 border-red-400 rounded-xl p-5">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl animate-pulse">🚨</span>
            <div className="flex-1">
              <p className="font-bold text-red-700 text-lg">
                CẢNH BÁO SOS ({activeSOS.length})
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                Y tá cần hỗ trợ khẩn cấp — Liên hệ ngay lập tức
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
                  toast.success('Đã đánh dấu xử lý SOS');
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard
          label="Tổng ca"
          value={allBookings.length}
          icon="📋"
          color="gray"
        />
        <StatCard
          label="Đang diễn ra"
          value={active.length}
          icon="🟢"
          color="teal"
        />
        <StatCard
          label="Chờ bắt đầu"
          value={waiting.length}
          icon="⏳"
          color="blue"
        />
        <StatCard
          label="Vượt 4h"
          value={overtimeList.length}
          icon="⚠️"
          color="orange"
        />
        <StatCard
          label="SOS chưa xử lý"
          value={activeSOS.length}
          icon="🚨"
          color="red"
        />
      </div>

      {/* Filter tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-1.5 inline-flex flex-wrap gap-1">
        {FILTER_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setStatusFilter(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
              statusFilter === t.key
                ? 'bg-teal-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.label}
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                statusFilter === t.key
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* 👇 Bảng TẤT CẢ ca khám */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b flex items-center justify-between">
          <p className="font-bold text-gray-800">
            📋 Danh sách ca khám ({filtered.length})
          </p>
          <p className="text-xs text-gray-500">
            Tự động cập nhật mỗi 5 giây
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            Không có ca nào
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

      {/* Modal Re-assign */}
      <Modal
        open={!!reassignModal}
        onClose={() => setReassignModal(null)}
        title="Gán lại Y tá phụ trách"
        maxWidth="max-w-md"
      >
        {reassignModal && (
          <ReassignForm
            booking={reassignModal}
            nurses={nurses.filter((n) => n.id !== reassignModal.nurseId)}
            onSave={(newNurseId) => {
              updateBooking(reassignModal.id, { nurseId: newNurseId });
              toast.success('Đã gán lại ca khám');
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
    gray: 'text-gray-700',
    teal: 'text-teal-600',
    blue: 'text-blue-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-2xl">{icon}</span>
        <span className={`text-2xl font-bold ${colorMap[color]}`}>{value}</span>
      </div>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

// ===== BookingRow — dùng chung cho mọi trạng thái =====
function BookingRow({ booking, now, patient, nurse, hospital, onReassign }) {
  const elapsed = booking.startTime
    ? (now - booking.startTime) / 3600000
    : 0;
  const isOT = elapsed > 4;
  const h = Math.floor(elapsed);
  const m = Math.floor((elapsed % 1) * 60);
  const overtimeMinutes = Math.max(0, Math.floor(elapsed * 60 - 4 * 60));
  const fee = overtimeMinutes * 2000;

  const STATUS_MAP = {
    confirmed: { label: 'Chờ bắt đầu', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    picking_up: { label: 'Đang đón BN', color: 'bg-teal-100 text-teal-700 border-teal-200' },
    at_hospital: { label: 'Đã tới viện', color: 'bg-teal-100 text-teal-700 border-teal-200' },
    examining: { label: 'Đang khám', color: 'bg-teal-100 text-teal-700 border-teal-200' },
    done_exam: { label: 'Đã lấy thuốc', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    completed: { label: 'Đã hoàn tất', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  };

  const statusInfo = STATUS_MAP[booking.status] || STATUS_MAP.confirmed;
  const isCompleted = booking.status === 'completed';

  return (
    <div className="px-5 py-3 flex items-center justify-between gap-3 flex-wrap hover:bg-gray-50 transition">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <img
          src={patient?.avatar}
          alt=""
          className="w-10 h-10 rounded-full object-cover border"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {patient?.name}{' '}
            <span className="text-xs text-gray-400 font-normal">
              #{booking.id}
            </span>
          </p>
          <p className="text-xs text-gray-500 truncate">
            {hospital?.name} • Y tá {nurse?.name}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`text-xs px-2 py-1 rounded-full border font-medium whitespace-nowrap ${statusInfo.color}`}
        >
          {statusInfo.label}
        </span>

        {/* Timer: chỉ hiện khi đang chạy */}
        {booking.startTime && !isCompleted && (
          <div className="text-right">
            <p
              className={`text-sm font-mono font-bold ${
                isOT ? 'text-orange-600' : 'text-gray-700'
              }`}
            >
              {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}
            </p>
            {isOT && (
              <p className="text-[10px] text-orange-600">
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
            <p className="text-[10px] text-gray-500">tổng</p>
          </div>
        )}

        {/* Nút đổi y tá: chỉ hiện khi chưa hoàn tất */}
        {!isCompleted && (
          <button
            onClick={onReassign}
            className="text-xs text-teal-600 font-semibold hover:bg-teal-50 px-3 py-1.5 rounded-lg transition"
          >
            🔄 Đổi
          </button>
        )}
      </div>
    </div>
  );
}

// ===== SOSCard =====
function SOSCard({ sos, onResolve }) {
  const timeStr = new Date(sos.time).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const minutesAgo = Math.floor((Date.now() - new Date(sos.time)) / 60000);

  return (
    <div className="bg-white border-2 border-red-300 rounded-xl overflow-hidden">
      <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="animate-pulse">🔴</span>
          <span className="font-bold text-sm">SOS • Ca {sos.bookingId}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span>🕒 {timeStr}</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full">
            {minutesAgo < 1 ? 'Vừa xong' : `${minutesAgo} phút trước`}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <p className="text-xs text-gray-500 font-semibold mb-2 uppercase">
            👤 Người bệnh
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
                  className="text-sm font-semibold text-teal-600 hover:underline flex items-center gap-1 mt-0.5"
                >
                  📞 {sos.patientPhone}
                </a>
              )}
              {sos.patientBhkyt && (
                <p className="text-xs text-gray-500 mt-0.5">
                  BHYT: {sos.patientBhkyt}
                </p>
              )}
            </div>
          </div>

          {(sos.patientAllergies?.length > 0 ||
            sos.patientConditions?.length > 0) && (
            <div className="mt-3 space-y-1.5">
              {sos.patientAllergies?.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <p className="text-xs text-red-700 font-semibold">
                    🚨 DỊ ỨNG: {sos.patientAllergies.join(', ')}
                  </p>
                </div>
              )}
              {sos.patientConditions?.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <p className="text-xs text-amber-700 font-semibold">
                    ⚠️ BỆNH NỀN: {sos.patientConditions.join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-3 border-t">
          <p className="text-xs text-gray-500 font-semibold mb-2 uppercase">
            👩‍⚕️ Y tá gửi SOS
          </p>
          <div className="flex items-center gap-3">
            {sos.nurseAvatar ? (
              <img
                src={sos.nurseAvatar}
                alt={sos.nurseName}
                className="w-10 h-10 rounded-full object-cover border"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                {sos.nurseName?.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm">
                {sos.nurseName || '—'}
              </p>
              {sos.nursePhone && (
                <a
                  href={`tel:${sos.nursePhone}`}
                  className="text-xs text-teal-600 hover:underline"
                >
                  📞 {sos.nursePhone}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-gray-400 mb-0.5">🏥 Bệnh viện đến</p>
            <p className="font-medium text-gray-800">
              {sos.hospitalName || '—'}
            </p>
            {sos.hospitalAddress && (
              <p className="text-gray-500 mt-0.5">{sos.hospitalAddress}</p>
            )}
          </div>
          <div>
            <p className="text-gray-400 mb-0.5">📍 Điểm đón</p>
            <p className="font-medium text-gray-800">
              {sos.pickupAddress || '—'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 mb-0.5">📊 Trạng thái ca</p>
            <p className="font-medium text-gray-800">
              {{
                picking_up: 'Đang đón BN',
                at_hospital: 'Đã tới viện',
                examining: 'Đang khám',
                done_exam: 'Đã lấy thuốc',
              }[sos.status] || sos.status}
            </p>
          </div>
          {sos.bookingStartTime && (
            <div>
              <p className="text-gray-400 mb-0.5">⏱ Đã phục vụ</p>
              <p className="font-medium text-gray-800">
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

        <div className="pt-3 border-t flex gap-2 flex-wrap">
          {sos.patientPhone && (
            <a
              href={`tel:${sos.patientPhone}`}
              className="flex-1 min-w-[140px] bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition text-center"
            >
              📞 Gọi người nhà
            </a>
          )}
          {sos.nursePhone && (
            <a
              href={`tel:${sos.nursePhone}`}
              className="flex-1 min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition text-center"
            >
              📞 Gọi y tá
            </a>
          )}
          <button
            onClick={onResolve}
            className="flex-1 min-w-[140px] bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition"
          >
            ✓ Đã xử lý
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Reassign Form =====
function ReassignForm({ booking, nurses, onSave, onCancel }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
        ⚠️ Ca hiện tại: <b>{booking.id}</b>. Đổi y tá sẽ kích hoạt thông báo
        cho khách hàng.
      </div>

      <p className="text-sm font-semibold text-gray-700">
        Chọn Y tá mới phụ trách:
      </p>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {nurses.map((n) => (
          <button
            key={n.id}
            onClick={() => setSelected(n.id)}
            className={`w-full p-3 rounded-lg border-2 text-left transition flex items-center gap-3 ${
              selected === n.id
                ? 'border-teal-500 bg-teal-50'
                : 'border-gray-200 hover:border-teal-300'
            }`}
          >
            <img
              src={n.avatar}
              alt={n.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm">{n.name}</p>
              <p className="text-xs text-gray-500">
                {n.exp} năm KN • ⭐ {n.rating?.toFixed(1)}
              </p>
            </div>
            {selected === n.id && (
              <span className="text-teal-600 font-bold">✓</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold"
        >
          Hủy
        </button>
        <button
          onClick={() => selected && onSave(selected)}
          disabled={!selected}
          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
        >
          Xác nhận đổi
        </button>
      </div>
    </div>
  );
}