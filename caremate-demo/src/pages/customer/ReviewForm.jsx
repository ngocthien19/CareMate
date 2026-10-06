// src/pages/customer/ReviewForm.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';

// Đổi sang key i18n
const POSITIVE_TAGS = ['onTime', 'caring', 'professional', 'polite', 'detailedReport'];
const NEGATIVE_TAGS = ['late', 'badAttitude', 'confused', 'blurryReport'];

function StarIcon({ filled, size = 44 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? '#FBBF24' : 'none'}
      stroke={filled ? '#F59E0B' : '#D1D5DB'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        filter: filled
          ? 'drop-shadow(0 2px 4px rgba(251, 191, 36, 0.4))'
          : 'none',
        transition: 'all 0.15s ease',
      }}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function ReviewForm({ bookingId, nurseId, onSubmitted }) {
  const { t } = useTranslation();
  const { addReview } = useStore();
  const [stars, setStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [tags, setTags] = useState([]);
  const [comment, setComment] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  const toggleTag = (tag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (stars === 0) {
      toast.error(t('review.errorStars'));
      return;
    }
    if (comment.length > 500) {
      toast.error(t('review.errorCommentLength'));
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

    toast.success(t('review.submitSuccess'));
    onSubmitted?.();
  };

  const availableTags =
    stars >= 4 ? POSITIVE_TAGS : stars > 0 ? NEGATIVE_TAGS : [];
  const displayStars = hoverStars || stars;

  const feedbackKey =
    stars > 0 ? `review.feedback${stars}` : null;

  return (
    <div className="space-y-5">
      {/* ===== Ngôi sao ===== */}
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">
          {t('review.starsQuestion')}
        </p>
        <div
          className="flex justify-center gap-2"
          onMouseLeave={() => setHoverStars(0)}
        >
          {[1, 2, 3, 4, 5].map((s) => {
            const isFilled = s <= displayStars;
            const isHover = hoverStars > 0 && s <= hoverStars;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStars(s)}
                onMouseEnter={() => setHoverStars(s)}
                className={`transition-all duration-150 ${
                  isFilled ? 'scale-110' : 'scale-100'
                } ${isHover ? 'scale-125' : ''} hover:scale-125 cursor-pointer`}
                aria-label={t('review.starAria', { num: s })}
              >
                <StarIcon filled={isFilled} size={44} />
              </button>
            );
          })}
        </div>
        {stars > 0 && feedbackKey && (
          <p className="text-sm font-semibold mt-3 text-teal-700">
            {t(feedbackKey)}
          </p>
        )}
        {stars === 0 && (
          <p className="text-xs text-gray-400 mt-3 italic">
            {t('review.starHint')}
          </p>
        )}
      </div>

      {/* ===== Tags ===== */}
      {availableTags.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">
            {t('review.tagsQuestion')}
          </p>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tagKey) => {
              const active = tags.includes(tagKey);
              const tagGroup = stars >= 4 ? 'tagsPositive' : 'tagsNegative';
              return (
                <button
                  key={tagKey}
                  type="button"
                  onClick={() => toggleTag(tagKey)}
                  className={`text-xs px-3 py-1.5 rounded-full border-2 transition font-medium ${
                    active
                      ? stars >= 4
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-red-500 text-white border-red-500'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {active && '✓ '}
                  {t(`review.${tagGroup}.${tagKey}`)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== Comment ===== */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('review.commentLabel')}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, 500))}
          placeholder={t('review.commentPlaceholder')}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm resize-none"
        />
        <p className="text-[10px] text-gray-400 text-right mt-1">
          {comment.length}/500
        </p>
      </div>

      {/* ===== Ẩn danh ===== */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
          className="w-4 h-4 accent-teal-600"
        />
        <span className="text-sm text-gray-600">
          {t('review.anonymousLabel')}
        </span>
      </label>

      {/* ===== Nút gửi ===== */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={stars === 0}
        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t('review.submitBtn')}
      </button>
    </div>
  );
}