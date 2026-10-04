// src/pages/customer/ReportList.jsx
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { HOSPITALS, NURSES } from '../../mock';
import { calcOvertimeFee } from '../../utils/calcOvertimeFee';

export default function ReportList() {
  const navigate = useNavigate();
  const { bookings, patients } = useStore();

  const completed = bookings
    .filter((b) => b.status === 'completed')
    .sort((a, b) => new Date(b.endTime || 0) - new Date(a.endTime || 0));

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header — nền TEAL đơn sắc */}
      <div className="relative rounded-2xl overflow-hidden bg-teal-600 p-6 shadow-lg">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-400/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-400/10 rounded-full blur-3xl" />

        <div className="relative flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-pulse" />
              <span className="text-[10px] font-semibold text-white">
                Sổ khám bệnh
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              📄 Báo cáo sau khám
            </h1>
            <p className="text-sm text-teal-50 mt-1">
              Xem lại toàn bộ kết quả các ca khám đã hoàn tất
            </p>
          </div>
          <span className="text-xs bg-white/20 text-white border border-white/30 px-3 py-1.5 rounded-full font-bold">
            {completed.length} ca
          </span>
        </div>
      </div>

      {completed.length === 0 ? (
        <div className="bg-teal-50 rounded-2xl p-12 text-center border-2 border-dashed border-teal-200">
          <div className="text-5xl mb-3">📄</div>
          <p className="text-gray-600 mb-4">Chưa có ca khám nào hoàn tất</p>
          <button
            onClick={() => navigate('/customer/tracking')}
            className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-6 py-2.5 rounded-lg transition shadow-md shadow-rose-200 hover:-translate-y-0.5"
          >
            Xem ca đang diễn ra →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {completed.map((booking) => {
            const patient = patients.find((p) => p.id === booking.patientId);
            const hospital = HOSPITALS.find(
              (h) => h.id === booking.hospitalId
            );
            const nurse = NURSES.find((n) => n.id === booking.nurseId);
            const info = calcOvertimeFee(booking.startTime, booking.endTime);

            return (
              <button
                key={booking.id}
                onClick={() => navigate(`/customer/report/${booking.id}`)}
                className="relative w-full bg-white rounded-2xl border-2 border-gray-200 p-5 text-left hover:border-rose-300 hover:shadow-xl hover:shadow-rose-100 hover:-translate-y-0.5 transition-all duration-300 group overflow-hidden"
              >
                {/* Vệt màu trái TEAL */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 group-hover:w-1.5 transition-all" />

                <div className="pl-2">
                  <div className="flex items-start gap-4">
                    {patient?.avatar ? (
                      <img
                        src={patient.avatar}
                        alt={patient.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-teal-200 ring-2 ring-teal-50 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold shrink-0">
                        {patient?.name?.charAt(0)}
                      </div>
                    )}

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

                        {info.isOvertime ? (
                          <span className="text-[10px] bg-orange-100 text-orange-700 border border-orange-300 px-2 py-1 rounded-full font-semibold whitespace-nowrap">
                            ⚠️ Có phụ phí +{info.formattedFee}đ
                          </span>
                        ) : (
                          <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-2 py-1 rounded-full font-semibold whitespace-nowrap">
                            ✓ Trong gói
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <span className="text-rose-400">📅</span>
                          {booking.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-teal-500">⏱</span>
                          {info.formattedDuration}
                        </span>
                        {nurse && (
                          <span className="flex items-center gap-1">
                            <img
                              src={nurse.avatar}
                              className="w-4 h-4 rounded-full object-cover border border-teal-200"
                              alt=""
                            />
                            {nurse.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-rose-500 font-bold mt-3 group-hover:underline">
                    Xem chi tiết báo cáo →
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}