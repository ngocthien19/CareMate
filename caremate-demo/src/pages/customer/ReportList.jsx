// src/pages/customer/ReportList.jsx
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { HOSPITALS, NURSES, PATIENTS } from '../../mock';
import { calcOvertimeFee } from '../../utils/calcOvertimeFee';

export default function ReportList() {
  const navigate = useNavigate();
  const { bookings, patients } = useStore();

  // Chỉ hiện ca đã hoàn tất
  const completed = bookings
    .filter((b) => b.status === 'completed')
    .sort((a, b) => new Date(b.endTime || 0) - new Date(a.endTime || 0));

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Báo cáo sau khám</h1>
        <p className="text-sm text-gray-500 mt-1">
          Xem lại toàn bộ kết quả các ca khám đã hoàn tất
        </p>
      </div>

      {completed.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
          <div className="text-5xl mb-3">📄</div>
          <p className="text-gray-500 mb-4">
            Chưa có ca khám nào hoàn tất
          </p>
          <button
            onClick={() => navigate('/customer/tracking')}
            className="text-teal-600 font-semibold hover:underline"
          >
            Xem ca đang diễn ra →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {completed.map((booking) => {
            const patient = patients.find((p) => p.id === booking.patientId);
            const hospital = HOSPITALS.find((h) => h.id === booking.hospitalId);
            const nurse = NURSES.find((n) => n.id === booking.nurseId);
            const info = calcOvertimeFee(booking.startTime, booking.endTime);

            return (
              <button
                key={booking.id}
                onClick={() => navigate(`/customer/report/${booking.id}`)}
                className="w-full bg-white rounded-xl border border-gray-200 p-5 text-left hover:border-teal-400 hover:shadow-md transition group"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar bệnh nhân */}
                  {patient?.avatar ? (
                    <img
                      src={patient.avatar}
                      alt={patient.name}
                      className="w-12 h-12 rounded-full object-cover border shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold shrink-0">
                      {patient?.name?.charAt(0)}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-bold text-gray-800">
                          {patient?.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {hospital?.name} • {booking.specialty}
                        </p>
                      </div>
                      {/* Badge phụ phí */}
                      {info.isOvertime ? (
                        <span className="text-[10px] bg-orange-100 text-orange-700 border border-orange-300 px-2 py-1 rounded-full font-semibold whitespace-nowrap">
                          ⚠️ Có phụ phí +{info.formattedFee}đ
                        </span>
                      ) : (
                        <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                          ✓ Trong gói
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>📅 {booking.date}</span>
                      <span>⏱ {info.formattedDuration}</span>
                      {nurse && (
                        <span className="flex items-center gap-1">
                          <img
                            src={nurse.avatar}
                            className="w-4 h-4 rounded-full object-cover"
                            alt=""
                          />
                          {nurse.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-teal-600 font-medium mt-3 group-hover:underline">
                  Xem chi tiết báo cáo →
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}