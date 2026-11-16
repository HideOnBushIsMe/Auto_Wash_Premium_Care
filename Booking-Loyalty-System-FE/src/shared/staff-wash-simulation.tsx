import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { CarWithEffects } from '@/shared/car-with-effect.tsx';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ChevronLeft, Volume2, VolumeX, AlertTriangle } from 'lucide-react';

// ==========================================
// 🔁 REUSE TYPES & MAPS từ auto-wash-simulation
// ==========================================
type StepType =
    | 'exterior_wash'
    | 'tire_cleaning'
    | 'window_cleaning'
    | 'interior_vacuum'
    | 'tire_shine'
    | 'dashboard_polish'
    | 'wax_coating'
    | 'leather_conditioning'
    | 'engine_cleaning'
    | 'ceramic_spray'
    | 'air_freshener';

interface WashStep {
    id: number;
    type: StepType;
    name: string;
    desc: string;
    camPos: [number, number, number];
}

/** Booking đang InProgress — nhận từ staff dashboard */
export interface StaffInProgressBooking {
    id: string;
    bookingCode: string;
    licensePlate: string;
    vehicleName?: string;
    vehicleType?: string;
    serviceName?: string;
    washPackageId?: string;
    /** JSON string hoặc string[] danh sách features của gói rửa */
    features?: string | string[];
    bayId?: string;
    branchId?: string;
}

interface StaffWashSimulationProps {
    /** Danh sách bookings đang InProgress — truyền từ QueueMonitor / StaffLiveTracking */
    bookings: StaffInProgressBooking[];
    /** Callback khi animation hoàn tất cho một booking. Staff dùng để highlight nút Checkout */
    onWashComplete?: (bookingId: string) => void;
    /** Nếu true, hiển thị nút Back về QueueMonitor */
    showBackButton?: boolean;
}

// ==========================================
// FEATURE → STEP mapping (giữ nguyên logic)
// ==========================================
const FEATURE_MAP: Record<string, { type: StepType; name: string; desc: string; camPos: [number, number, number] }> = {
    "Exterior wash":       { type: 'exterior_wash',      name: 'Rửa ngoại thất',        desc: 'Phun áp lực cao làm sạch toàn bộ thân xe',             camPos: [15, 6, 15]   },
    "Interior vacuum":     { type: 'interior_vacuum',    name: 'Hút bụi nội thất',       desc: 'Hút sạch bụi bẩn trong khoang xe',                     camPos: [0, 4, 8]     },
    "Dashboard polish":    { type: 'dashboard_polish',   name: 'Đánh bóng taplo',         desc: 'Làm sạch và phủ bóng mặt taplo',                       camPos: [0, 3, 5]     },
    "Air freshener":       { type: 'air_freshener',      name: 'Khử mùi nội thất',        desc: 'Xịt nước hoa và khử mùi khoang xe',                    camPos: [0, 5, 10]    },
    "Tire cleaning":       { type: 'tire_cleaning',      name: 'Vệ sinh lốp xe',          desc: 'Chà sạch bùn đất và cao su chai trên lốp',             camPos: [10, 1.5, 10] },
    "Window cleaning":     { type: 'window_cleaning',    name: 'Lau kính',                desc: 'Vệ sinh kính trong suốt không vệt',                    camPos: [0, 5, 12]    },
    "Full exterior wash":  { type: 'exterior_wash',      name: 'Rửa ngoại thất toàn diện', desc: 'Rửa áp lực cao toàn bộ xe bao gồm gầm và cạnh',      camPos: [15, 8, 15]   },
    "Interior deep clean": { type: 'interior_vacuum',    name: 'Vệ sinh nội thất sâu',    desc: 'Làm sạch toàn bộ nội thất kể cả các góc khuất',        camPos: [0, 4, 8]     },
    "Wax coating":         { type: 'wax_coating',        name: 'Phủ wax bảo vệ',          desc: 'Phủ lớp wax bảo vệ sơn xe và tạo độ bóng',            camPos: [12, 6, -12]  },
    "Leather conditioning":{ type: 'leather_conditioning', name: 'Dưỡng da ghế',          desc: 'Thoa dưỡng chất bảo vệ ghế da khỏi nứt nẻ',           camPos: [0, 3, 6]     },
    "Engine bay cleaning": { type: 'engine_cleaning',    name: 'Vệ sinh khoang máy',      desc: 'Làm sạch khoang máy và các chi tiết bên trong',        camPos: [0, 5, -10]   },
    "Ceramic spray":       { type: 'ceramic_spray',      name: 'Phủ ceramic nano',        desc: 'Phủ lớp bảo vệ ceramic tạo màng chắn nước siêu bền',  camPos: [15, 5, 15]   },
    "Tire shine":          { type: 'tire_shine',         name: 'Làm bóng lốp',            desc: 'Dưỡng và làm bóng lốp xe tăng thẩm mỹ',               camPos: [-10, 1.5, 10]},
};

// ==========================================
// HUD COMPONENTS (đơn giản hóa so với bản khách)
// ==========================================
const HUD_MAP: Partial<Record<StepType, React.FC>> = {
    exterior_wash: () => (
        <div className="bg-slate-950/85 backdrop-blur-md text-white p-4 rounded-2xl border border-blue-500/40 shadow-xl animate-in fade-in max-w-[260px]">
            <h5 className="font-bold text-xs text-blue-400 uppercase tracking-widest mb-1">Hệ thống vòi phun</h5>
            <div className="flex items-center gap-2 text-[11px] text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Áp suất: <strong className="text-white">150 Bar</strong></span>
                <span className="text-slate-500">|</span>
                <span>Lưu lượng: <strong className="text-white">12L/p</strong></span>
            </div>
        </div>
    ),
    tire_cleaning: () => (
        <div className="bg-slate-950/85 backdrop-blur-md text-white p-4 rounded-2xl border border-amber-500/40 shadow-xl animate-in fade-in max-w-[260px]">
            <h5 className="font-bold text-xs text-amber-400 uppercase tracking-widest mb-1">Hệ thống bàn chải</h5>
            <div className="text-[11px] text-slate-300 space-y-0.5">
                <div>Cơ chế: <strong className="text-white">Quay ngược chiều</strong></div>
                <div>Dung dịch: <strong className="text-white">Active Foam Tire</strong></div>
            </div>
        </div>
    ),
};

// ==========================================
// 🚀 MAIN COMPONENT
// ==========================================
export const StaffWashSimulation: React.FC<StaffWashSimulationProps> = ({
    bookings,
    onWashComplete,
    showBackButton = true,
}) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Âm thanh ping khi hoàn tất
    const audioCtxRef = useRef<AudioContext | null>(null);
    const [isMuted, setIsMuted] = useState(false);

    const playPing = useCallback(() => {
        if (isMuted) return;
        try {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new AudioContext();
            }
            const ctx = audioCtxRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.8);
        } catch {
            // AudioContext không khả dụng — bỏ qua
        }
    }, [isMuted]);

    // Lọc bookings InProgress từ props
    const inProgressBookings = useMemo(() => bookings.filter(b => b.id), [bookings]);

    // Chọn booking theo query param ?bookingId= hoặc tự chọn đầu tiên
    const initialId = searchParams.get('bookingId');
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
        initialId && inProgressBookings.find(b => b.id === initialId) ? initialId : null
    );

    useEffect(() => {
        if (inProgressBookings.length > 0 && !selectedBookingId) {
            setSelectedBookingId(inProgressBookings[0].id);
        }
    }, [inProgressBookings, selectedBookingId]);

    const activeBooking = useMemo(
        () => inProgressBookings.find(b => b.id === selectedBookingId) || null,
        [inProgressBookings, selectedBookingId]
    );

    // Parse features → wash steps
    const currentSteps = useMemo<WashStep[]>(() => {
        if (!activeBooking?.features) {
            return [{ id: 1, type: 'exterior_wash', name: 'Rửa ngoại thất', desc: 'Phun áp lực cao làm sạch thân xe', camPos: [15, 6, 15] }];
        }
        try {
            const raw: string[] = typeof activeBooking.features === 'string'
                ? JSON.parse(activeBooking.features)
                : activeBooking.features;

            let counter = 1;
            const mapped: WashStep[] = [];
            raw.forEach(feat => {
                const cfg = FEATURE_MAP[feat.trim()];
                if (cfg) mapped.push({ id: counter++, type: cfg.type, name: cfg.name, desc: cfg.desc, camPos: cfg.camPos });
            });
            return mapped.length > 0 ? mapped : [{ id: 1, type: 'exterior_wash', name: 'Rửa ngoại thất', desc: 'Phun áp lực cao', camPos: [15, 6, 15] }];
        } catch {
            return [{ id: 1, type: 'exterior_wash', name: 'Rửa ngoại thất', desc: 'Phun áp lực cao', camPos: [15, 6, 15] }];
        }
    }, [activeBooking]);

    const [activeStep, setActiveStep] = useState<WashStep | null>(null);
    const [showComplete, setShowComplete] = useState(false);
    const [isAutoPlay, setIsAutoPlay] = useState(true);
    // [CV] Trạng thái giả lập lỗi hệ thống IOT (Incident Alert)
    const [isFaulted, setIsFaulted] = useState(false);
    // Set các bookingId đã được notification để tránh gọi lại
    const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set());

    // Reset khi đổi booking
    useEffect(() => {
        if (currentSteps.length > 0) {
            setActiveStep(currentSteps[0]);
            setShowComplete(false);
            setIsFaulted(false); // Reset lỗi khi đổi xe
        }
    }, [currentSteps, selectedBookingId]);

    const progressPercent = useMemo(() => {
        if (!activeStep || currentSteps.length === 0) return 0;
        if (showComplete) return 100;
        const idx = currentSteps.findIndex(s => s.id === activeStep.id);
        return idx === -1 ? 0 : Math.round(((idx + 1) / currentSteps.length) * 100);
    }, [activeStep, currentSteps, showComplete]);

    const handleNextStep = useCallback(() => {
        if (!activeStep) return;
        const idx = currentSteps.findIndex(s => s.id === activeStep.id);
        if (idx === currentSteps.length - 1) {
            setShowComplete(true);
        } else {
            setActiveStep(currentSteps[idx + 1]);
        }
    }, [activeStep, currentSteps]);

    // Auto-play timer
    useEffect(() => {
        if (showComplete || !isAutoPlay || !activeStep || isFaulted) return;
        const interval = setInterval(handleNextStep, 5000);
        return () => clearInterval(interval);
    }, [handleNextStep, showComplete, isAutoPlay, activeStep, isFaulted]);

    // Khi animation hoàn tất → toast + ping + callback
    useEffect(() => {
        if (!showComplete || !activeBooking) return;
        if (notifiedIds.has(activeBooking.id)) return;

        playPing();

        toast.success(
            `✅ Xe ${activeBooking.licensePlate} — rửa hoàn tất!`,
            {
                description: `Khoang ${activeBooking.bayId ?? ''} • ${activeBooking.serviceName ?? 'Gói rửa'} đã xong. Vui lòng bấm Checkout.`,
                duration: 8000,
                action: {
                    label: 'Về QueueMonitor',
                    onClick: () => navigate('/staff/monitor'),
                },
            }
        );

        setNotifiedIds(prev => new Set(prev).add(activeBooking.id));
        onWashComplete?.(activeBooking.id);
    }, [showComplete, activeBooking, notifiedIds, playPing, onWashComplete, navigate]);

    // ─── EMPTY STATE ───────────────────────────────────────────────────────────
    if (inProgressBookings.length === 0) {
        return (
            <div className="w-full max-w-[1200px] mx-auto bg-white dark:bg-[#13151A] rounded-3xl border border-slate-100 dark:border-white/5 p-6 shadow-sm flex flex-col items-center justify-center h-[600px] gap-4">
                {showBackButton && (
                    <button onClick={() => navigate('/staff/monitor')} className="absolute top-6 left-6 flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors font-semibold">
                        <ChevronLeft className="w-4 h-4" /> QueueMonitor
                    </button>
                )}
                <div className="text-5xl animate-bounce">🚗</div>
                <p className="text-slate-500 font-medium text-sm">Không có xe nào đang rửa tại thời điểm này</p>
                <p className="text-slate-400 text-xs">Hệ thống sẽ tự cập nhật khi có xe vào khoang</p>
            </div>
        );
    }

    const ActiveHUD = activeStep ? HUD_MAP[activeStep.type] : null;

    return (
        <div className="w-full max-w-[1200px] mx-auto bg-white dark:bg-[#13151A] rounded-3xl border border-slate-100 dark:border-white/5 p-6 shadow-sm flex flex-col gap-4 relative text-slate-800 dark:text-white">

            {/* ── HEADER ───────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {showBackButton && (
                        <button
                            onClick={() => navigate('/staff/monitor')}
                            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors font-semibold mr-2"
                        >
                            <ChevronLeft className="w-4 h-4" /> Quay lại
                        </button>
                    )}
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                    </span>
                    <h2 className="font-bold text-slate-800 dark:text-white text-lg">
                        Theo dõi rửa xe trực tiếp
                    </h2>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                        {inProgressBookings.length} xe đang rửa
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {/* [CV] Nút giả lập lỗi IoT */}
                    <button
                        onClick={() => setIsFaulted(f => !f)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${isFaulted ? 'bg-rose-100 text-rose-700 border-rose-200 shadow-sm' : 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50 shadow-sm'}`}
                        title="Dành cho Demo: Giả lập sự cố máy móc IoT"
                    >
                        <AlertTriangle className={`w-4 h-4 ${isFaulted ? 'animate-pulse' : ''}`} />
                        {isFaulted ? 'Hủy Cảnh Báo' : '🚨 Giả lập Lỗi IoT'}
                    </button>

                    {/* Mute button */}
                    <button
                        onClick={() => setIsMuted(m => !m)}
                        title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                        className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* ── BODY ─────────────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row gap-6 h-[590px]">

                {/* SIDEBAR — danh sách xe đang rửa */}
                <div className="w-full md:w-[220px] flex flex-col border-r border-slate-100 dark:border-white/5 pr-4 gap-2 overflow-y-auto">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Xe đang xử lý</p>
                    {inProgressBookings.map(b => {
                        const isSelected = b.id === selectedBookingId;
                        const isDone = notifiedIds.has(b.id);
                        return (
                            <button
                                key={b.id}
                                onClick={() => {
                                    setSelectedBookingId(b.id);
                                    setShowComplete(false);
                                }}
                                className={`w-full text-left p-3 rounded-xl border transition-all relative ${
                                    isSelected
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                        : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                                }`}
                            >
                                {isDone && (
                                    <CheckCircle className={`absolute top-2 right-2 w-4 h-4 ${isSelected ? 'text-emerald-300' : 'text-emerald-500'}`} />
                                )}
                                <div className={`text-[10px] font-bold mb-0.5 tracking-wider ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                                    {b.bookingCode}
                                </div>
                                <div className="font-bold text-base leading-tight">{b.licensePlate}</div>
                                <div className={`text-xs truncate mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                                    {b.vehicleName || 'Không rõ'}
                                </div>
                                <div className={`text-[10px] mt-1 font-semibold ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                                    {b.serviceName}
                                </div>
                                {isDone && (
                                    <div className={`text-[10px] mt-1 font-bold ${isSelected ? 'text-emerald-300' : 'text-emerald-600'}`}>
                                        ✓ Hoàn tất — chờ Checkout
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* CANVAS 3D */}
                {activeBooking && activeStep ? (
                    <>
                        <div className="flex-1 bg-slate-100 dark:bg-[#0B0C10] rounded-2xl border border-slate-100 dark:border-white/10 overflow-hidden relative shadow-inner">
                            <Canvas camera={{ fov: 45, position: activeStep.camPos }}>
                                <color attach="background" args={['#0B0C10']} />
                                <ambientLight intensity={1.5} />
                                <spotLight position={[15, 20, 15]} angle={0.3} penumbra={1} intensity={3} castShadow />
                                <Stage environment="apartment" intensity={0.7} adjustCamera={false} shadows={{ type: 'contact', opacity: 0.4, blur: 1.5 }}>
                                    <CarWithEffects
                                        currentStep={activeStep.id}
                                        activePackage={currentSteps.map(s => s.type)}
                                    />
                                </Stage>
                                <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 2} makeDefault enableDamping dampingFactor={0.05} />
                            </Canvas>

                            {/* [CV] Incident Overlay (khi lỗi) */}
                            {isFaulted && (
                                <div className="absolute inset-0 bg-red-900/30 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                                    <div className="bg-white dark:bg-[#1A1D24] p-6 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm text-center border-2 border-red-500 animate-in zoom-in">
                                        <AlertTriangle className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wide">Lỗi Khoang Rửa</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                                            Hệ thống máy rửa tự động báo lỗi kẹt chổi quét hoặc cảm biến không phản hồi. Vui lòng can thiệp thủ công.
                                        </p>
                                        <button 
                                            onClick={() => setIsFaulted(false)}
                                            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/30"
                                        >
                                            Đã xử lý xong (Resume)
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step info overlay */}
                            <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 p-4 rounded-xl max-w-[270px] z-10">
                                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-600 text-white rounded mb-1.5 inline-block font-mono">
                                    {activeStep.type}
                                </span>
                                <h4 className="text-white font-bold text-sm">{activeStep.name}</h4>
                                <p className="text-slate-400 text-xs mt-1 leading-relaxed">{activeStep.desc}</p>
                            </div>

                            {/* Khoang info (staff) */}
                            {activeBooking.bayId && (
                                <div className="absolute top-4 right-4 bg-orange-500/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-[11px] font-bold shadow-sm">
                                    🔧 Khoang đang xử lý
                                </div>
                            )}

                            {/* HUD */}
                            {ActiveHUD && (
                                <div className="absolute bottom-4 left-4 z-10">
                                    <ActiveHUD />
                                </div>
                            )}

                            {/* Progress bar */}
                            <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700/50 flex items-center gap-3 min-w-[200px]">
                                <div className="flex-1">
                                    <div className="flex justify-between text-[11px] text-slate-400 font-medium mb-1">
                                        <span>Tiến độ tổng</span>
                                        <span className="text-blue-400 font-bold">{progressPercent}%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-blue-500 to-cyan-400 h-1.5 rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SIDEBAR PHẢI — danh sách bước */}
                        <div className="w-full md:w-[260px] flex flex-col justify-between py-2">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-base font-bold text-slate-800 dark:text-white">Quy trình rửa</h2>
                                    <button
                                        onClick={() => setIsAutoPlay(v => !v)}
                                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all ${
                                            isAutoPlay
                                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-200'
                                                : 'bg-slate-50 dark:bg-white/5 text-slate-500 border-slate-200'
                                        }`}
                                    >
                                        {isAutoPlay ? '▶ Auto' : '⏸ Manual'}
                                    </button>
                                </div>

                                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-md inline-block mb-3">
                                    {activeBooking.serviceName || 'Gói rửa xe'}
                                </span>

                                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                                    {currentSteps.map((step, idx) => {
                                        const isSelected = activeStep.id === step.id;
                                        const isDone = showComplete || activeStep.id > step.id;
                                        return (
                                            <button
                                                key={step.id}
                                                onClick={() => { setActiveStep(step); setIsAutoPlay(false); }}
                                                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                                                    isSelected
                                                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 shadow-sm'
                                                        : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 hover:bg-slate-100'
                                                }`}
                                            >
                                                <div className="flex-1 pr-2">
                                                    <span className={`text-[9px] font-bold block ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                                                        BƯỚC {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                                                    </span>
                                                    <h5 className={`font-bold text-xs mt-0.5 ${isSelected ? 'text-blue-950 dark:text-white' : 'text-slate-700 dark:text-slate-400'}`}>
                                                        {step.name}
                                                    </h5>
                                                </div>
                                                <div>
                                                    {isDone ? (
                                                        <span className="text-emerald-500 text-xs font-bold">✓</span>
                                                    ) : isSelected ? (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse inline-block" />
                                                    ) : (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" />
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={handleNextStep}
                                    disabled={showComplete}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl text-xs transition-colors shadow-md mt-4 disabled:opacity-50"
                                >
                                    {activeStep.id === currentSteps.length ? 'Bước cuối — Hoàn tất mô phỏng' : 'Bước tiếp theo →'}
                                </button>
                            </div>
                        </div>
                    </>
                ) : null}
            </div>

            {/* ── OVERLAY KHI HOÀN TẤT ────────────────────────────────────── */}
            {showComplete && activeBooking && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm animate-in fade-in rounded-3xl">
                    <div className="bg-white dark:bg-[#13151A] p-8 rounded-2xl border border-slate-100 dark:border-white/10 shadow-2xl text-center max-w-[360px] mx-4 animate-in zoom-in">
                        <div className="text-5xl mb-3">🎉</div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Rửa xe hoàn tất!</h2>
                        <p className="text-slate-500 dark:text-slate-300 mt-2 text-sm">
                            Xe <strong>{activeBooking.licensePlate}</strong> đã hoàn thành tất cả công đoạn.
                        </p>
                        <p className="text-amber-600 dark:text-amber-400 text-sm font-semibold mt-1">
                            Vui lòng thao tác <strong>Checkout</strong> trong QueueMonitor để cộng điểm khách.
                        </p>

                        <div className="flex flex-col gap-3 mt-6">
                            <button
                                onClick={() => navigate('/staff/monitor')}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors shadow-md"
                            >
                                Về QueueMonitor để Checkout
                            </button>
                            {inProgressBookings.length > 1 && (
                                <button
                                    onClick={() => {
                                        const next = inProgressBookings.find(b => b.id !== activeBooking.id);
                                        if (next) {
                                            setSelectedBookingId(next.id);
                                            setShowComplete(false);
                                        }
                                    }}
                                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-2.5 rounded-xl transition-colors"
                                >
                                    Xem xe tiếp theo →
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
