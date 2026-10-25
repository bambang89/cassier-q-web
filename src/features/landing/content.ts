// Copy landing page. Hanya kemampuan yang ADA di cassier-q-api / cassier-q-web.

export const NAV_LINKS = [
  { href: '#fitur', label: 'Fitur' },
  { href: '#solusi', label: 'Solusi Bisnis' },
  { href: '#harga', label: 'Harga' },
  { href: '#tentang', label: 'Tentang Kami' },
  { href: '#faq', label: 'FAQ' },
];


export const PAINS = [
  {
    pain: 'Sulit mengetahui penjualan harian secara akurat.',
    fix: 'Setiap transaksi kasir tercatat otomatis. Ringkasan penjualan, jumlah transaksi, dan produk terlaris bisa dilihat kapan saja.',
  },
  {
    pain: 'Stok di catatan sering tidak sama dengan di rak.',
    fix: 'Stok berkurang otomatis saat terjual, ada penanda stok menipis, stok opname, dan catatan barang rusak untuk koreksi.',
  },
  {
    pain: 'Rekap penjualan akhir hari memakan waktu.',
    fix: 'Buka–tutup shift kasir dengan modal awal, lalu laporan per jam, per hari, dan per metode pembayaran tersusun sendiri.',
  },
  {
    pain: 'Sulit mengatur siapa boleh melakukan apa.',
    fix: 'Peran Kepala Toko, Produk, Gudang, dan Kasir dengan menu & hak aksi yang bisa diatur — termasuk batas diskon kasir.',
  },
  {
    pain: 'Pesanan dari WhatsApp dan meja tercecer.',
    fix: 'Halaman toko online dan link per meja: pesanan pembeli langsung masuk ke menu Pesanan di kasir, lengkap dengan statusnya.',
  },
];

export const MAIN_FEATURES = [
  {
    id: 'kasir',
    eyebrow: 'Sistem kasir digital',
    title: 'Transaksi cepat, rapi, dan tercatat',
    what: 'Cari produk atau scan barcode, atur jumlah dan satuan, pakai kode promo, lalu terima pembayaran Tunai, QRIS, Kartu Debit, Kartu Kredit, atau Transfer. Struk bisa dicetak ukuran 58 mm atau 80 mm.',
    why: 'Antrean lebih cepat, salah hitung berkurang, dan setiap rupiah yang masuk tercatat per shift kasir.',
    points: ['Buka & tutup shift kasir', 'Diskon manual dengan batas untuk kasir', 'PPN bisa diaktifkan per toko', 'Pembatalan transaksi mengembalikan stok'],
    mock: 'pos',
  },
  {
    id: 'stok',
    eyebrow: 'Manajemen produk & stok',
    title: 'Tahu persis apa yang ada di gudang',
    what: 'Kelola produk, kategori, satuan & konversinya, harga grosir bertingkat, paket produk, foto, dan stok minimum. Pantau mutasi stok, lakukan stok opname, dan catat barang rusak.',
    why: 'Tidak kehabisan barang laris, tidak menumpuk barang lambat, dan selisih stok mudah dilacak asal-usulnya.',
    points: ['Peringatan stok menipis', 'Pesanan pembelian & penerimaan barang dari pemasok', 'Paket mengambil stok dari isi paketnya', 'Harga grosir otomatis sesuai jumlah'],
    mock: 'stock',
  },
  {
    id: 'laporan',
    eyebrow: 'Laporan & analitik penjualan',
    title: 'Keputusan berdasarkan data, bukan tebakan',
    what: 'Lihat penjualan kotor, jumlah transaksi, produk terlaris, perbandingan dengan periode sebelumnya, serta rincian harian, per jam, dan per metode pembayaran.',
    why: 'Anda tahu jam ramai untuk mengatur karyawan, produk mana yang perlu distok lebih, dan tren usaha dari waktu ke waktu.',
    points: ['Perbandingan periode', 'Rincian per jam & per hari', 'Komposisi metode pembayaran', 'Top produk terlaris'],
    mock: 'report',
  },
  {
    id: 'online',
    eyebrow: 'Toko online & pesanan',
    title: 'Terima pesanan dari ponsel pembeli',
    what: 'Susun halaman toko online sendiri dengan editor drag & drop, bagikan link toko atau link khusus tiap meja. Pesanan masuk ke menu Pesanan di kasir dan dibayar seperti transaksi biasa.',
    why: 'Pembeli bisa memesan tanpa antre, dan pesanan tidak lagi tercecer di chat.',
    points: ['Ambil sendiri, diantar, atau makan di tempat', 'Link per nomor meja', 'Status pesanan bisa dilacak pembeli', 'Notifikasi pesanan baru di kasir'],
    mock: 'orders',
  },
] as const;

export const MORE_FEATURES = [
  { icon: 'employee', title: 'Karyawan & hak akses', text: 'Peran Kepala Toko, Produk, Gudang, Kasir. Atur menu yang terlihat tiap peran.' },
  { icon: 'people', title: 'Pelanggan & piutang', text: 'Simpan data pelanggan, catat kasbon, dan terima pembayaran cicilannya.' },
  { icon: 'truck', title: 'Pemasok & pembelian', text: 'Buat pesanan pembelian dan terima barang langsung menambah stok.' },
  { icon: 'discount', title: 'Kode promo', text: 'Buat promo dengan aturan Anda dan batasi siapa yang boleh memakainya.' },
  { icon: 'layers', title: 'Paket & harga grosir', text: 'Jual paket bundling dan harga bertingkat untuk pembelian dalam jumlah besar.' },
  { icon: 'print', title: 'Struk 58 / 80 mm', text: 'Cetak struk dari kasir sesuai ukuran printer thermal Anda.' },
] as const;

export const ROADMAP = ['Pengelolaan banyak outlet secara mandiri', 'Fitur khusus kafe & restoran (modifier, open bill)', 'Pencatatan pengeluaran', 'Integrasi dengan layanan pihak ketiga'];

export const SOLUTIONS = [
  {
    title: 'Retail & minimarket',
    challenge: 'Ratusan barang, antrean di jam sibuk, stok cepat berubah.',
    help: 'Scan barcode, harga grosir bertingkat, stok minimum, dan pesanan pembelian ke pemasok.',
  },
  {
    title: 'Kafe & restoran',
    challenge: 'Pesanan meja dan pesanan bawa pulang datang bersamaan.',
    help: 'Link pesanan per meja, menu Pesanan dengan status, dan pembayaran di kasir.',
  },
  {
    title: 'Fashion & pakaian',
    challenge: 'Banyak barang mirip, sulit tahu mana yang laku.',
    help: 'Kategori, foto produk, laporan produk terlaris, dan kode promo musiman.',
  },
  {
    title: 'Toko kelontong & sembako',
    challenge: 'Penjualan eceran & grosir, banyak pelanggan langganan berutang.',
    help: 'Konversi satuan (pcs, pak, dus), harga grosir, dan catatan piutang pelanggan.',
  },
  {
    title: 'Salon & barbershop',
    challenge: 'Jasa dan produk perawatan dicatat terpisah atau tidak dicatat.',
    help: 'Catat layanan sebagai item kasir bersama produk, lengkap dengan laporan per metode bayar.',
  },
  {
    title: 'Usaha yang sedang tumbuh',
    challenge: 'Mulai menambah karyawan dan butuh kontrol.',
    help: 'Hak akses per peran, shift kasir, dan riwayat transaksi yang bisa ditelusuri.',
  },
] as const;

export const BENEFITS = [
  { title: 'Transaksi lebih praktis', text: 'Dari pilih produk sampai cetak struk dalam satu layar.' },
  { title: 'Penjualan mudah dipantau', text: 'Ringkasan dan tren penjualan siap kapan pun Anda butuh.' },
  { title: 'Stok lebih teratur', text: 'Setiap barang masuk, terjual, dan rusak punya catatannya.' },
  { title: 'Laporan mudah dipahami', text: 'Angka disajikan per hari, per jam, dan per metode bayar.' },
  { title: 'Operasional lebih tertata', text: 'Setiap karyawan bekerja sesuai perannya.' },
] as const;

export const STEPS = [
  { title: 'Daftar akun & toko', text: 'Isi data toko dan akun Kepala Toko langsung dari halaman pendaftaran — atau hubungi tim kami untuk dibantu.' },
  { title: 'Atur produk & karyawan', text: 'Masukkan produk, harga, stok awal, metode pembayaran, lalu buat akun untuk karyawan sesuai perannya.' },
  { title: 'Mulai berjualan', text: 'Buka shift kasir dan layani pembeli. Laporan terbentuk otomatis dari setiap transaksi.' },
] as const;

export const FAQS = [
  {
    q: 'Apa itu aplikasi POS?',
    a: 'POS (Point of Sale) adalah sistem kasir untuk mencatat penjualan. cassier-Q menggabungkan kasir dengan pengelolaan produk, stok, pelanggan, karyawan, dan laporan dalam satu aplikasi.',
  },
  {
    q: 'Bisnis apa saja yang dapat menggunakan cassier-Q?',
    a: 'Usaha yang menjual barang atau jasa melalui kasir: retail & minimarket, toko kelontong, fashion, kafe & restoran, salon, dan sejenisnya. Fitur khusus kafe/restoran seperti modifier dan open bill sedang disiapkan.',
  },
  {
    q: 'Apakah tersedia versi mobile atau desktop?',
    a: 'Ada versi web yang bisa dibuka lewat browser di laptop, tablet, atau ponsel, serta aplikasi mobile cassier-Q. Hubungi tim kami untuk cara memasang aplikasi mobile.',
  },
  {
    q: 'Apakah data penjualan dapat dilihat melalui dashboard?',
    a: 'Ya. Dashboard dan menu Laporan menampilkan ringkasan penjualan, jumlah transaksi, produk terlaris, perbandingan periode, serta rincian per jam, per hari, dan per metode pembayaran.',
  },
  {
    q: 'Bagaimana cara memulai menggunakan POS?',
    a: 'Daftarkan toko Anda di halaman pendaftaran, masukkan produk dan stok awal, buat akun karyawan, lalu buka shift kasir. Jika ingin dibantu, isi form konsultasi di bawah.',
  },
  {
    q: 'Apakah tersedia masa uji coba gratis?',
    a: 'Ketentuan uji coba dan paket berlangganan belum diumumkan di halaman ini. Silakan hubungi tim kami untuk informasi terbaru.',
  },
  {
    q: 'Apakah sistem dapat digunakan untuk beberapa outlet?',
    a: 'Sistem cassier-Q sudah dirancang dengan struktur toko induk dan cabang (katalog produk bersama, harga & stok per toko). Pengelolaan banyak outlet secara mandiri dari aplikasi sedang disiapkan — hubungi tim kami bila usaha Anda memiliki beberapa outlet.',
  },
  {
    q: 'Bagaimana keamanan data bisnis?',
    a: 'Koneksi aplikasi memakai HTTPS, kata sandi disimpan dalam bentuk terenkripsi (hash), sesi login terikat ke perangkat dan dapat dikeluarkan dari semua perangkat, dan setiap karyawan hanya bisa mengakses menu sesuai perannya. Data tiap toko dipisahkan.',
  },
  {
    q: 'Apakah tersedia bantuan teknis?',
    a: 'Ya, Anda dapat menghubungi tim kami melalui form konsultasi di halaman ini.',
  },
  {
    q: 'Berapa biaya berlangganannya?',
    a: 'Informasi harga diberikan langsung oleh tim kami sesuai kebutuhan usaha Anda. Isi form konsultasi untuk mendapatkan penawaran.',
  },
] as const;
