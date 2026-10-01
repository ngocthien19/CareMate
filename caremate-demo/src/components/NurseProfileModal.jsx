// src/components/NurseProfileModal.jsx
import { useState } from 'react';
import Modal from './Modal';
import { useStore } from '../store/useStore';
import { calcNurseRating, getNurseReviews } from '../utils/calcNurseRating';

export default function NurseProfileModal({ open, onClose, nurse }) {
  const [tab, setTab] = useState('info');
  const { reviews } = useStore();

  if (!nurse) return null;

  // 👇 Tính rating động từ store reviews
  const { rating, count } = calcNurseRating(nurse.id, reviews, nurse.rating);
  const nurseReviews = getNurseReviews(nurse.id, reviews);

  const tabs = [
    { key: 'info', label: 'Lý lịch nghề nghiệp' },
    { key: 'certs', label: 'Bằng cấp & Chứng chỉ' },
    { key: 'reviews', label: `Đánh giá (${count})` },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Hồ sơ Y tá" maxWidth="max-w-xl">
      {/* Header y tá */}
      <div className="flex items-center gap-4 pb-5 border-b">
        <img
          src={nurse.avatar}
          alt={nurse.name}
          className="w-20 h-20 rounded-full object-cover border-2 border-teal-200"
        />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800">{nurse.name}</h3>
          <p className="text-sm text-gray-500">
            {nurse.age} tuổi • {nurse.exp} năm kinh nghiệm
          </p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-yellow-500">⭐</span>
            <span className="text-sm font-semibold text-gray-700">
              {rating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">
              ({count} đánh giá)
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mt-4 border-b">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-sm font-medium transition border-b-2 -mb-px ${
              tab === t.key
                ? 'border-teal-500 text-teal-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="pt-5">
        {tab === 'info' && (
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold text-gray-700 mb-2">
                Chuyên môn chính
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-1 rounded-full">
                  Chăm sóc người cao tuổi
                </span>
                <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-1 rounded-full">
                  Hỗ trợ thủ tục y tế
                </span>
                <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-1 rounded-full">
                  Theo dõi sinh hiệu
                </span>
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-2">
                Bệnh viện từng công tác
              </p>
              <ul className="space-y-1 text-gray-600 text-xs">
                <li>• BV Chợ Rẫy — Khoa Nội tổng quát (2 năm)</li>
                <li>• BV ĐHYD TP.HCM — Khoa Lão (3 năm)</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-2">Kỹ năng</p>
              <ul className="space-y-1 text-gray-600 text-xs">
                <li>• Sơ cấp cứu cơ bản (BLS)</li>
                <li>• Đo sinh hiệu, hỗ trợ di chuyển</li>
                <li>• Giao tiếp thân thiện với người cao tuổi</li>
              </ul>
            </div>
          </div>
        )}

        {tab === 'certs' && (
          <div className="space-y-3">
            {nurse.certs?.map((cert, i) => (
              <div
                key={i}
                className="relative rounded-lg overflow-hidden border border-gray-200"
              >
                <img
                  src={`https://picsum.photos/seed/cert${nurse.id}-${i}/600/380`}
                  alt={cert}
                  className="w-full h-44 object-cover"
                />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="text-teal-500/30 text-3xl font-black rotate-[-25deg] tracking-wider">
                    CAREMATE VERIFIED
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white px-3 py-1.5 text-xs font-medium">
                  {cert}
                </div>
              </div>
            ))}
            <p className="text-[10px] text-gray-400 text-center italic">
              Chỉ sử dụng xác thực trên nền tảng CareMate
            </p>
          </div>
        )}

        {tab === 'reviews' && (
          <div className="space-y-3">
            {nurseReviews.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                Chưa có đánh giá nào
              </p>
            ) : (
              nurseReviews.map((r) => (
                <div
                  key={r.id}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-500 text-sm">
                      {'⭐'.repeat(r.stars)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {r.stars}/5 sao
                    </span>
                    {r.anonymous && (
                      <span className="text-[10px] text-gray-400 italic">
                        (Ẩn danh)
                      </span>
                    )}
                  </div>
                  {r.comment && (
                    <p className="text-sm text-gray-700">{r.comment}</p>
                  )}
                  {r.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {r.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}