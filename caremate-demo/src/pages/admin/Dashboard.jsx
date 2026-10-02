// src/pages/admin/Dashboard.jsx
import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { HOSPITALS } from '../../mock';
import { calcOvertimeFee } from '../../utils/calcOvertimeFee';
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

  // Update timer mỗi 5s
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);

  // Ca đang diễn ra
  const active = useMemo(
    () =>
      bookings
        .filter((b) => b.status !== 'completed' && b.status !== 'confirmed')
        .sort((a, b) => (a.startTime || 0) - (b.startTime || 0)),
    [bookings]
  );

  // Ca chờ bắt đầu
  const waiting = useMemo(
    () => bookings.filter((b) => b.status === 'confirmed'),
    [bookings]
  );

  // Ca vượt 4h
  const overtimeList = active.filter((b) => {
    if (!b.startTime) return false;
    return (now - b.startTime) / 3600000 > 4;
  });

  // SOS chưa xử lý
  const activeSOS = sosAlerts.filter((a) => !a.resolved);

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Giám sát ca khám
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Theo dõi thời gian thực các ca khám tại TP.HCM
        </p>
      </div>

      {/* Cảnh báo SOS */}
      {activeSOS.length > 0 && (
        <div className="bg-red-50 border-2 border-red-400 rounded-xl p-5 animate-pulse">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🚨</span>
            <div className="flex-1">
              <p className="font-bold text-red-700 text-lg">
                CẢNH BÁO SOS ({activeSOS.length})
              </p>
              <div className="mt-2 space-y-2">
                {activeSOS.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white border border-red-200 rounded-lg p-3 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-red-700">
                        Y tá {s.nurseName} — Ca {s.bookingId}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(s.time).toLocaleTimeString('vi-VN')}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        resolveSOS(s.id);
                        toast.success('Đã đánh dấu xử lý SOS');
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg"
                    >
                      ✓ Đã xử lý
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

      {/* Bảng ca đang diễn ra */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b">
          <p className="font-bold text-gray-800">
            🔵 Ca đang diễn ra ({active.length})
          </p>
        </div>

        {active.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            Không có ca nào đang diễn ra
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {active.map((b) => (
              <LiveRow
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

      {/* Danh sách chờ */}
      {waiting.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b">
            <p className="font-bold text-gray-800">
              ⏳ Chờ bắt đầu ({waiting.length})
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {waiting.map((b) => {
              const p = patients.find((x) => x.id === b.patientId);
              const n = nurses.find((x) => x.id === b.nurseId);
              return (
                <div
                  key={b.id}
                  className="px-5 py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p?.avatar}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover border"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {p?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {b.date} • {b.pickupTime} • Y tá {n?.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setReassignModal(b)}
                    className="text-xs text-teal-600 font-semibold hover:bg-teal-50 px-3 py-1.5 rounded-lg transition whitespace-nowrap"
                  >
                    🔄 Đổi Y tá
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

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

// ===== LiveRow =====
function LiveRow({ booking, now, patient, nurse, hospital, onReassign }) {
  const elapsed = booking.startTime
    ? (now - booking.startTime) / 3600000
    : 0;
  const isOT = elapsed > 4;
  const h = Math.floor(elapsed);
  const m = Math.floor((elapsed % 1) * 60);
  const fee = isOT
    ? Math.ceil((elapsed - 4) * 2) / 2 * 120000
    : 0;

  const STATUS_MAP = {
    picking_up: 'Đang đón BN',
    at_hospital: 'Đã tới viện',
    examining: 'Đang khám',
    done_exam: 'Đã lấy thuốc',
  };

  return (
    <div className="px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <img
          src={patient?.avatar}
          alt=""
          className="w-10 h-10 rounded-full object-cover border"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {patient?.name}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {hospital?.name} • Y tá {nurse?.name}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`text-xs px-2 py-1 rounded-full border font-medium ${
            isOT
              ? 'bg-orange-100 text-orange-700 border-orange-200'
              : 'bg-teal-100 text-teal-700 border-teal-200'
          }`}
        >
          {STATUS_MAP[booking.status] || booking.status}
        </span>

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
              +{fee.toLocaleString('vi-VN')}đ
            </p>
          )}
        </div>

        <button
          onClick={onReassign}
          className="text-xs text-teal-600 font-semibold hover:bg-teal-50 px-3 py-1.5 rounded-lg transition"
        >
          🔄 Đổi
        </button>
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
              <p className="font-semibold text-gray-800 text-sm">
                {n.name}
              </p>
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