import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@services/session';
import { DEMO_ROLE_PRESETS } from './loginPresets';

export interface MetricItem {
  label: string;
  value: string;
  status: string;
}

export interface ShowcaseSlide {
  id: number;
  badge: string;
  cardTitle: string;
  cardBadge: string;
  metrics: MetricItem[];
  featureTag: string;
  headline: string;
  subtext: string;
}

export const SHOWCASE_SLIDES: ShowcaseSlide[] = [
  {
    id: 1,
    badge: 'SIKLUS AKTIF',
    cardTitle: 'Monitoring Hatchery Real-Time',
    cardBadge: 'SIKLUS AKTIF',
    metrics: [
      { label: 'SURVIVAL RATE (SR)', value: '84.7 %', status: '↑ Di atas target SOP (≥70%)' },
      { label: 'KUALITAS AIR', value: '29.5 °C', status: 'Suhu Optimal (pH 7.8)' },
      { label: 'LAB MIKRO (TCBS)', value: 'NEGATIF', status: '0 Luminescent Vibrio' },
      { label: 'PENGESAHAN DATA', value: 'VERIFIED', status: 'Paraf Ka. Produksi' }
    ],
    featureTag: 'Sistem Operasional Terintegrasi',
    headline: 'Perekaman Kualitas Air & Multi-Tier Approval',
    subtext: 'Portal terpadu untuk otomasi pencatatan laboratorium, mitigasi amonia dini, dan pengesahan berantai dari teknisi hingga pimpinan.'
  },
  {
    id: 2,
    badge: 'KONTROL QUALITY',
    cardTitle: 'Otomasi Parameter Kimia & Biosecurity',
    cardBadge: 'LAB MIKRO',
    metrics: [
      { label: 'KADAR AMONIA (TAN)', value: '0.15 ppm', status: '✓ Aman (< 0.5 ppm)' },
      { label: 'SALINITAS AIR', value: '30 ppt', status: 'Sesuai Standar Maturasi' },
      { label: 'BAKTERI VIBRIO', value: '0 CFU/mL', status: 'TCBS Bebas Luminesensi' },
      { label: 'LOG OTOMASI', value: 'REAL-TIME', status: 'Terhubung Sensor IoT' }
    ],
    featureTag: 'Mitigasi Risiko & Biosafety',
    headline: 'Deteksi Dini Amonia & Protokol Karantina',
    subtext: 'Peringatan otomatis saat sensor mendeteksi lonjakan amonia, lengkap dengan rekomendasi tindakan korektif dan instruksi sifon otomatis.'
  },
  {
    id: 3,
    badge: 'PANEN & PENGIRIMAN',
    cardTitle: 'Traceability & Sertifikasi Benur',
    cardBadge: 'VERIFIKASI',
    metrics: [
      { label: 'TARGET PANEN PL', value: '10,000,000', status: 'Est. Panen: 3 Hari Lagi' },
      { label: 'KUALITAS BENUR', value: 'GRADE A+', status: 'Lolos Test Stress Formalin' },
      { label: 'SERTIFIKAT BEBAS WSSV', value: 'TERBIT', status: 'PCR Lab Negatif TSV/WSSV' },
      { label: 'PENGESAHAN DIREKSI', value: 'APPROVED', status: 'Siap Distribusi Tambak' }
    ],
    featureTag: 'Traceability & Mutu Benur',
    headline: 'Laporan Digital & Transparansi Pengiriman',
    subtext: 'Pengesahan berantai digital dengan tanda tangan elektronik untuk jaminan mutu benur vaname sebelum pengiriman ke pelanggan.'
  }
];

export function useLoginController() {
  const navigate = useNavigate();
  
  // Auth Form States
  const [username, setUsername] = useState('manager');
  const [password, setPassword] = useState('prima123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHelpdeskModal, setShowHelpdeskModal] = useState(false);

  // Showcase Carousel State
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false);

  // Carousel Navigation Handlers
  const nextSlide = () => {
    setActiveSlideIndex((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
  };

  const prevSlide = () => {
    setActiveSlideIndex((prev) => (prev - 1 + SHOWCASE_SLIDES.length) % SHOWCASE_SLIDES.length);
  };

  const goToSlide = (index: number) => {
    if (index >= 0 && index < SHOWCASE_SLIDES.length) {
      setActiveSlideIndex(index);
    }
  };

  // Auto-play timer (5 seconds interval)
  useEffect(() => {
    if (isAutoPlayPaused) return;

    const timer = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlayPaused]);

  // Submit Handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Harap isi username dan kata sandi!');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      const success = login(username, password);
      if (success) {
        navigate('/');
      } else {
        setErrorMsg('Kredensial tidak cocok. Periksa kembali Username/NIP dan Kata Sandi Anda.');
        setIsLoading(false);
      }
    }, 450);
  };

  // Helper actions
  const applyDemoRole = (roleUsername: string) => {
    setUsername(roleUsername);
    setPassword('prima123');
    setErrorMsg('');
  };

  const toggleShowPassword = () => setShowPassword(prev => !prev);
  const toggleHelpdeskModal = (show?: boolean) => setShowHelpdeskModal(prev => show ?? !prev);

  return {
    // Form Values & Setters
    username,
    setUsername,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    showPassword,
    toggleShowPassword,

    // Statuses
    errorMsg,
    isLoading,

    // Modals
    showHelpdeskModal,
    toggleHelpdeskModal,

    // Carousel State & Methods
    activeSlide: SHOWCASE_SLIDES[activeSlideIndex],
    activeSlideIndex,
    slides: SHOWCASE_SLIDES,
    nextSlide,
    prevSlide,
    goToSlide,
    setIsAutoPlayPaused,

    // Handlers & Presets
    handleLoginSubmit,
    applyDemoRole,
    demoRolePresets: DEMO_ROLE_PRESETS
  };
}
