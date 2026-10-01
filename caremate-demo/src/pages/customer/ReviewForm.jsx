// src/pages/customer/ReviewForm.jsx
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';

const POSITIVE_TAGS = [
  'Đúng giờ',
  'Ân cần, chu đáo',
  'Thao tác chuyên nghiệp',
  'Giao tiếp lịch sự',
  'Báo cáo chi tiết',
];

const NEGATIVE_TAGS = [
  'Đến trễ',
  'Thái độ chưa tốt',
  'Lúng túng thủ tục',
  'Báo cáo chụp mờ',
];

export default function ReviewForm({ bookingId, nurseId, onSubmitted }) {
  const { addReview } = useStore();
  const [stars, setStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [tags, setTags] = useState([]);
  const [comment, setComment] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  const toggleTag = (t) => {
    setTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const handleSubmit = () => {
    if (stars === 0) {
      toast.error('Vui lòng chọn số sao');
      return;
    }
    if (comment.length > 500) {
      toast.error('Nhận xét tối đa 500 ký tự');
      return;
    }

    addReview({
      id: Date.now(),
      bookingId,
      nurseId,
      stars,
      tags,
      comment: comment.trim(),
      anonymous,
      visible: true,
      createdAt: new Date().toISOString(),
    });

    toast.success('Cảm ơn bạn đã gửi đánh giá!');
    onSubmitted?.();
  };

  // Chọn tag theo số sao
  const availableTags = stars >= 4 ? POSITIVE_TAGS : stars > 0 ? NEGATIVE_TAGS : [];
  const displayStars = hoverStars || stars;

  return (
    <div className="space-y-5">
      {/* Ngôi sao */}
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-3">
          Bạn đánh giá y tá thế nào?
        </p>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => setStars(s)}
              onMouseEnter={() => setHoverStars(s)}
              onMouseLeave={() => setHoverStars(0)}
              className="text-4xl transition-transform hover:scale-110"
            >
              <span
                className={
                  s <= displayStars ? 'text-yellow-500' : 'text-gray-300'
                }
              >
                ⭐
              </span>
            </button>
          ))}
        </div>
        {stars > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            {stars === 5 && 'Tuyệt vời!'}
            {stars === 4 && 'Rất tốt!'}
            {stars === 3 && 'Bình thường'}
            {stars === 2 && 'Chưa hài lòng'}
            {stars === 1 && 'Rất không hài lòng'}
          </p>
        )}
      </div>

      {/* Tags */}
      {availableTags.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Điều gì đáng chú ý?
          </p>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((t) => (
              <button
                key={t}
                onClick={() => toggleTag(t)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  tags.includes(t)
                    ? stars >= 4
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-red-500 text-white border-red-500'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Comment */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Nhận xét của bạn
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, 500))}
          placeholder="Chia sẻ trải nghiệm của bạn về y tá..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm resize-none"
        />
        <p className="text-[10px] text-gray-400 text-right mt-1">
          {comment.length}/500
        </p>
      </div>

      {/* Ẩn danh */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
          className="w-4 h-4 accent-teal-600"
        />
        <span className="text-sm text-gray-600">
          Ẩn danh tính khi hiển thị công khai
        </span>
      </label>

      {/* Nút */}
      <button
        onClick={handleSubmit}
        disabled={stars === 0}
        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Gửi đánh giá
      </button>
    </div>
  );
}