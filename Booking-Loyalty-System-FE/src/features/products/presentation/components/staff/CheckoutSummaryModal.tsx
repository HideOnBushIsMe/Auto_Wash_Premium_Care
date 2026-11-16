import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { X, Sparkles, Car, PenTool, Banknote, QrCode, ListChecks, ChevronRight } from 'lucide-react';
import { type BookingResponseData } from '../../../domain/models/booking/booking.model';
import { WashProcessTimeline } from '@/shared/wash-process-timeline';

interface CheckoutSummaryModalProps {
    booking: BookingResponseData;
    onClose: () => void;
    onConfirmCash: () => Promise<void>;
    onConfirmPayOS: () => Promise<string>;
}

// 3-step flow: summary → breakdown → methods
type ModalStep = 'summary' | 'breakdown' | 'methods';

export const CheckoutSummaryModal: React.FC<CheckoutSummaryModalProps> = ({
    booking,
    onClose,
    onConfirmCash,
    onConfirmPayOS
}) => {
    const { t } = useTranslation("customer");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState<ModalStep>('summary');

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const handleCashPayment = async () => {
        setIsSubmitting(true);
        try { await onConfirmCash(); }
        finally { setIsSubmitting(false); }
    };

    const handlePayOSPayment = async () => {
        setIsSubmitting(true);
        try {
            const checkoutUrl = await onConfirmPayOS();
            if (checkoutUrl) {
                window.location.href = checkoutUrl;
            } else {
                console.warn("⚠️ onConfirmPayOS không trả về checkoutUrl.");
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Lỗi tạo link PayOS:", error);
            setIsSubmitting(false);
        }
    };

    // Parse features từ booking (BookingResponseData cần field này)
    const features = (booking as any).features as string | string[] | undefined;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in duration-200">
            <div
                className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── HEADER ──────────────────────────────────────────────── */}
                <div className="flex items-center justify-between p-6 pb-4 sticky top-0 bg-white z-10 border-b border-slate-100">
                    <div>
                        <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">
                            {step === 'breakdown' ? 'Chi tiết dịch vụ' : t('staffDashboard.checkoutModal.title')}
                        </h3>
                        {/* Stepper indicator */}
                        <div className="flex items-center gap-1.5 mt-1.5">
                            {(['summary', 'breakdown', 'methods'] as ModalStep[]).map((s) => (
                                <div key={s} className="flex items-center gap-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full transition-all ${step === s ? 'bg-blue-600 w-4' : 'bg-slate-200'}`} />
                                </div>
                            ))}
                            <span className="text-[10px] text-slate-400 font-bold ml-1">
                                {step === 'summary' ? '1/3 Tóm tắt' : step === 'breakdown' ? '2/3 Chi tiết dịch vụ' : '3/3 Thanh toán'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        disabled={isSubmitting}
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="p-6 pt-4 space-y-4">

                    {/* ── STEP 1: SUMMARY ──────────────────────────────────── */}
                    {step === 'summary' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            {/* Booking code */}
                            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex justify-between items-center">
                                <p className="text-sm font-semibold text-blue-600">{t('staffDashboard.checkoutModal.bookingCode')}</p>
                                <code className="text-xl font-black text-blue-700">{booking.bookingCode || "N/A"}</code>
                            </div>

                            {/* Xe + Dịch vụ */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-1.5 text-slate-500 mb-2">
                                        <Car className="w-4 h-4" />
                                        <p className="text-xs font-bold uppercase tracking-wider">{t('staffDashboard.checkoutModal.vehicleInfo')}</p>
                                    </div>
                                    <p className="font-bold text-blue-950 text-sm truncate">{booking.vehicleName || t('staffDashboard.checkoutModal.notUpdated')}</p>
                                    <p className="text-xs font-semibold text-slate-500 mt-1">{booking.licensePlate || '---'}</p>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-1.5 text-slate-500 mb-2">
                                        <PenTool className="w-4 h-4" />
                                        <p className="text-xs font-bold uppercase tracking-wider">{t('staffDashboard.checkoutModal.service')}</p>
                                    </div>
                                    <p className="font-bold text-blue-950 text-sm truncate">{booking.serviceName || 'N/A'}</p>
                                    <p className="text-xs font-semibold text-slate-500 mt-1">
                                        {booking.startTime} · {booking.bookingDate}
                                    </p>
                                </div>
                            </div>

                            {/* Tổng tiền */}
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-slate-600">{t('staffDashboard.checkoutModal.totalPayment')}</span>
                                    <span className="text-3xl font-black text-rose-600">
                                        {formatCurrency(booking.totalAmount || 0)}
                                    </span>
                                </div>
                            </div>

                            {/* Điểm thưởng */}
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-emerald-700">
                                        <Sparkles className="w-5 h-5" />
                                        <p className="font-bold text-sm">{t('staffDashboard.checkoutModal.earnedPoints')}</p>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-100/50 px-2.5 py-1 rounded-full">
                                        {t('staffDashboard.checkoutModal.autoCalc')}
                                    </span>
                                </div>
                            </div>

                            {/* Nút: Xem chi tiết dịch vụ + Tiếp tục thanh toán */}
                            <div className="space-y-2 pt-1">
                                {/* Nút xem chi tiết — nổi bật nếu có features */}
                                <button
                                    onClick={() => setStep('breakdown')}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-bold text-sm"
                                >
                                    <div className="flex items-center gap-2">
                                        <ListChecks className="w-4 h-4" />
                                        Xem chi tiết dịch vụ đã thực hiện
                                    </div>
                                    <ChevronRight className="w-4 h-4" />
                                </button>

                                <div className="flex gap-3">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 py-3 px-4 border-2 border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                                    >
                                        {t('staffDashboard.checkoutModal.cancel')}
                                    </button>
                                    <button
                                        onClick={() => setStep('methods')}
                                        className="flex-[2] py-3 px-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-md transition-all active:scale-95 flex justify-center items-center gap-2"
                                    >
                                        {t('staffDashboard.checkoutModal.checkout')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: SERVICE BREAKDOWN ────────────────────────── */}
                    {step === 'breakdown' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-3">
                                <ListChecks className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-blue-800">Dịch vụ đã thực hiện</p>
                                    <p className="text-xs text-blue-600 mt-0.5">
                                        Gói <strong>{booking.serviceName}</strong> — mã đặt lịch <strong>{booking.bookingCode}</strong>
                                    </p>
                                </div>
                            </div>

                            <WashProcessTimeline
                                features={features}
                                appendDrying={true}
                                compact={true}
                                totalAmount={booking.totalAmount}
                            />

                            <div className="flex gap-3 pt-1">
                                <button
                                    onClick={() => setStep('summary')}
                                    className="flex-1 py-3 px-4 border-2 border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm"
                                >
                                    ← Quay lại
                                </button>
                                <button
                                    onClick={() => setStep('methods')}
                                    className="flex-[2] py-3 px-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-md transition-all active:scale-95 text-sm"
                                >
                                    Tiến hành thanh toán →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3: PAYMENT METHODS ──────────────────────────── */}
                    {step === 'methods' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            {/* Mini receipt */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 font-medium">Xe</span>
                                    <span className="font-bold text-slate-800">{booking.licensePlate}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 font-medium">Gói dịch vụ</span>
                                    <span className="font-bold text-slate-800">{booking.serviceName}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                    <span className="font-bold text-slate-700">Tổng thanh toán</span>
                                    <span className="text-2xl font-black text-rose-600">
                                        {formatCurrency(booking.totalAmount || 0)}
                                    </span>
                                </div>
                            </div>

                            <p className="text-center text-sm font-bold text-slate-500">{t('staffDashboard.checkoutModal.chooseMethod')}</p>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleCashPayment}
                                    disabled={isSubmitting}
                                    className="flex-1 flex flex-col items-center justify-center gap-2 p-4 border-2 border-emerald-500 bg-emerald-50 text-emerald-700 rounded-xl font-bold hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                >
                                    <Banknote className="w-6 h-6" />
                                    {t('staffDashboard.checkoutModal.cash')}
                                </button>

                                <button
                                    onClick={handlePayOSPayment}
                                    disabled={isSubmitting}
                                    className="flex-1 flex flex-col items-center justify-center gap-2 p-4 border-2 border-blue-500 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-colors disabled:opacity-50"
                                >
                                    <QrCode className="w-6 h-6" />
                                    PAYOS
                                </button>
                            </div>

                            <div className="text-center">
                                {isSubmitting ? (
                                    <p className="text-sm font-semibold text-slate-500 animate-pulse">{t('staffDashboard.checkoutModal.processing')}</p>
                                ) : (
                                    <button
                                        onClick={() => setStep('summary')}
                                        className="text-sm font-semibold text-slate-400 hover:text-slate-600 underline"
                                    >
                                        {t('staffDashboard.checkoutModal.back')}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};