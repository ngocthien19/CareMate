// src/pages/nurse/Profile.jsx
import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { calcNurseRating } from '../../utils/calcNurseRating';

export default function NurseProfile() {
  const { t } = useTranslation();
  const { user, nurses, reviews, updateNurseProfile } = useStore();
  const nurse = nurses.find((n) => n.id === user?.nurseId);

  const { rating, count: reviewCount } = calcNurseRating(
    nurse?.id,
    reviews,
    nurse?.rating || 5.0
  );

  const [form, setForm] = useState({
    licenseNumber: nurse?.licenseNumber || '',
    cprCert: nurse?.cprCert || '',
    blsCert: nurse?.blsCert || '',
  });
  const fileRef = useRef(null);
  const [certs, setCerts] = useState(nurse?.certs || []);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleUploadCert = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('nurseProfile.uploadError'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const newCert = {
        name: file.name.replace(/\.[^.]+$/, ''),
        url: ev.target.result,
        uploadedAt: new Date().toISOString(),
      };
      setCerts((c) => [...c, newCert]);
      toast.success(t('nurseProfile.uploadSuccess'));
    };
    reader.readAsDataURL(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleRemoveCert = (idx) => {
    setCerts((c) => c.filter((_, i) => i !== idx));
    toast.success(t('nurseProfile.deleteSuccess'));
  };

  const handleSave = () => {
    updateNurseProfile(user.nurseId, {
      ...form,
      certs,
    });
    toast.success(t('nurseProfile.saveSuccess'));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* ===== HEADER ===== */}
      <div className="relative rounded-2xl overflow-hidden bg-teal-600 p-6 shadow-lg">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-400/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-400/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-pulse" />
            <span className="text-[10px] font-semibold text-white">
              {t('nurseProfile.headerBadge')}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            👩‍⚕️ {t('nurseProfile.headerTitle')}
          </h1>
          <p className="text-sm text-teal-50 mt-1">
            {t('nurseProfile.headerSubtitle')}
          </p>
        </div>
      </div>

      {/* ===== THÔNG TIN CÁ NHÂN ===== */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-teal-200 ring-2 ring-teal-50"
          />
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-800">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.phone}</p>
            <span className="inline-block mt-2 text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-0.5 rounded-full font-bold">
              ✓ {t('nurseProfile.roleBadge')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 text-sm">
          <div className="p-3 rounded-lg bg-teal-50 border border-teal-100">
            <p className="text-xs text-teal-600 font-semibold mb-1">
              💼 {t('nurseProfile.expLabel')}
            </p>
            <p className="font-bold text-teal-700 text-lg">
              {nurse?.exp || 0} {t('nurseProfile.expSuffix')}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-100">
            <p className="text-xs text-rose-600 font-semibold mb-1">
              ⭐ {t('nurseProfile.ratingAvgLabel')}
            </p>
            <div className="flex items-center gap-2">
              <p className="font-bold text-rose-600 text-lg">
                {rating.toFixed(1)}/5.0
              </p>
              <span className="text-xs text-rose-500 bg-white border border-rose-200 px-2 py-0.5 rounded-full font-semibold">
                {t('nurseStats.reviewsCount', { count: reviewCount })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== THÔNG TIN CHỨNG CHỈ ===== */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          📋 {t('nurseProfile.certInfoTitle')}
        </h3>

        <div className="p-4 rounded-xl bg-teal-50 border border-teal-100">
          <label className="block text-sm font-semibold text-teal-700 mb-1">
            {t('nurseProfile.licenseLabel')}
          </label>
          <input
            type="text"
            value={form.licenseNumber}
            onChange={(e) => update('licenseNumber', e.target.value)}
            placeholder={t('nurseProfile.licensePlaceholder')}
            className="w-full px-4 py-2.5 bg-white border-2 border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
            <label className="block text-sm font-semibold text-rose-700 mb-1">
              {t('nurseProfile.cprLabel')}
            </label>
            <input
              type="text"
              value={form.cprCert}
              onChange={(e) => update('cprCert', e.target.value)}
              placeholder={t('nurseProfile.cprPlaceholder')}
              className="w-full px-4 py-2.5 bg-white border-2 border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
            />
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
            <label className="block text-sm font-semibold text-amber-700 mb-1">
              {t('nurseProfile.blsLabel')}
            </label>
            <input
              type="text"
              value={form.blsCert}
              onChange={(e) => update('blsCert', e.target.value)}
              placeholder={t('nurseProfile.blsPlaceholder')}
              className="w-full px-4 py-2.5 bg-white border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* ===== UPLOAD BẰNG CẤP ===== */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            📷 {t('nurseProfile.certsTitle')}
          </h3>
          <button
            onClick={() => fileRef.current?.click()}
            className="text-xs font-bold text-rose-500 hover:text-white border-2 border-rose-400 hover:border-rose-500 px-3 py-1.5 rounded-lg hover:bg-rose-500 transition"
          >
            {t('nurseProfile.uploadBtn')}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleUploadCert}
            className="hidden"
          />
        </div>

        {certs.length === 0 ? (
          <div className="bg-teal-50 rounded-xl p-8 text-center border-2 border-dashed border-teal-200">
            <div className="text-4xl mb-2">📄</div>
            <p className="text-sm text-gray-600 font-medium">
              {t('nurseProfile.emptyCerts')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {certs.map((cert, i) => (
              <div
                key={i}
                className="relative rounded-xl overflow-hidden border-2 border-teal-200 group hover:border-rose-300 transition"
              >
                <img
                  src={cert.url}
                  alt={cert.name}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-white/30 font-bold text-lg rotate-[-30deg] tracking-widest">
                    CAREMATE
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <button
                    onClick={() => handleRemoveCert(i)}
                    className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md"
                  >
                    🗑 {t('nurseProfile.deleteCert')}
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-teal-700 text-white text-[10px] px-2 py-1 truncate font-medium">
                  {cert.name}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-500 mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2">
          <span>{t('nurseProfile.watermarkNote')}</span>
        </p>
      </div>

      {/* ===== NÚT LƯU ===== */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-8 py-3 rounded-xl transition shadow-lg shadow-rose-200 hover:-translate-y-0.5 flex items-center gap-2"
        >
          💾 {t('nurseProfile.saveBtn')}
        </button>
      </div>
    </div>
  );
}