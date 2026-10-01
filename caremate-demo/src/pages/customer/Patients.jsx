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
      const newPatient = {
        ...data,
        id: Date.now(),
      };
      addPatient(newPatient);
      toast.success('Đã thêm người thân');
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hồ sơ người thân</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý thông tin y tế của Bố, Mẹ, Ông, Bà trọn đời
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2.5 rounded-lg transition flex items-center gap-2"
        >
          <span>+</span> Thêm người thân
        </button>
      </div>

      {/* Danh sách */}
      {patients.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
          <div className="text-5xl mb-3">👨‍👩‍👧</div>
          <p className="text-gray-500 mb-4">Chưa có hồ sơ người thân nào</p>
          <button
            onClick={handleAdd}
            className="text-teal-600 font-semibold hover:underline"
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
              className="bg-white rounded-xl p-5 border border-gray-200 hover:border-teal-400 hover:shadow-md transition cursor-pointer group"
            >
              {/* Header card */}
              <div className="flex items-start gap-3 mb-3">
                {p.avatar ? (
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg shrink-0">
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
              <div className="space-y-1.5 text-sm text-gray-600 mb-3">
                {p.bhyt && (
                  <p className="truncate">
                    <span className="text-gray-400">BHYT:</span> {p.bhyt}
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
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                  <p className="text-xs text-red-700 font-semibold">
                    🚨 Dị ứng: {p.allergies.join(', ')}
                  </p>
                </div>
              )}

              {/* Bệnh lý nền */}
              {p.conditions?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {p.conditions.map((c) => (
                    <span
                      key={c}
                      className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/customer/patients/${p.id}`);
                  }}
                  className="flex-1 text-xs font-semibold text-teal-600 hover:bg-teal-50 py-2 rounded-lg transition"
                >
                  Xem bệnh án
                </button>
                <button
                  onClick={(e) => handleExportPDF(p, e)}
                  className="text-xs font-semibold text-gray-600 hover:bg-gray-50 py-2 px-3 rounded-lg transition"
                  title="Xuất PDF"
                >
                  📄
                </button>
                <button
                  onClick={(e) => handleEdit(p, e)}
                  className="flex-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 py-2 rounded-lg transition"
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