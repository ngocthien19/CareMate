// src/pages/customer/Patients.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import Modal from '../../components/Modal';
import PatientForm from './PatientForm';
import { exportPatientPDF } from '../../utils/exportPatientPDF';

export default function Patients() {
  const navigate = useNavigate();
  const { patients, addPatient, updatePatient, ehrRecords } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (p, e) => {
    e.stopPropagation();
    setEditing(p);
    setModalOpen(true);
  };

  const handleExportPDF = (p, e) => {
    e.stopPropagation();
    try {
      exportPatientPDF(p, ehrRecords[p.id] || []);
      toast.success('Đã tải file PDF');
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi khi xuất PDF');
    }
  };

  const handleSubmit = (data) => {
    if (editing) {
      updatePatient(editing.id, data);
      toast.success('Đã cập nhật hồ sơ');
    } else {
      const newPatient = { ...data, id: Date.now() };
      addPatient(newPatient);
      toast.success('Đã thêm người thân');
    }
    setModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header — nền TEAL đơn sắc */}
      <div className="relative rounded-2xl overflow-hidden bg-teal-600 p-6 shadow-lg">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-400/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-400/10 rounded-full blur-3xl" />

        <div className="relative flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-pulse" />
              <span className="text-[10px] font-semibold text-white">
                Sổ sức khỏe số
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              👨‍👩‍👧 Hồ sơ người thân
            </h1>
            <p className="text-sm text-teal-50 mt-1">
              Quản lý thông tin y tế của Bố, Mẹ, Ông, Bà trọn đời
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-5 py-2.5 rounded-xl transition shadow-lg shadow-teal-900/20 hover:-translate-y-0.5 flex items-center gap-2"
          >
            <span className="text-lg leading-none">+</span> Thêm người thân
          </button>
        </div>
      </div>

      {/* Danh sách */}
      {patients.length === 0 ? (
        <div className="bg-teal-50 rounded-2xl p-12 text-center border-2 border-dashed border-teal-200">
          <div className="text-5xl mb-3">👨‍👩‍👧</div>
          <p className="text-gray-600 mb-4">Chưa có hồ sơ người thân nào</p>
          <button
            onClick={handleAdd}
            className="text-rose-500 font-semibold hover:underline"
          >
            Thêm người thân đầu tiên →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {patients.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/customer/patients/${p.id}`)}
              className="relative bg-white rounded-2xl p-5 border border-gray-200 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer group overflow-hidden"
            >
              {/* Vệt màu trái — TEAL đơn sắc */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 group-hover:w-1.5 transition-all" />

              {/* Header card */}
              <div className="flex items-start gap-3 mb-3 pl-2">
                {p.avatar ? (
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-teal-300 ring-2 ring-teal-50 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-md shadow-teal-200">
                    {p.name?.charAt(0) || '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate">{p.name}</h3>
                  <p className="text-xs text-gray-500">
                    {p.relation} • {p.gender} • {p.dob}
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-1.5 text-sm text-gray-600 mb-3 pl-2">
                {p.bhyt && (
                  <p className="truncate">
                    <span className="text-gray-400">🆔 BHYT:</span> {p.bhyt}
                  </p>
                )}
                {p.address && (
                  <p className="truncate">
                    <span className="text-gray-400">📍</span> {p.address}
                  </p>
                )}
              </div>

              {/* Cảnh báo đỏ */}
              {p.allergies?.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3 ml-2">
                  <p className="text-xs text-red-700 font-semibold">
                    🚨 Dị ứng: {p.allergies.join(', ')}
                  </p>
                </div>
              )}

              {/* Bệnh lý nền */}
              {p.conditions?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3 pl-2">
                  {p.conditions.map((c) => (
                    <span
                      key={c}
                      className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-100 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/customer/patients/${p.id}`);
                  }}
                  className="flex-1 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 py-2 rounded-lg transition shadow-sm shadow-teal-200"
                >
                  Xem bệnh án
                </button>
                <button
                  onClick={(e) => handleExportPDF(p, e)}
                  className="text-xs font-semibold text-rose-500 hover:bg-rose-50 py-2 px-3 rounded-lg transition border border-rose-200"
                  title="Xuất PDF"
                >
                  📄
                </button>
                <button
                  onClick={(e) => handleEdit(p, e)}
                  className="flex-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 py-2 rounded-lg transition border border-gray-200"
                >
                  Sửa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Sửa hồ sơ người thân' : 'Thêm người thân'}
      >
        <PatientForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}