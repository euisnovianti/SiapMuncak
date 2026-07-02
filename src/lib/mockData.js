export const CITIES = ['Bandung', 'Garut'];

export const CATEGORIES = [
  'Tenda',
  'Carrier',
  'Sleeping Bag',
  'Kompor',
  'Sepatu',
  'Penerangan',
  'Trekking Pole'
];

export const INITIAL_EQUIPMENTS = [
  {
    id: 'eq-1',
    store_id: 'store-uuid-bandung',
    name: 'Tenda Eiger Guardian 4P',
    description: 'Tenda double layer berkapasitas 4 orang, tahan badai dan air. Cocok untuk pendakian gunung tinggi.',
    price_per_day: 65000,
    total_stock: 5,
    stok_tersedia: 5,
    category: 'Tenda',
    images: ['https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600&auto=format&fit=crop&q=80'],
    rating: 4.8,
    reviews_count: 3
  },
  {
    id: 'eq-2',
    store_id: 'store-uuid-bandung',
    name: 'Carrier Deuter Aircontact 60+10L',
    description: 'Carrier premium dengan sistem sirkulasi udara Aircontact, sangat nyaman membawa beban berat.',
    price_per_day: 50000,
    total_stock: 4,
    stok_tersedia: 4,
    category: 'Carrier',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80'],
    rating: 4.7,
    reviews_count: 2
  },
  {
    id: 'eq-3',
    store_id: 'store-uuid-bandung',
    name: 'Sleeping Bag Consina Mummy',
    description: 'Sleeping bag hangat dengan isian dacron tebal, menahan suhu ekstrem hingga 0 derajat Celsius.',
    price_per_day: 15000,
    total_stock: 10,
    stok_tersedia: 10,
    category: 'Sleeping Bag',
    images: ['https://images.unsplash.com/photo-1614068307221-50e502c3fe24?w=600&auto=format&fit=crop&q=80'],
    rating: 4.5,
    reviews_count: 5
  },
  {
    id: 'eq-4',
    store_id: 'store-uuid-bandung',
    name: 'Kompor Kovar Portabel & Windshield',
    description: 'Kompor portable praktis dengan pelindung angin (windshield), memasak di puncak jadi lebih mudah.',
    price_per_day: 10000,
    total_stock: 8,
    stok_tersedia: 8,
    category: 'Kompor',
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80'],
    rating: 4.4,
    reviews_count: 1
  },
  {
    id: 'eq-5',
    store_id: 'store-uuid-garut',
    name: 'Sepatu Hiking Columbia Newton Ridge',
    description: 'Sepatu hiking waterproof premium dengan material kulit dan mesh. Sol Omni-Grip anti slip di medan basah.',
    price_per_day: 45000,
    total_stock: 3,
    stok_tersedia: 3,
    category: 'Sepatu',
    images: ['https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&auto=format&fit=crop&q=80'],
    rating: 4.9,
    reviews_count: 4
  },
  {
    id: 'eq-6',
    store_id: 'store-uuid-garut',
    name: 'Headlamp Black Diamond Spot 400',
    description: 'Senter kepala dengan kecerahan hingga 400 lumen, tahan air IPX8, dan beberapa mode penerangan (merah/redup).',
    price_per_day: 8000,
    total_stock: 12,
    stok_tersedia: 12,
    category: 'Penerangan',
    images: ['https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?w=600&auto=format&fit=crop&q=80'],
    rating: 4.6,
    reviews_count: 2
  },
  {
    id: 'eq-7',
    store_id: 'store-uuid-garut',
    name: 'Trekking Pole Leki Makalu',
    description: 'Tongkat pendakian dari bahan aluminium berkekuatan tinggi, sistem kunci Speed Lock+ yang sangat aman.',
    price_per_day: 12000,
    total_stock: 6,
    stok_tersedia: 6,
    category: 'Trekking Pole',
    images: ['https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=600&auto=format&fit=crop&q=80'],
    rating: 4.8,
    reviews_count: 3
  }
];

export const INITIAL_STORES = [
  {
    id: 'store-uuid-bandung',
    owner_id: 'vendor-uuid-2222',
    name: 'Eiger Bandung Store',
    address: 'Jl. Sumatera No. 23, Merdeka, Bandung',
    description: 'Pusat perlengkapan outdoor Eiger terpercaya di Bandung.',
    city: 'Bandung',
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'store-uuid-garut',
    owner_id: 'vendor-uuid-garut-owner',
    name: 'Guntur Outdoor Garut',
    address: 'Jl. Raya Cipanas No. 88, Tarogong Kaler, Garut',
    description: 'Sewa alat outdoor terlengkap dekat pos pendakian Gunung Guntur.',
    city: 'Garut',
    is_verified: true,
    created_at: new Date().toISOString()
  }
];

export const INITIAL_USERS = [
  {
    id: 'admin-uuid-1111',
    email: 'admin@siapmuncak.com',
    password: 'password123',
    raw_user_meta_data: { full_name: 'Admin Siap Muncak', phone: '08123456789' }
  },
  {
    id: 'vendor-uuid-2222',
    email: 'vendor@siapmuncak.com',
    password: 'password123',
    raw_user_meta_data: { full_name: 'Owner Toko Eiger Bandung', phone: '08777654321' }
  },
  {
    id: 'vendor-uuid-garut-owner',
    email: 'vendorgarut@siapmuncak.com',
    password: 'password123',
    raw_user_meta_data: { full_name: 'Asep Guntur', phone: '08132223334' }
  },
  {
    id: 'user-uuid-3333',
    email: 'user@siapmuncak.com',
    password: 'password123',
    raw_user_meta_data: { full_name: 'Budi Pendaki', phone: '08555222333' }
  }
];

export const INITIAL_PROFILES = [
  {
    id: 'admin-uuid-1111',
    full_name: 'Admin Siap Muncak',
    email: 'admin@siapmuncak.com',
    phone: '08123456789',
    is_vendor: false,
    is_verified: true,
    role: 'admin',
    created_at: new Date().toISOString()
  },
  {
    id: 'vendor-uuid-2222',
    full_name: 'Owner Toko Eiger Bandung',
    email: 'vendor@siapmuncak.com',
    phone: '08777654321',
    is_vendor: true,
    is_verified: true,
    role: 'vendor',
    created_at: new Date().toISOString()
  },
  {
    id: 'vendor-uuid-garut-owner',
    full_name: 'Asep Guntur',
    email: 'vendorgarut@siapmuncak.com',
    phone: '08132223334',
    is_vendor: true,
    is_verified: true,
    role: 'vendor',
    created_at: new Date().toISOString()
  },
  {
    id: 'user-uuid-3333',
    full_name: 'Budi Pendaki',
    email: 'user@siapmuncak.com',
    phone: '08555222333',
    is_vendor: false,
    is_verified: false,
    role: 'user',
    created_at: new Date().toISOString()
  }
];
