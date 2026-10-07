// src/components/NurseProfileModal.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import { useStore } from '../store/useStore';
import { calcNurseRating, getNurseReviews } from '../utils/calcNurseRating';

export default function NurseProfileModal({ open, onClose, nurse }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState('info');
  const { reviews } = useStore();

  if (!nurse) return null;

  const { rating, count } = calcNurseRating(nurse.id, reviews, nurse.rating);
  const nurseReviews = getNurseReviews(nurse.id, reviews);

  const tabs = [
    { key: 'info', label: t('nurseProfileModal.tabInfo') },
    { key: 'certs', label: t('nurseProfileModal.tabCerts') },
    { key: 'reviews', label: t('nurseProfileModal.tabReviews', { count }) },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('nurseProfileModal.title')}
      maxWidth="max-w-xl"
    >
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
            {nurse.age} {t('nurseProfileModal.yearsOld')} • {nurse.exp}{' '}
            {t('nurseProfileModal.yearsExp')}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-yellow-500">⭐</span>
            <span className="text-sm font-semibold text-gray-700">
              {rating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">
              ({count} {t('nurseProfileModal.reviews')})
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mt-4 border-b">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            className={`px-3 py-2 text-sm font-medium transition border-b-2 -mb-px ${
              tab === tabItem.key
                ? 'border-teal-500 text-teal-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="pt-5">
        {tab === 'info' && (
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold text-gray-700 mb-2">
                {t('nurseProfileModal.specialty')}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-1 rounded-full">
                  {t('nurseProfileModal.spec1')}
                </span>
                <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-1 rounded-full">
                  {t('nurseProfileModal.spec2')}
                </span>
                <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-1 rounded-full">
                  {t('nurseProfileModal.spec3')}
                </span>
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-2">
                {t('nurseProfileModal.workHistory')}
              </p>
              <ul className="space-y-1 text-gray-600 text-xs">
                <li>• Cho Ray Hospital — General Internal Medicine (2 years)</li>
                <li>• University Medical Center HCMC — Geriatrics (3 years)</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-2">
                {t('nurseProfileModal.skills')}
              </p>
              <ul className="space-y-1 text-gray-600 text-xs">
                <li>• Basic Life Support (BLS)</li>
                <li>• Vital signs measurement, mobility assistance</li>
                <li>• Friendly communication with the elderly</li>
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
              {t('nurseProfileModal.certNote')}
            </p>
          </div>
        )}

        {tab === 'reviews' && (
          <div className="space-y-3">
            {nurseReviews.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                {t('nurseProfileModal.noReviews')}
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
                      {t('nurseProfileModal.stars', { count: r.stars })}
                    </span>
                    {r.anonymous && (
                      <span className="text-[10px] text-gray-400 italic">
                        {t('nurseProfileModal.anonymous')}
                      </span>
                    )}
                  </div>
                  {r.comment && (
                    <p className="text-sm text-gray-700">{r.comment}</p>
                  )}
                  {r.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {r.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full"
                        >
                          {tag}
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