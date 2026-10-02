// src/pages/nurse/Jobs.jsx
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { HOSPITALS, PATIENTS } from '../../mock';

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
  const { user, bookings, patients } = useStore();

  // Lọc ca của y tá đang đăng nhập
  const myJobs = bookings
    .filter((b) => b.nurseId === user?.nurseId)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const active = myJobs.filter((j) => j.status !== 'completed');
  const done = myJobs.filter((j) => j.status === 'completed');

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Ca khám của tôi</h1>
        <p className="text-sm text-gray-500 mt-1">
          Xin chào {user?.name} — có <b>{active.length}</b> ca đang chờ xử lý
        </p>
      </div>

      {/* Ca đang diễn ra */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 mb-3">
          🔵 ĐANG DIỄN RA ({active.length})
        </h2>
        {active.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-gray-200">
            <p className="text-gray-500 text-sm">Không có ca nào đang chờ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {active.map((j) => (
              <JobCard
                key={j.id}
                job={j}
                patient={patients.find((p) => p.id === j.patientId)}
                onClick={() => navigate(`/nurse/jobs/${j.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Ca hoàn tất */}
      {done.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-3">
            ✅ ĐÃ HOÀN TẤT ({done.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {done.map((j) => (
              <JobCard
                key={j.id}
                job={j}
                patient={patients.find((p) => p.id === j.patientId)}
                onClick={() => navigate(`/nurse/jobs/${j.id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function JobCard({ job, patient, onClick }) {
  const hospital = HOSPITALS.find((h) => h.id === job.hospitalId);
  const statusInfo = STATUS_LABEL[job.status] || STATUS_LABEL.confirmed;

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:border-teal-400 hover:shadow-md transition group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-xs text-gray-400">Mã đơn</p>
          <p className="text-sm font-bold text-teal-700">{job.id}</p>
        </div>
        <span
          className={`text-[10px] px-2 py-1 rounded-full border font-medium whitespace-nowrap ${statusInfo.color}`}
        >
          {statusInfo.label}
        </span>
      </div>

      <div className="flex items-center gap-3 pb-3 border-b mb-3">
        {patient?.avatar ? (
          <img
            src={patient.avatar}
            className="w-11 h-11 rounded-full object-cover border"
            alt=""
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            {patient?.name?.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-800 text-sm truncate">
            {patient?.name}
          </p>
          <p className="text-xs text-gray-500">
            {patient?.relation} • {patient?.gender} • {patient?.dob}
          </p>
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-gray-600">
        <p className="truncate">🏥 {hospital?.name}</p>
        <p>
          📅 {job.date} • {job.pickupTime}
        </p>
        <p className="truncate">
          📍 {job.address}, {job.district}
        </p>
      </div>

      {patient?.allergies?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-2 py-1.5 mt-3">
          <p className="text-[10px] text-red-700 font-semibold">
            🚨 Dị ứng: {patient.allergies.join(', ')}
          </p>
        </div>
      )}

      <p className="text-xs text-teal-600 font-medium mt-3 group-hover:underline">
        Xem chi tiết →
      </p>
    </button>
  );
}