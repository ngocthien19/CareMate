// src/pages/admin/Catalog.jsx
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { HOSPITALS, SPECIALTIES } from '../../mock';

const TABS = [
  { key: 'hospitals', label: '🏥 Bệnh viện' },
  { key: 'specialties', label: '🩺 Chuyên khoa' },
];

export default function AdminCatalog() {
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
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Danh mục hệ thống
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý bệnh viện và chuyên khoa hiển thị trên trang đặt lịch
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-1.5 inline-flex">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab === t.key
                ? 'bg-teal-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'hospitals' && (
        <HospitalTab
          list={hospitals}
          onChange={(list) => {
            setCustomHospitals(list);
            toast.success('Đã cập nhật danh sách bệnh viện');
          }}
        />
      )}

      {tab === 'specialties' && (
        <SpecialtyTab
          list={specialties}
          onChange={(list) => {
            setCustomSpecialties(list);
            toast.success('Đã cập nhật chuyên khoa');
          }}
        />
      )}
    </div>
  );
}

// ===== Tab bệnh viện =====
function HospitalTab({ list, onChange }) {
  const [editing, setEditing] = useState(null); // index đang sửa
  const [form, setForm] = useState({ name: '', address: '' });

  const addNew = () => {
    setEditing('new');
    setForm({ name: '', address: '' });
  };

  const save = () => {
    if (!form.name.trim() || !form.address.trim()) {
      toast.error('Nhập đầy đủ tên và địa chỉ');
      return;
    }

    if (editing === 'new') {
      const newId = Math.max(...list.map((h) => h.id), 0) + 1;
      onChange([...list, { id: newId, name: form.name, address: form.address }]);
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
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="font-bold text-gray-800">
          Danh sách Bệnh viện ({list.length})
        </p>
        <button
          onClick={addNew}
          className="text-xs font-semibold text-teal-600 border border-teal-500 px-3 py-1.5 rounded-lg hover:bg-teal-50"
        >
          + Thêm
        </button>
      </div>

      {/* Form thêm/sửa */}
      {editing !== null && (
        <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-semibold text-gray-800 mb-3">
            {editing === 'new' ? 'Thêm bệnh viện mới' : 'Sửa bệnh viện'}
          </p>
          <div className="space-y-2">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Tên bệnh viện"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
            />
            <input
              type="text"
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
              placeholder="Địa chỉ"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
            />
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={save}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold py-2 rounded-lg"
              >
                Lưu
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
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold shrink-0">
              🏥
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm truncate">
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
                className="text-xs text-teal-600 hover:bg-teal-50 px-2 py-1 rounded transition"
              >
                ✏️
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Xóa bệnh viện này?')) remove(i);
                }}
                className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded transition"
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
  const [input, setInput] = useState('');

  const add = () => {
    if (!input.trim()) return;
    if (list.includes(input.trim())) {
      toast.error('Chuyên khoa đã tồn tại');
      return;
    }
    onChange([...list, input.trim()]);
    setInput('');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="font-bold text-gray-800 mb-4">
        Danh sách Chuyên khoa ({list.length})
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Nhập tên chuyên khoa mới..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
        />
        <button
          onClick={add}
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 rounded-lg text-sm"
        >
          + Thêm
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {list.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-2 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-full"
          >
            <span className="text-sm text-teal-700 font-medium">{s}</span>
            <button
              onClick={() => onChange(list.filter((_, x) => x !== i))}
              className="text-teal-600 hover:text-red-600 font-bold text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}