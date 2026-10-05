// src/pages/nurse/Jobs.jsx
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { HOSPITALS } from '../../mock';

const STATUS_LABEL = {
  confirmed: {
    label: 'Chờ bắt đầu',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  picking_up: {
    label: 'Đang đón BN',
    color: 'bg-teal-100 text-teal-700 border-teal-200',
  },
  at_hospital: {
    label: 'Đã tới viện',
    color: 'bg-teal-100 text-teal-700 border-teal-200',
  },
  examining: {
    label: 'Đang khám',
    color: 'bg-teal-100 text-teal-700 border-teal-200',
  },
  done_exam: {
    label: 'Đã lấy thuốc',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  completed: {
    label: 'Đã hoàn tất',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
  },
};

export default function NurseJobs() {
  const navigate = useNavigate();
  const { user, bookings, patients, customHospitals } = useStore();

  const HOSPITALS_LIST = customHospitals || HOSPITALS;

  const myJobs = bookings
    .filter((b) => b.nurseId === user?.nurseId)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const active = myJobs.filter((j) => j.status !== 'completed');
  const done = myJobs.filter((j) => j.status === 'completed');

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* ===== HEADER — nền TEAL đơn sắc ===== */}
      <div className="relative rounded-2xl overflow-hidden bg-teal-600 p-6 shadow-lg">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-400/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-400/10 rounded-full blur-3xl" />

        <div className="relative flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-pulse" />
              <span className="text-[10px] font-semibold text-white">
                Bảng điều phối ca
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              📋 Ca khám của tôi
            </h1>
            <p className="text-sm text-teal-50 mt-1">
              Xin chào <b className="text-white">{user?.name}</b> — có{' '}
              <b className="text-white">{active.length}</b> ca đang chờ xử lý
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2 text-right">
            <p className="text-[10px] text-teal-50 font-semibold">Đang chờ</p>
            <p className="text-3xl font-bold text-white leading-none">
              {active.length}
            </p>
          </div>
        </div>
      </div>

      {/* ===== CA ĐANG DIỄN RA ===== */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-500" />
          ĐANG DIỄN RA ({active.length})
        </h2>
        {active.length === 0 ? (
          <div className="bg-teal-50 rounded-2xl p-8 text-center border-2 border-dashed border-teal-200">
            <div className="text-4xl mb-2">☕</div>
            <p className="text-gray-600 text-sm font-medium">
              Không có ca nào đang chờ
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {active.map((j) => (
              <JobCard
                key={j.id}
                job={j}
                patient={patients.find((p) => p.id === j.patientId)}
                hospitals={HOSPITALS_LIST}
                onClick={() => navigate(`/nurse/jobs/${j.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ===== CA HOÀN TẤT ===== */}
      {done.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            ĐÃ HOÀN TẤT ({done.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {done.map((j) => (
              <JobCard
                key={j.id}
                job={j}
                patient={patients.find((p) => p.id === j.patientId)}
                hospitals={HOSPITALS_LIST}
                onClick={() => navigate(`/nurse/jobs/${j.id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function JobCard({ job, patient, hospitals, onClick }) {
  const hospital = hospitals.find((h) => h.id === job.hospitalId);
  const statusInfo = STATUS_LABEL[job.status] || STATUS_LABEL.confirmed;

  const hospitalName = job.hospitalName || hospital?.name || '—';

  return (
    <button
      onClick={onClick}
      className="relative bg-white rounded-2xl border-2 border-gray-200 p-5 text-left hover:border-rose-300 hover:shadow-xl hover:shadow-rose-100 hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
    >
      {/* Vệt màu trái TEAL */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 group-hover:w-1.5 group-hover:bg-rose-500 transition-all" />

      <div className="pl-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-400 font-semibold">Mã đơn</p>
            <p className="text-sm font-bold text-teal-700">{job.id}</p>
          </div>
          <span
            className={`text-[10px] px-2 py-1 rounded-full border-2 font-semibold whitespace-nowrap ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
        </div>

        {/* Bệnh nhân */}
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100 mb-3">
          {patient?.avatar ? (
            <img
              src={patient.avatar}
              className="w-11 h-11 rounded-full object-cover border-2 border-teal-200 ring-2 ring-teal-50"
              alt=""
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-200">
              {patient?.name?.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-bold text-gray-800 text-sm truncate">
              {patient?.name}
            </p>
            <p className="text-xs text-gray-500">
              {patient?.relation} • {patient?.gender} • {patient?.dob}
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1.5 text-xs text-gray-600">
          <p className="truncate flex items-start gap-2">
            <span className="text-teal-500 shrink-0">🏥</span>
            <span className="font-medium">{hospitalName}</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-rose-400 shrink-0">📅</span>
            <span>
              {job.date} • {job.pickupTime}
            </span>
          </p>
          <p className="truncate flex items-start gap-2">
            <span className="text-amber-500 shrink-0">📍</span>
            <span>
              {job.address}, {job.district}
            </span>
          </p>
        </div>

        {/* Cảnh báo dị ứng */}
        {patient?.allergies?.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg px-3 py-2 mt-3">
            <p className="text-[10px] text-red-700 font-bold">
              🚨 Dị ứng: {patient.allergies.join(', ')}
            </p>
          </div>
        )}

        {/* CTA hint */}
        <p className="text-xs text-rose-500 font-bold mt-3 group-hover:underline">
          Xem chi tiết →
        </p>
      </div>
    </button>
  );
}