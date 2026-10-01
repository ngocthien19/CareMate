// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import Patients from './pages/customer/Patients';
import PatientDetail from './pages/customer/PatientDetail';

import Booking from './pages/customer/Booking';
import BookingSuccess from './pages/customer/BookingSuccess';

import Tracking from './pages/customer/Tracking';
import TrackingDetail from './pages/customer/TrackingDetail';

import ReportList from './pages/customer/ReportList';
import Report from './pages/customer/Report';

import Medications from './pages/customer/Medications';

function Placeholder({ title, desc }) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      <p className="text-gray-500 mt-2">
        {desc || 'Màn hình demo — sẽ code chi tiết sau.'}
      </p>
    </div>
  );
}

function ProtectedRoute({ role, children }) {
  const { isAuthenticated, user } = useStore();

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  if (role && user.role !== role) {
    const home = {
      customer: '/customer/patients',
      nurse: '/nurse/jobs',
      admin: '/admin/dashboard',
    }[user.role];
    return <Navigate to={home} replace />;
  }
  return <Layout>{children}</Layout>;
}

export default function App() {
  const { isAuthenticated, user } = useStore();

  const home = user
    ? {
        customer: '/customer/patients',
        nurse: '/nurse/jobs',
        admin: '/admin/dashboard',
      }[user.role]
    : '/login';

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to={home} replace /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to={home} replace /> : <Register />}
        />

        {/* Customer */}
        <Route path="/customer/patients" element={
          <ProtectedRoute role="customer"><Patients /></ProtectedRoute>
        } />
        <Route path="/customer/patients/:id" element={
          <ProtectedRoute role="customer"><PatientDetail /></ProtectedRoute>
        } />
        <Route path="/customer/booking" element={
          <ProtectedRoute role="customer"><Booking /></ProtectedRoute>
        } />
        <Route path="/customer/booking/success/:id" element={
          <ProtectedRoute role="customer"><BookingSuccess /></ProtectedRoute>
        } />
        <Route path="/customer/tracking" element={
          <ProtectedRoute role="customer"><Tracking /></ProtectedRoute>
        } />
        <Route path="/customer/tracking/:id" element={
          <ProtectedRoute role="customer"><TrackingDetail /></ProtectedRoute>
        } />
        <Route path="/customer/report" element={
          <ProtectedRoute role="customer"><ReportList /></ProtectedRoute>
        } />
        <Route path="/customer/report/:id" element={
          <ProtectedRoute role="customer"><Report /></ProtectedRoute>
        } />
        <Route path="/customer/medications" element={
          <ProtectedRoute role="customer"><Medications /></ProtectedRoute>
        } />

        {/* Nurse */}
        <Route path="/nurse/jobs" element={
          <ProtectedRoute role="nurse"><Placeholder title="Ca khám của tôi" /></ProtectedRoute>
        } />
        <Route path="/nurse/schedule" element={
          <ProtectedRoute role="nurse"><Placeholder title="Quản lý lịch rảnh" /></ProtectedRoute>
        } />
        <Route path="/nurse/profile" element={
          <ProtectedRoute role="nurse"><Placeholder title="Hồ sơ chuyên môn" /></ProtectedRoute>
        } />
        <Route path="/nurse/stats" element={
          <ProtectedRoute role="nurse"><Placeholder title="Đánh giá & Thu nhập" /></ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute role="admin"><Placeholder title="Giám sát ca khám" /></ProtectedRoute>
        } />
        <Route path="/admin/nurses" element={
          <ProtectedRoute role="admin"><Placeholder title="Quản lý Y tá" /></ProtectedRoute>
        } />
        <Route path="/admin/reviews" element={
          <ProtectedRoute role="admin"><Placeholder title="Duyệt Đánh giá" /></ProtectedRoute>
        } />
        <Route path="/admin/finance" element={
          <ProtectedRoute role="admin"><Placeholder title="Tài chính & VNPay" /></ProtectedRoute>
        } />
        <Route path="/admin/catalog" element={
          <ProtectedRoute role="admin"><Placeholder title="Danh mục Bệnh viện & Chuyên khoa" /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to={home} replace />} />
      </Routes>
    </BrowserRouter>
  );
}