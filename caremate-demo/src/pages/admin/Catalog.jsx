// src/pages/admin/Catalog.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { HOSPITALS, SPECIALTIES } from '../../mock';

const TABS = [
  { key: 'hospitals', labelKey: 'adminCatalog.tabHospitals', icon: '🏥' },
  { key: 'specialties', labelKey: 'adminCatalog.tabSpecialties', icon: '🩺' },
];

export default function AdminCatalog() {
  const { t } = useTranslation();
  const {
    customHospitals,
    customSpecialties,
    setCustomHospitals,
    setCustomSpecialties,
  } = useStore();

  const [tab, setTab] = useState('hospitals');

  const hospitals = customHospitals || HOSPITALS;
  const specialties = customSpecialties || SPECIALTIES;

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
              {t('adminCatalog.headerBadge')}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            ⚙️ {t('adminCatalog.headerTitle')}
          </h1>
          <p className="text-sm text-teal-50 mt-1">
            {t('adminCatalog.headerSubtitle')}
          </p>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-1.5 inline-flex shadow-sm">
        {TABS.map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              tab === tabItem.key
                ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                : 'text-gray-600 hover:bg-rose-500 hover:text-white'
            }`}
          >
            {tabItem.icon} {t(tabItem.labelKey)}
          </button>
        ))}
      </div>

      {tab === 'hospitals' && (
        <HospitalTab
          list={hospitals}
          onChange={(list) => {
            setCustomHospitals(list);
            toast.success(t('adminCatalog.hospitalUpdateSuccess'));
          }}
        />
      )}

      {tab === 'specialties' && (
        <SpecialtyTab
          list={specialties}
          onChange={(list) => {
            setCustomSpecialties(list);
            toast.success(t('adminCatalog.specialtyUpdateSuccess'));
          }}
        />
      )}
    </div>
  );
}

// ===== Tab bệnh viện =====
function HospitalTab({ list, onChange }) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', address: '' });

  const addNew = () => {
    setEditing('new');
    setForm({ name: '', address: '' });
  };

  const save = () => {
    if (!form.name.trim() || !form.address.trim()) {
      toast.error(t('adminCatalog.hospitalRequired'));
      return;
    }

    if (editing === 'new') {
      const newId = Math.max(...list.map((h) => h.id), 0) + 1;
      onChange([
        ...list,
        { id: newId, name: form.name, address: form.address },
      ]);
    } else {
      onChange(
        list.map((h, i) =>
          i === editing ? { ...h, name: form.name, address: form.address } : h
        )
      );
    }
    setEditing(null);
  };

  const remove = (index) => {
    onChange(list.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <p className="font-bold text-gray-800 flex items-center gap-2">
          🏥 {t('adminCatalog.hospitalListTitle', { count: list.length })}
        </p>
        <button
          onClick={addNew}
          className="text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 px-4 py-2 rounded-lg transition shadow-md shadow-rose-200"
        >
          + {t('adminCatalog.hospitalAddBtn')}
        </button>
      </div>

      {/* Form thêm/sửa */}
      {editing !== null && (
        <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-4 mb-4">
          <p className="text-sm font-bold text-teal-700 mb-3">
            {editing === 'new'
              ? `➕ ${t('adminCatalog.hospitalAddNew')}`
              : `✏️ ${t('adminCatalog.hospitalEdit')}`}
          </p>
          <div className="space-y-2">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder={t('adminCatalog.hospitalNamePlaceholder')}
              className="w-full px-3 py-2 bg-white border-2 border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
            />
            <input
              type="text"
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
              placeholder={t('adminCatalog.hospitalAddressPlaceholder')}
              className="w-full px-3 py-2 bg-white border-2 border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
            />
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 py-2 border-2 border-gray-300 rounded-lg text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
              >
                {t('adminCatalog.cancelBtn')}
              </button>
              <button
                onClick={save}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold py-2 rounded-lg transition shadow-md shadow-rose-200"
              >
                {t('adminCatalog.saveBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {list.map((h, i) => (
          <div
            key={h.id}
            className="flex items-center gap-3 p-3 bg-teal-50/50 rounded-xl border-2 border-teal-100 hover:border-rose-200 transition"
          >
            <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-teal-200">
              🏥
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 text-sm truncate">
                {h.name}
              </p>
              <p className="text-xs text-gray-500 truncate">📍 {h.address}</p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => {
                  setEditing(i);
                  setForm({ name: h.name, address: h.address });
                }}
                className="text-xs text-teal-700 border-2 border-teal-300 hover:bg-teal-500 hover:text-white hover:border-teal-500 px-2.5 py-1.5 rounded-lg transition font-bold"
              >
                ✏️
              </button>
              <button
                onClick={() => {
                  if (window.confirm(t('adminCatalog.hospitalDeleteConfirm')))
                    remove(i);
                }}
                className="text-xs text-white bg-rose-500 hover:bg-rose-600 px-2.5 py-1.5 rounded-lg transition font-bold shadow-md shadow-rose-200"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== Tab chuyên khoa =====
function SpecialtyTab({ list, onChange }) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');

  const add = () => {
    if (!input.trim()) return;
    if (list.includes(input.trim())) {
      toast.error(t('adminCatalog.specialtyDuplicate'));
      return;
    }
    onChange([...list, input.trim()]);
    setInput('');
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-sm">
      <p className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        🩺 {t('adminCatalog.specialtyListTitle', { count: list.length })}
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder={t('adminCatalog.specialtyPlaceholder')}
          className="flex-1 px-3 py-2 bg-white border-2 border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
        />
        <button
          onClick={add}
          className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-5 rounded-lg text-sm transition shadow-md shadow-rose-200"
        >
          + {t('adminCatalog.addBtn')}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {list.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-2 bg-teal-50 border-2 border-teal-200 px-3 py-1.5 rounded-full hover:border-rose-300 transition"
          >
            <span className="text-sm text-teal-700 font-bold">{s}</span>
            <button
              onClick={() => onChange(list.filter((_, x) => x !== i))}
              className="text-white bg-rose-500 hover:bg-rose-600 font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center transition shadow-sm"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}