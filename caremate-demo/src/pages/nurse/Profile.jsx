// src/pages/nurse/Profile.jsx
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { NURSES } from '../../mock';

export default function NurseProfile() {
  const { user, updateNurseProfile } = useStore();
  const nurse = NURSES.find((n) => n.id === user?.nurseId);

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
      toast.error('Ảnh tối đa 2MB');
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
      toast.success('Đã upload bằng cấp');
    };
    reader.readAsDataURL(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleRemoveCert = (idx) => {
    setCerts((c) => c.filter((_, i) => i !== idx));
    toast.success('Đã xóa bằng cấp');
  };

  const handleSave = () => {
    updateNurseProfile(user.nurseId, {
      ...form,
      certs,
    });
    toast.success('Đã lưu hồ sơ chuyên môn');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Hồ sơ chuyên môn
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Khai báo bằng cấp và chứng chỉ hành nghề của bạn
        </p>
      </div>

      {/* Thông tin cá nhân */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 pb-5 border-b">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-teal-200"
          />
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-800">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.phone}</p>
            <span className="inline-block mt-2 text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full font-medium">
              ✓ Điều dưỡng CareMate
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 text-sm">
          <div>
            <p className="text-xs text-gray-400 mb-1">Kinh nghiệm</p>
            <p className="font-semibold text-gray-800">
              {nurse?.exp || 0} năm
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Đánh giá trung bình</p>
            <p className="font-semibold text-gray-800">
              ⭐ {nurse?.rating?.toFixed(1) || '—'}/5.0
            </p>
          </div>
        </div>
      </div>

      {/* Thông tin chứng chỉ */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="font-bold text-gray-800">
          📋 Thông tin chứng chỉ hành nghề
        </h3>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Số hiệu Chứng chỉ hành nghề (Sở Y tế TP.HCM cấp)
          </label>
          <input
            type="text"
            value={form.licenseNumber}
            onChange={(e) => update('licenseNumber', e.target.value)}
            placeholder="VD: CCHN-2024-12345"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Chứng chỉ CPR (Hồi sinh tim phổi)
            </label>
            <input
              type="text"
              value={form.cprCert}
              onChange={(e) => update('cprCert', e.target.value)}
              placeholder="VD: CPR-2024-001"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Chứng chỉ BLS (Sơ cấp cứu cơ bản)
            </label>
            <input
              type="text"
              value={form.blsCert}
              onChange={(e) => update('blsCert', e.target.value)}
              placeholder="VD: BLS-2024-001"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Upload bằng cấp */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">
            📷 Ảnh bằng cấp & chứng chỉ
          </h3>
          <button
            onClick={() => fileRef.current?.click()}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 border border-teal-500 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition"
          >
            + Upload ảnh
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
          <div className="bg-gray-50 rounded-lg p-6 text-center border-2 border-dashed border-gray-200">
            <p className="text-sm text-gray-500">
              Chưa có ảnh bằng cấp. Bấm "Upload ảnh" để thêm.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {certs.map((cert, i) => (
              <div
                key={i}
                className="relative rounded-lg overflow-hidden border border-gray-200 group"
              >
                <img
                  src={cert.url}
                  alt={cert.name}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <button
                    onClick={() => handleRemoveCert(i)}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                  >
                    🗑 Xóa
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate">
                  {cert.name}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 mt-3">
          💡 Ảnh sẽ được đóng watermark CareMate khi hiển thị cho khách hàng
        </p>
      </div>

      {/* Nút lưu */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3 rounded-lg transition"
        >
          💾 Lưu hồ sơ
        </button>
      </div>
    </div>
  );
}