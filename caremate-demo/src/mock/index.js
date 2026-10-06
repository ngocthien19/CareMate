// src/mock/index.js

// ===== USERS FOR 3 ROLES =====
// Default password for all demo accounts: 123456
export const MOCK_USERS = {
  customer: {
    phone: '0901234567',
    password: '123456',
    name: 'Nguyễn Văn Dũng',
    role: 'customer',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
  },
  nurse: {
    phone: '0902345678',
    password: '123456',
    name: 'Nguyễn Thị Lan',
    role: 'nurse',
    nurseId: 1,
    avatar:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=faces',
  },
  nurse2: {
    phone: '0902345679',
    password: '123456',
    name: 'Trần Văn Minh',
    role: 'nurse',
    nurseId: 2,
    avatar:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=faces',
  },
  nurse3: {
    phone: '0902345680',
    password: '123456',
    name: 'Lê Thị Hoa',
    role: 'nurse',
    nurseId: 3,
    avatar:
      'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=faces',
  },
  nurse4: {
    phone: '0902345681',
    password: '123456',
    name: 'Phạm Quốc Bảo',
    role: 'nurse',
    nurseId: 4,
    avatar:
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=faces',
  },
  admin: {
    phone: '0903456789',
    password: '123456',
    name: 'Admin CareMate',
    role: 'admin',
    avatar:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=faces',
  },
};

// ===== HOSPITALS IN HCMC =====
export const HOSPITALS = [
  { id: 1, name: 'Cho Ray Hospital', address: '201B Nguyen Chi Thanh, Dist. 5' },
  { id: 2, name: 'University Medical Center HCMC', address: '215 Hong Bang, Dist. 5' },
  { id: 3, name: 'Oncology Hospital', address: '3 No Trang Long, Binh Thanh' },
  { id: 4, name: 'Gia Dinh Hospital', address: '1 No Trang Long, Binh Thanh' },
  { id: 5, name: 'Vinmec Central Park', address: '208 Nguyen Huu Canh, Binh Thanh' },
  { id: 6, name: 'Tam Anh Hospital HCMC', address: '2B Pho Quang, Tan Binh' },
];

// ===== SPECIALTIES =====
export const SPECIALTIES = [
  'General',
  'Endocrinology',
  'Cardiology',
  'Orthopedics',
  'Gastroenterology',
  'Neurology',
  'Ophthalmology',
  'ENT',
];

// ===== NURSES =====
export const NURSES = [
  {
    id: 1,
    name: 'Nguyễn Thị Lan',
    age: 28,
    exp: 5,
    rating: 4.9,
    avatar:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=faces',
    certs: ['College Diploma in Medicine', 'HCMC Practice License', 'BLS'],
    licenseNumber: 'CCHN-2024-12345',
    cprCert: 'CPR-2024-001',
    blsCert: 'BLS-2024-001',
    legalDocs: {
      cccd: 'https://picsum.photos/seed/cccd1/600/380',
      degree: 'https://picsum.photos/seed/degree1/600/380',
      license: 'https://picsum.photos/seed/license1/600/380',
    },
    reviews: [
      { stars: 5, comment: 'Very attentive', tags: ['onTime', 'caring'] },
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
    certs: ['Bachelor of Medicine', 'HCMC Practice License'],
    licenseNumber: 'CCHN-2020-67890',
    cprCert: 'CPR-2022-045',
    blsCert: 'BLS-2022-045',
    legalDocs: {
      cccd: 'https://picsum.photos/seed/cccd2/600/380',
      degree: 'https://picsum.photos/seed/degree2/600/380',
      license: 'https://picsum.photos/seed/license2/600/380',
    },
    reviews: [{ stars: 4, comment: 'Good', tags: ['professional'] }],
  },
  {
    id: 3,
    name: 'Lê Thị Hoa',
    age: 26,
    exp: 3,
    rating: 4.8,
    avatar:
      'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=faces',
    certs: ['College Diploma in Medicine', 'HCMC Practice License', 'BLS'],
    licenseNumber: 'CCHN-2023-54321',
    cprCert: 'CPR-2023-088',
    blsCert: 'BLS-2023-088',
    legalDocs: {
      cccd: 'https://picsum.photos/seed/cccd3/600/380',
      degree: 'https://picsum.photos/seed/degree3/600/380',
      license: 'https://picsum.photos/seed/license3/600/380',
    },
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
    certs: ['Bachelor of Medicine', 'HCMC Practice License', 'CPR'],
    licenseNumber: 'CCHN-2021-24680',
    cprCert: 'CPR-2021-135',
    blsCert: 'BLS-2021-135',
    legalDocs: {
      cccd: 'https://picsum.photos/seed/cccd4/600/380',
      degree: 'https://picsum.photos/seed/degree4/600/380',
      license: 'https://picsum.photos/seed/license4/600/380',
    },
    reviews: [],
  },
];

// ===== PATIENTS =====
export const PATIENTS = [
  {
    id: 1,
    name: 'Nguyễn Văn Tài',
    relation: 'father',
    dob: '1955',
    gender: 'male',
    bhyt: 'DN123456789',
    address: '123 Le Loi, Dist. 1',
    emergencyPhone: '0378240914',
    avatar:
      'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&h=200&fit=crop&crop=faces',
    allergies: ['penicillin'],
    conditions: ['diabetes', 'hypertension'],
  },
  {
    id: 2,
    name: 'Trần Thị Bích',
    relation: 'mother',
    dob: '1958',
    gender: 'female',
    bhyt: 'DN987654321',
    address: '456 Nguyen Trai, Dist. 5',
    emergencyPhone: '0903456789',
    avatar:
      'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=200&h=200&fit=crop&crop=faces',
    allergies: [],
    conditions: ['cardiovascular'],
  },
];

// ===== BOOKINGS =====
export const BOOKINGS = [
  {
    id: 'BK001',
    patientId: 1,
    nurseId: 1,
    hospitalId: 1,
    specialty: 'Cardiology',
    date: '2026-10-05',
    pickupTime: '06:30',
    pickupType: 'home',
    address: '123 Le Loi',
    district: 'District 1',
    status: 'picking_up',
    startTime: Date.now() - 2 * 3600 * 1000,
    endTime: null,
    paymentStatus: 'paid',
    amount: 899000,
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'BK002',
    patientId: 2,
    nurseId: 2,
    hospitalId: 3,
    specialty: 'Cardiology',
    date: '2026-09-28',
    pickupTime: '07:00',
    pickupType: 'home',
    address: '456 Nguyen Trai',
    district: 'District 5',
    status: 'completed',
    startTime: Date.now() - 26 * 3600 * 1000,
    endTime: Date.now() - 26 * 3600 * 1000 + 5 * 3600 * 1000,
    paymentStatus: 'paid',
    amount: 899000,
    overtimePaymentStatus: 'paid',
    overtimeAmount: 120000,
    overtimeTransaction: {
      transactionId: 'VNPAY_OVERTIME_BK002',
      amount: 120000,
      time: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
    createdAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
  },
  {
    id: 'BK003',
    patientId: 1,
    nurseId: 1,
    hospitalId: 2,
    specialty: 'Endocrinology',
    date: '2026-10-02',
    pickupTime: '08:00',
    pickupType: 'home',
    address: '123 Le Loi',
    district: 'District 1',
    status: 'completed',
    startTime: Date.now() - 5 * 24 * 3600 * 1000,
    endTime: Date.now() - 5 * 24 * 3600 * 1000 + 4.5 * 3600 * 1000,
    paymentStatus: 'paid',
    amount: 899000,
    overtimePaymentStatus: 'paid',
    overtimeAmount: 60000,
    overtimeTransaction: {
      transactionId: 'VNPAY_OVERTIME_BK003',
      amount: 60000,
      time: new Date(
        Date.now() - 5 * 24 * 3600 * 1000 + 5 * 3600 * 1000
      ).toISOString(),
    },
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
];

// ===== REVIEWS =====
export const REVIEWS = [
  {
    id: 1,
    nurseId: 1,
    bookingId: 'BK001',
    stars: 5,
    tags: ['onTime', 'caring'],
    comment:
      'Very satisfied, the nurse was attentive and dedicated to my father.',
    anonymous: false,
    visible: true,
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 2,
    nurseId: 2,
    bookingId: 'BK002',
    stars: 4,
    tags: ['professional'],
    comment: 'Good, enthusiastic support.',
    anonymous: false,
    visible: true,
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 3,
    nurseId: 3,
    stars: 5,
    tags: ['onTime', 'caring', 'detailedReport'],
    comment: 'Nurse Hoa was gentle and took great care of my mother.',
    anonymous: true,
    visible: true,
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 4,
    nurseId: 2,
    stars: 2,
    tags: ['late', 'badAttitude'],
    comment:
      'The nurse arrived 30 minutes late and seemed rushed. My father had to wait quite a while.',
    anonymous: false,
    visible: true,
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 5,
    nurseId: 3,
    stars: 1,
    tags: ['confused', 'blurryReport'],
    comment:
      'Very disappointed. The nurse did not know the way to the exam room and took a long time with procedures. The prescription photos were blurry and unreadable.',
    anonymous: false,
    visible: true,
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 6,
    nurseId: 1,
    stars: 2,
    tags: ['badAttitude'],
    comment: 'The nurse was impatient when talking to my mother.',
    anonymous: true,
    visible: false,
    createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
  },
];

// ===== TRANSACTIONS =====
export const TRANSACTIONS = [
  {
    id: 'T1',
    bookingId: 'BK001',
    type: 'base',
    amount: 899000,
    status: 'success',
    date: '2026-10-05',
  },
  {
    id: 'T2',
    bookingId: 'BK002',
    type: 'base',
    amount: 899000,
    status: 'success',
    date: '2026-09-28',
  },
  {
    id: 'T3',
    bookingId: 'BK002',
    type: 'overtime',
    amount: 120000,
    status: 'success',
    date: '2026-09-29',
  },
  {
    id: 'T4',
    bookingId: 'BK003',
    type: 'base',
    amount: 899000,
    status: 'success',
    date: '2026-10-02',
  },
  {
    id: 'T5',
    bookingId: 'BK003',
    type: 'overtime',
    amount: 60000,
    status: 'success',
    date: '2026-10-02',
  },
];

export const EHR_RECORDS = {
  1: [
    {
      id: 'EHR001',
      bookingId: 'BK001',
      date: '2026-09-15',
      hospital: 'Cho Ray Hospital',
      doctor: 'Dr. Trần Minh Tuấn',
      nurse: 'Nguyễn Thị Lan',
      diagnosis: 'Stage 1 hypertension, type 2 diabetes well controlled',
      advice: 'Take medication regularly, limit salt, follow-up in 1 month',
      vitals: { bp: '135/85', pulse: 78, weight: 65 },
      prescription:
        'Amlodipine 5mg (1 tab/morning), Metformin 500mg (1 tab/morning), Metformin 500mg (1 tab/evening), Vitamin B12 (1 tab/noon)',
      followupDate: '2026-10-10',
      images: [
        {
          name: 'Prescription',
          url: 'https://picsum.photos/seed/rx1/600/400',
        },
        {
          name: 'Lab results',
          url: 'https://picsum.photos/seed/lab1/600/400',
        },
      ],
    },
    {
      id: 'EHR002',
      date: '2026-06-10',
      hospital: 'University Medical Center HCMC',
      doctor: 'Dr. Lê Hoàng Nam',
      nurse: 'Trần Văn Minh',
      diagnosis: 'Routine checkup — all indicators stable',
      advice: 'Maintain current diet',
      vitals: { bp: '130/80', pulse: 75, weight: 66 },
      prescription: 'Continue previous prescription',
      images: [],
    },
  ],
  2: [
    {
      id: 'EHR003',
      date: '2026-09-20',
      hospital: 'Gia Dinh Hospital',
      doctor: 'Dr. Phạm Thúy Hà',
      nurse: 'Lê Thị Hoa',
      diagnosis: 'Mild arrhythmia, mild anemia',
      advice: 'Iron supplement, adequate rest, follow-up in 2 weeks',
      vitals: { bp: '120/75', pulse: 88, weight: 52 },
      prescription: 'Concor 2.5mg (1 tab/morning), Ferrovit (1 tab/morning)',
      images: [
        {
          name: 'Cardiac ultrasound',
          url: 'https://picsum.photos/seed/echo/400/300',
        },
      ],
    },
  ],
};

// ===== PICKUP TIME SLOTS =====
export const TIME_SLOTS = [
  '06:00',
  '06:30',
  '07:00',
  '07:30',
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
];

// ===== DISTRICTS IN HCMC =====
export const DISTRICTS = [
  'District 1',
  'District 3',
  'District 5',
  'District 7',
  'District 10',
  'Binh Thanh',
  'Phu Nhuan',
  'Tan Binh',
  'Tan Phu',
  'Go Vap',
  'Thu Duc',
];