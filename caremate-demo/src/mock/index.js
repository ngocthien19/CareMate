// src/mock/index.js

// ===== USERS CHO 3 ROLE =====
// Mật khẩu mặc định cho tất cả tài khoản demo: 123456
export const MOCK_USERS = {
  customer: {
    phone: '0901234567',
    password: '123456',
    name: 'Nguyễn Văn Dũng',
    role: 'customer',
    // Ảnh chân dung thật từ Unsplash
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
  },
  // src/mock/index.js — MOCK_USERS
  nurse: {
    phone: '0902345678',
    password: '123456',
    name: 'Nguyễn Thị Lan',
    role: 'nurse',
    nurseId: 1,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=faces',
  },
  // Thêm 3 nurse khác
  nurse2: {
    phone: '0902345679',
    password: '123456',
    name: 'Trần Văn Minh',
    role: 'nurse',
    nurseId: 2,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=faces',
  },
  nurse3: {
    phone: '0902345680',
    password: '123456',
    name: 'Lê Thị Hoa',
    role: 'nurse',
    nurseId: 3,
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=faces',
  },
  nurse4: {
    phone: '0902345681',
    password: '123456',
    name: 'Phạm Quốc Bảo',
    role: 'nurse',
    nurseId: 4,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=faces',
  },
  admin: {
    phone: '0903456789',
    password: '123456',
    name: 'Admin CareMate',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=faces',
  },
};


// ===== BỆNH VIỆN TẠI TP.HCM =====
export const HOSPITALS = [
  { id: 1, name: 'BV Chợ Rẫy', address: '201B Nguyễn Chí Thanh, Q.5' },
  { id: 2, name: 'BV ĐHYD TP.HCM', address: '215 Hồng Bàng, Q.5' },
  { id: 3, name: 'BV Ung Bướu', address: '3 Nơ Trang Long, Bình Thạnh' },
  { id: 4, name: 'BV Gia Định', address: '1 Nơ Trang Long, Bình Thạnh' },
  { id: 5, name: 'Vinmec Central Park', address: '208 Nguyễn Hữu Cảnh, Bình Thạnh' },
  { id: 6, name: 'BV Tâm Anh TP.HCM', address: '2B Phổ Quang, Tân Bình' },
];

// ===== CHUYÊN KHOA =====
export const SPECIALTIES = [
  'Tổng quát', 'Nội tiết', 'Tim mạch', 'Cơ xương khớp',
  'Tiêu hóa', 'Thần kinh', 'Mắt', 'Tai Mũi Họng',
];

// ===== Y TÁ =====
export const NURSES = [
  {
    id: 1,
    name: 'Nguyễn Thị Lan',
    age: 28,
    exp: 5,
    rating: 4.9,
    avatar:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=faces',
    certs: ['Bằng CĐ Y Dược', 'CCHN Sở Y tế', 'BLS'],
    licenseNumber: 'CCHN-2024-12345',
    cprCert: 'CPR-2024-001',
    blsCert: 'BLS-2024-001',
    reviews: [
      { stars: 5, comment: 'Rất chu đáo', tags: ['Đúng giờ', 'Ân cần'] },
    ],
  },
  {
    id: 2,
    name: 'Trần Văn Minh',
    age: 32,
    exp: 7,
    rating: 4.7,
    avatar:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=faces',
    certs: ['Bằng ĐH Y Dược', 'CCHN Sở Y tế'],
    licenseNumber: 'CCHN-2020-67890',
    cprCert: 'CPR-2022-045',
    blsCert: 'BLS-2022-045',
    reviews: [{ stars: 4, comment: 'Tốt', tags: ['Chuyên nghiệp'] }],
  },
  {
    id: 3,
    name: 'Lê Thị Hoa',
    age: 26,
    exp: 3,
    rating: 4.8,
    avatar:
      'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=faces',
    certs: ['Bằng CĐ Y Dược', 'CCHN Sở Y tế', 'BLS'],
    licenseNumber: 'CCHN-2023-54321',
    cprCert: 'CPR-2023-088',
    blsCert: 'BLS-2023-088',
    reviews: [],
  },
  {
    id: 4,
    name: 'Phạm Quốc Bảo',
    age: 30,
    exp: 6,
    rating: 4.6,
    avatar:
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=faces',
    certs: ['Bằng ĐH Y Dược', 'CCHN Sở Y tế', 'CPR'],
    licenseNumber: 'CCHN-2021-24680',
    cprCert: 'CPR-2021-135',
    blsCert: 'BLS-2021-135',
    reviews: [],
  },
];

// ===== NGƯỜI BỆNH =====
export const PATIENTS = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    relation: 'Bố',
    dob: '1955',
    gender: 'Nam',
    bhyt: 'DN123456789',
    address: '123 Lê Lợi, Q.1',
    emergencyPhone: '0378240914',
    // Ảnh chân dung người lớn tuổi
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&h=200&fit=crop&crop=faces',
    allergies: ['Penicillin'],
    conditions: ['Tiểu đường', 'Tăng huyết áp'],
  },
  {
    id: 2,
    name: 'Trần Thị B',
    relation: 'Mẹ',
    dob: '1958',
    gender: 'Nữ',
    bhyt: 'DN987654321',
    address: '456 Nguyễn Trãi, Q.5',
    emergencyPhone: '0903456789',
    avatar: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=200&h=200&fit=crop&crop=faces',
    allergies: [],
    conditions: ['Tim mạch'],
  },
];

// ===== CA KHÁM =====
export const BOOKINGS = [
  // Ca đang chạy bình thường
  {
    id: 'BK001', patientId: 1, nurseId: 1, hospitalId: 1,
    specialty: 'Tim mạch', date: '2026-10-05', pickupTime: '06:30',
    pickupType: 'home',
    address: '123 Lê Lợi', district: 'Quận 1',
    status: 'picking_up',
    startTime: Date.now() - 2 * 3600 * 1000,
    endTime: null,
    paymentStatus: 'paid',
    amount: 499000,
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  // Ca đã hoàn tất — vượt 4h → có phụ phí chưa trả
  {
    id: 'BK002', patientId: 2, nurseId: 2, hospitalId: 3,
    specialty: 'Tim mạch', date: '2026-09-28', pickupTime: '07:00',
    pickupType: 'home',
    address: '456 Nguyễn Trãi', district: 'Quận 5',
    status: 'completed',
    startTime: Date.now() - 26 * 3600 * 1000,
    endTime: Date.now() - 26 * 3600 * 1000 + 5 * 3600 * 1000, // 5 giờ
    paymentStatus: 'paid',
    amount: 499000,
    overtimePaymentStatus: 'unpaid',
    createdAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
  },
];

// ===== ĐÁNH GIÁ =====
export const REVIEWS = [
  {
    id: 1, nurseId: 1, stars: 5, tags: ['Đúng giờ', 'Ân cần'],
    comment: 'Rất hài lòng', anonymous: false, visible: true,
  },
];

// ===== GIAO DỊCH =====
export const TRANSACTIONS = [
  {
    id: 'T1', bookingId: 'BK001', type: 'base', amount: 499000,
    status: 'success', date: '2026-10-05',
  },
];

export const EHR_RECORDS = {
  1: [
    {
      id: 'EHR001',
      bookingId: 'BK001',
      date: '2026-09-15',
      hospital: 'BV Chợ Rẫy',
      doctor: 'BS. Trần Minh Tuấn',
      nurse: 'Nguyễn Thị Lan',
      diagnosis: 'Tăng huyết áp độ 1, đái tháo đường type 2 kiểm soát tốt',
      advice: 'Uống thuốc đều đặn, hạn chế muối, tái khám sau 1 tháng',
      vitals: { bp: '135/85', pulse: 78, weight: 65 },
      prescription: 'Amlodipine 5mg (1v/sáng), Metformin 500mg (1v/sáng, 1v/tối), Vitamin B12 (1v/trưa)',
      followupDate: '2026-10-05', // 👈 CÒN 3 NGÀY → sẽ hiện banner nhắc
      images: [
        { name: 'Đơn thuốc', url: 'https://picsum.photos/seed/rx1/600/400' },
        { name: 'Kết quả xét nghiệm', url: 'https://picsum.photos/seed/lab1/600/400' },
      ],
    },
    {
      id: 'EHR002',
      date: '2026-06-10',
      hospital: 'BV ĐHYD TP.HCM',
      doctor: 'BS. Lê Hoàng Nam',
      nurse: 'Trần Văn Minh',
      diagnosis: 'Kiểm tra định kỳ — các chỉ số ổn định',
      advice: 'Duy trì chế độ ăn hiện tại',
      vitals: { bp: '130/80', pulse: 75, weight: 66 },
      prescription: 'Tiếp tục toa cũ',
      images: [],
    },
  ],
  2: [
    {
      id: 'EHR003',
      date: '2026-09-20',
      hospital: 'BV Gia Định',
      doctor: 'BS. Phạm Thu Hà',
      nurse: 'Lê Thị Hoa',
      diagnosis: 'Rối loạn nhịp tim nhẹ, thiếu máu nhẹ',
      advice: 'Bổ sung sắt, nghỉ ngơi hợp lý, tái khám 2 tuần',
      vitals: { bp: '120/75', pulse: 88, weight: 52 },
      prescription: 'Concor 2.5mg (1v/sáng), Ferrovit (1v/sáng)',
      images: [
        { name: 'Phiếu siêu âm tim', url: 'https://picsum.photos/seed/echo/400/300' },
      ],
    },
  ],
};

// ===== KHUNG GIỜ ĐÓN =====
export const TIME_SLOTS = [
  '06:00', '06:30', '07:00', '07:30', '08:00',
  '08:30', '09:00', '09:30', '10:00',
];

// ===== QUẬN TP.HCM (để chọn địa chỉ đón) =====
export const DISTRICTS = [
  'Quận 1', 'Quận 3', 'Quận 5', 'Quận 7', 'Quận 10',
  'Bình Thạnh', 'Phú Nhuận', 'Tân Bình', 'Tân Phú',
  'Gò Vấp', 'Thủ Đức',
];