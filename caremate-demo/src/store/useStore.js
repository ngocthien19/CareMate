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

      accounts: [
        MOCK_USERS.customer,
        MOCK_USERS.nurse,
        MOCK_USERS.nurse2,
        MOCK_USERS.nurse3,
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

      // ===== DATA =====
      bookings: BOOKINGS,
      nurses: NURSES,
      patients: PATIENTS,
      reviews: REVIEWS,
      transactions: TRANSACTIONS,
      ehrRecords: INITIAL_EHR,

      medicationTicks: {},
      rebookDraft: null,

      nurseSchedules: {
        1: {
          1: { morning: true, afternoon: true },
          2: { morning: true, afternoon: false },
          3: { morning: true, afternoon: true },
          4: { morning: false, afternoon: true },
          5: { morning: true, afternoon: true },
          6: { morning: false, afternoon: false },
          0: { morning: false, afternoon: false },
        },
      },

      // 👇 Admin
      lockedNurses: [],
      sosAlerts: [],
      customHospitals: null,
      customSpecialties: null,

      // ===== ACTIONS =====
      addBooking: (b) => set((s) => ({ bookings: [...s.bookings, b] })),
      updateBooking: (id, patch) =>
        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === id ? { ...b, ...patch } : b
          ),
        })),
      addReview: (r) => set((s) => ({ reviews: [...s.reviews, r] })),
      addPatient: (p) => set((s) => ({ patients: [...s.patients, p] })),
      updatePatient: (id, patch) =>
        set((s) => ({
          patients: s.patients.map((p) =>
            p.id === id ? { ...p, ...patch } : p
          ),
        })),

      addEHRRecord: (patientId, record) =>
        set((s) => {
          const current = s.ehrRecords[patientId] || [];
          return {
            ehrRecords: {
              ...s.ehrRecords,
              [patientId]: [record, ...current],
            },
          };
        }),

      toggleMedicationTick: (key) =>
        set((s) => ({
          medicationTicks: {
            ...s.medicationTicks,
            [key]: !s.medicationTicks[key],
          },
        })),

      setRebookDraft: (draft) => set({ rebookDraft: draft }),
      clearRebookDraft: () => set({ rebookDraft: null }),

      updateNurseProfile: (nurseId, patch) =>
        set((s) => ({
          nurses: s.nurses.map((n) =>
            n.id === nurseId ? { ...n, ...patch } : n
          ),
        })),

      updateNurseSchedule: (nurseId, schedule) =>
        set((s) => ({
          nurseSchedules: {
            ...s.nurseSchedules,
            [nurseId]: schedule,
          },
        })),

      // ===== ADMIN =====

      // Thêm y tá mới + tạo account đăng nhập
      addNurse: (nurse) =>
        set((s) => {
          const newAccount = {
            phone: nurse.phone,
            password: nurse.password || '123456',
            name: nurse.name,
            role: 'nurse',
            nurseId: nurse.id,
            avatar: nurse.avatar,
          };
          return {
            nurses: [...s.nurses, nurse],
            accounts: [...s.accounts, newAccount],
          };
        }),

      toggleNurseLock: (nurseId) =>
        set((s) => ({
          lockedNurses: s.lockedNurses.includes(nurseId)
            ? s.lockedNurses.filter((id) => id !== nurseId)
            : [...s.lockedNurses, nurseId],
        })),

      sendSOS: (data) =>
        set((s) => ({
          sosAlerts: [
            {
              ...data,
              id: Date.now(),
              time: new Date().toISOString(),
              resolved: false,
            },
            ...s.sosAlerts,
          ],
        })),

      resolveSOS: (id) =>
        set((s) => ({
          sosAlerts: s.sosAlerts.map((a) =>
            a.id === id ? { ...a, resolved: true } : a
          ),
        })),

      toggleReviewVisibility: (reviewId) =>
        set((s) => ({
          reviews: s.reviews.map((r) =>
            r.id === reviewId ? { ...r, visible: r.visible === false } : r
          ),
        })),

      setCustomHospitals: (list) => set({ customHospitals: list }),
      setCustomSpecialties: (list) => set({ customSpecialties: list }),

      // ===== RESET DEMO =====
      resetDemo: () => {
        localStorage.clear();
        window.location.reload();
      },
    }),
    { name: 'caremate-demo' }
  )
);