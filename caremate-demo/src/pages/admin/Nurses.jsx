// src/pages/admin/Nurses.jsx
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import Modal from '../../components/Modal';
import { calcNurseRating } from '../../utils/calcNurseRating';

export default function AdminNurses() {
  const {
    nurses,
    reviews,
    lockedNurses,
    toggleNurseLock,
    addNurse,
    accounts,
    ...rest
  } = useStore();

  const [detailOpen, setDetailOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  const handleView = (nurse) => {
    setEditing(nurse);
    setDetailOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý Y tá
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Xác thực hồ sơ pháp lý, khóa/mở tài khoản nhân sự
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2.5 rounded-lg transition"
        >
          + Thêm Y tá mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Tổng Y tá</p>
          <p className="text-2xl font-bold text-gray-800">{nurses.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Đang hoạt động</p>
          <p className="text-2xl font-bold text-teal-600">
            {nurses.length - lockedNurses.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Đã khóa</p>
          <p className="text-2xl font-bold text-red-600">
            {lockedNurses.length}
          </p>
        </div>
      </div>

      {/* Bảng */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">
                Y tá
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">
                Chứng chỉ
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">
                Đánh giá
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">
                Trạng thái
              </th>
              <th className="text-right px-4 py-3 font-semibold text-gray-700">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {nurses.map((n) => {
              const locked = lockedNurses.includes(n.id);
              const { rating, count } = calcNurseRating(n.id, reviews, n.rating);
              return (
                <tr key={n.id} className={locked ? 'bg-red-50/30' : ''}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={n.avatar}
                        alt={n.name}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                      <div>
                        <p className="font-semibold text-gray-800">
                          {n.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID #{n.id} • {n.exp} năm KN
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-600">
                      <p>
                        CCHN: <b>{n.licenseNumber || '—'}</b>
                      </p>
                      <p>CPR: {n.cprCert || '—'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800">
                      ⭐ {rating.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {count} đánh giá
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {locked ? (
                      <span className="text-xs bg-red-100 text-red-700 border border-red-200 px-2 py-1 rounded-full font-semibold">
                        🔒 Đã khóa
                      </span>
                    ) : (
                      <span className="text-xs bg-teal-100 text-teal-700 border border-teal-200 px-2 py-1 rounded-full font-semibold">
                        ✓ Hoạt động
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleView(n)}
                        className="text-xs font-semibold text-teal-600 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition"
                      >
                        👁 Xem
                      </button>
                      <button
                        onClick={() => {
                          toggleNurseLock(n.id);
                          toast.success(
                            locked
                              ? `Đã mở khóa ${n.name}`
                              : `Đã khóa ${n.name}`
                          );
                        }}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                          locked
                            ? 'text-teal-600 hover:bg-teal-50'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                      >
                        {locked ? '🔓 Mở' : '🔒 Khóa'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal xem chi tiết */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Hồ sơ pháp lý của Y tá"
        maxWidth="max-w-2xl"
      >
        {editing && <NurseLegalDetail nurse={editing} />}
      </Modal>

      {/* Modal thêm y tá */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Thêm Y tá mới"
        maxWidth="max-w-lg"
      >
        <AddNurseForm
          onSave={(newNurse) => {
            addNurse(newNurse);
            toast.success('Đã thêm Y tá mới');
            setAddOpen(false);
          }}
          onCancel={() => setAddOpen(false)}
          existingIds={nurses.map((n) => n.id)}
        />
      </Modal>
    </div>
  );
}

// ===== Chi tiết pháp lý =====
function NurseLegalDetail({ nurse }) {
  const legalDocs = [
    { name: 'CCCD/CMND', url: `https://picsum.photos/seed/cccd${nurse.id}/600/380` },
    {
      name: 'Bằng tốt nghiệp',
      url: `https://picsum.photos/seed/bang${nurse.id}/600/380`,
    },
    {
      name: 'Chứng chỉ hành nghề',
      url: `https://picsum.photos/seed/cchn${nurse.id}/600/380`,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <img
          src={nurse.avatar}
          alt={nurse.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-teal-200"
        />
        <div>
          <p className="text-lg font-bold text-gray-800">{nurse.name}</p>
          <p className="text-sm text-gray-500">
            {nurse.age} tuổi • {nurse.exp} năm kinh nghiệm
          </p>
          <p className="text-xs text-gray-500 mt-1">
            CCHN: <b>{nurse.licenseNumber || '—'}</b>
          </p>
        </div>
      </div>

      {/* Hồ sơ pháp lý */}
      <div>
        <p className="text-sm font-bold text-gray-800 mb-3">
          📋 Hồ sơ pháp lý (có watermark CareMate)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {legalDocs.map((doc, i) => (
            <div
              key={i}
              className="relative rounded-lg overflow-hidden border border-gray-200"
            >
              <img
                src={doc.url}
                alt={doc.name}
                className="w-full h-36 object-cover"
              />
              {/* Watermark */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="text-teal-500/30 text-xl font-black rotate-[-25deg] tracking-wider">
                  CAREMATE VERIFIED
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-2 py-1">
                {doc.name}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-2 italic">
          * Watermark được tự động đóng khi public lên web
        </p>
      </div>
    </div>
  );
}

// ===== Form thêm y tá =====
function AddNurseForm({ onSave, onCancel, existingIds }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '123456',
    age: '',
    exp: '',
    licenseNumber: '',
    cprCert: '',
    blsCert: '',
  });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.name.trim()) return toast.error('Nhập họ tên');
    if (!/^0\d{9}$/.test(form.phone)) return toast.error('SĐT không hợp lệ');

    const newId = Math.max(...existingIds, 0) + 1;
    onSave({
      id: newId,
      name: form.name.trim(),
      age: Number(form.age) || 25,
      exp: Number(form.exp) || 1,
      rating: 5.0,
      avatar: `https://i.pravatar.cc/200?u=${form.phone}`,
      certs: ['Bằng Y Dược', 'CCHN Sở Y tế'],
      licenseNumber: form.licenseNumber,
      cprCert: form.cprCert,
      blsCert: form.blsCert,
      reviews: [],
      phone: form.phone,
      password: form.password,
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
        💡 Tài khoản đăng nhập mặc định: SĐT + mật khẩu <b>123456</b>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Họ và tên *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Nguyễn Văn X"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            SĐT đăng nhập *
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) =>
              update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))
            }
            placeholder="0901234567"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Tuổi
          </label>
          <input
            type="text"
            value={form.age}
            onChange={(e) =>
              update('age', e.target.value.replace(/\D/g, '').slice(0, 2))
            }
            placeholder="28"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Số năm kinh nghiệm
          </label>
          <input
            type="text"
            value={form.exp}
            onChange={(e) =>
              update('exp', e.target.value.replace(/\D/g, '').slice(0, 2))
            }
            placeholder="5"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Số hiệu CCHN
        </label>
        <input
          type="text"
          value={form.licenseNumber}
          onChange={(e) => update('licenseNumber', e.target.value)}
          placeholder="CCHN-2024-XXXXX"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Chứng chỉ CPR
          </label>
          <input
            type="text"
            value={form.cprCert}
            onChange={(e) => update('cprCert', e.target.value)}
            placeholder="CPR-2024-XXX"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Chứng chỉ BLS
          </label>
          <input
            type="text"
            value={form.blsCert}
            onChange={(e) => update('blsCert', e.target.value)}
            placeholder="BLS-2024-XXX"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50"
        >
          Hủy
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-lg"
        >
          Tạo tài khoản
        </button>
      </div>
    </div>
  );
}