// src/store/useStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  MOCK_USERS, BOOKINGS, NURSES, PATIENTS, REVIEWS, TRANSACTIONS,
  EHR_RECORDS as INITIAL_EHR,
} from '../mock';

export const useStore = create(
  persist(
    (set, get) => ({
      // ===== AUTH =====
      user: null,
      isAuthenticated: false,
      hasAgreedTerms: false,

      accounts: [
        MOCK_USERS.customer,
        MOCK_USERS.nurse,
        MOCK_USERS.admin,
      ],

      registerAccount: (account) => {
        if (account.role !== 'customer') {
          return { ok: false, message: 'Chỉ được đăng ký tài khoản Khách hàng' };
        }
        const exists = get().accounts.some((a) => a.phone === account.phone);
        if (exists) return { ok: false, message: 'SĐT đã được đăng ký' };
        set((s) => ({ accounts: [...s.accounts, account] }));
        return { ok: true };
      },

      login: (phone, password) => {
        const acc = get().accounts.find(
          (a) => a.phone === phone && a.password === password
        );
        if (!acc) return { ok: false, message: 'SĐT hoặc mật khẩu không đúng' };
        set({ user: acc, isAuthenticated: true });
        return { ok: true, user: acc };
      },

      logout: () => set({ user: null, isAuthenticated: false }),
      agreeTerms: () => set({ hasAgreedTerms: true }),

      // ===== DATA =====
      bookings: BOOKINGS,
      nurses: NURSES,
      patients: PATIENTS,
      reviews: REVIEWS,
      transactions: TRANSACTIONS,

      // 👇 EHR động — có thể thêm mới
      ehrRecords: INITIAL_EHR,

      // 👇 Trạng thái tick uống thuốc
        // Key: `${patientId}|${date}|${medId}|${time}`
        medicationTicks: {},

        // 👇 Draft đặt lại lịch (từ nút "Đặt lại 1 chạm")
        rebookDraft: null,

      // ===== ACTIONS =====
      addBooking: (b) => set((s) => ({ bookings: [...s.bookings, b] })),
      updateBooking: (id, patch) => set((s) => ({
        bookings: s.bookings.map((b) => (b.id === id ? { ...b, ...patch } : b)),
      })),
      addReview: (r) => set((s) => ({ reviews: [...s.reviews, r] })),
      addPatient: (p) => set((s) => ({ patients: [...s.patients, p] })),
      updatePatient: (id, patch) => set((s) => ({
        patients: s.patients.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      })),

      // 👇 Thêm bản ghi EHR sau khi khám xong
      addEHRRecord: (patientId, record) => set((s) => {
        const current = s.ehrRecords[patientId] || [];
        return {
          ehrRecords: {
            ...s.ehrRecords,
            [patientId]: [record, ...current], // mới nhất lên đầu
          },
        };
      }),

      toggleMedicationTick: (key) => set((s) => ({
        medicationTicks: {
            ...s.medicationTicks,
            [key]: !s.medicationTicks[key],
        },
    })),

        // 👇 Lưu draft đặt lại lịch
        setRebookDraft: (draft) => set({ rebookDraft: draft }),
        clearRebookDraft: () => set({ rebookDraft: null }),


      // ===== RESET DEMO =====
      resetDemo: () => {
        localStorage.clear();
        window.location.reload();
      },
    }),
    { name: 'caremate-demo' }
  )
);