// src/pages/customer/PatientForm.jsx
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const EMPTY = {
  name: '',
  relation: 'father',       // 👈 key i18n
  dob: '',
  gender: 'male',           // 👈 key i18n
  bhyt: '',
  address: '',
  emergencyPhone: '',
  avatar: '',
  allergies: [],
  conditions: [],
};

const RELATIONS = ['father', 'mother', 'grandfather', 'grandmother', 'wife', 'husband', 'other'];
const COMMON_ALLERGIES = ['penicillin', 'paracetamol', 'aspirin', 'seafood', 'other'];
const COMMON_CONDITIONS = ['diabetes', 'hypertension', 'cardiovascular', 'asthma', 'other'];

export default function PatientForm({ initial, onSubmit, onCancel }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(EMPTY);
  const [preview, setPreview] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    if (initial) {
      setForm({ ...EMPTY, ...initial });
      setPreview(initial.avatar || '');
    } else {
      setForm(EMPTY);
      setPreview('');
    }
  }, [initial]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleItem = (key, item) => {
    setForm((f) => {
      const list = f[key];
      return {
        ...f,
        [key]: list.includes(item)
          ? list.filter((x) => x !== item)
          : [...list, item],
      };
    });
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('patients.formImageOnly'));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('patients.formImageTooBig'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setPreview(base64);
      update('avatar', base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setPreview('');
    update('avatar', '');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error(t('patients.formNameRequired'));
    if (!form.dob) return toast.error(t('patients.formDobRequired'));
    if (!form.address.trim()) return toast.error(t('patients.formAddressRequired'));
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ===== UPLOAD AVATAR ===== */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-teal-50 to-rose-50 border border-teal-100">
        <div className="relative">
          {preview ? (
            <img
              src={preview}
              alt="avatar"
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg shadow-teal-200 ring-2 ring-teal-300"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-teal-200">
              {form.name?.charAt(0) || '👤'}
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-800 mb-2">
            📷 {t('patients.formAvatarLabel')}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs px-3 py-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition font-semibold shadow-sm shadow-rose-200"
            >
              {t('patients.formChooseImage')}
            </button>
            {preview && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="text-xs px-3 py-1.5 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition font-medium"
              >
                🗑 {t('patients.formRemoveImage')}
              </button>
            )}
          </div>
          <p className="text-[10px] text-gray-500 mt-1">
            {t('patients.formImageHint')}
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* ===== THÔNG TIN CƠ BẢN ===== */}
      <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-100 space-y-4">
        <p className="text-sm font-bold text-teal-700 flex items-center gap-2">
          👤 {t('patients.formBasicInfo')}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t('patients.formName')} *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder={t('patients.formNamePlaceholder')}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t('patients.formRelation')}
            </label>
            <select
              value={form.relation}
              onChange={(e) => update('relation', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
            >
              {RELATIONS.map((r) => (
                <option key={r} value={r}>
                  {t(`patients.relations.${r}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t('patients.formDob')} *
            </label>
            <input
              type="text"
              value={form.dob}
              onChange={(e) =>
                update('dob', e.target.value.replace(/\D/g, '').slice(0, 4))
              }
              placeholder={t('patients.formDobPlaceholder')}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t('patients.formGender')}
            </label>
            <select
              value={form.gender}
              onChange={(e) => update('gender', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
            >
              <option value="male">{t('patients.formGenderMale')}</option>
              <option value="female">{t('patients.formGenderFemale')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t('patients.formBhyt')}
            </label>
            <input
              type="text"
              value={form.bhyt}
              onChange={(e) => update('bhyt', e.target.value.toUpperCase())}
              placeholder={t('patients.formBhytPlaceholder')}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* ===== ĐỊA CHỈ & LIÊN HỆ ===== */}
      <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 space-y-4">
        <p className="text-sm font-bold text-rose-700 flex items-center gap-2">
          📍 {t('patients.formAddressSection')}
        </p>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            {t('patients.formAddressLabel')} *
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => update('address', e.target.value)}
            placeholder={t('patients.formAddressPlaceholder')}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            {t('patients.formEmergencyPhone')}
          </label>
          <input
            type="tel"
            value={form.emergencyPhone}
            onChange={(e) =>
              update(
                'emergencyPhone',
                e.target.value.replace(/\D/g, '').slice(0, 10)
              )
            }
            placeholder={t('patients.formEmergencyPhonePlaceholder')}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none text-sm"
          />
        </div>
      </div>

      {/* ===== CẢNH BÁO Y TẾ ===== */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-red-50/60 to-amber-50/60 border-2 border-dashed border-amber-200 space-y-4">
        <p className="text-sm font-bold text-red-700 flex items-center gap-2">
          🚨 {t('patients.formMedicalWarning')}
        </p>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            {t('patients.formAllergies')}
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_ALLERGIES.map((a) => {
              const active = form.allergies.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleItem('allergies', a)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition ${
                    active
                      ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-200 scale-105'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-red-400'
                  }`}
                >
                  {active && '✓ '}
                  {t(`patients.allergies.${a}`)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            {t('patients.formConditions')}
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_CONDITIONS.map((c) => {
              const active = form.conditions.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleItem('conditions', c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition ${
                    active
                      ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200 scale-105'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-amber-400'
                  }`}
                >
                  {active && '✓ '}
                  {t(`patients.conditions.${c}`)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-lg transition shadow-lg shadow-rose-200 hover:-translate-y-0.5"
        >
          {initial ? t('patients.formSubmitUpdate') : t('patients.formSubmitAdd')}
        </button>
      </div>
    </form>
  );
}