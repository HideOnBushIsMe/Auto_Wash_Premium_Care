import React from "react";

// ─── KIỂU DỮ LIỆU ─────────────────────────────────────────────────────────────

export interface WashStepMeta {
    key: string;            // Tên gốc từ backend (để map)
    label: string;          // Tên hiển thị tiếng Việt
    description: string;    // Mô tả ngắn
    icon: string;           // Emoji icon
    category: "exterior" | "interior" | "protection" | "finishing";
}

// ─── MAP FEATURES → META ───────────────────────────────────────────────────────

export const WASH_FEATURE_META: Record<string, WashStepMeta> = {
    "Exterior wash": {
        key: "Exterior wash",
        label: "Rửa ngoại thất",
        description: "Phun áp lực cao, làm sạch toàn bộ thân xe và gầm xe",
        icon: "💧",
        category: "exterior",
    },
    "Full exterior wash": {
        key: "Full exterior wash",
        label: "Rửa ngoại thất toàn diện",
        description: "Phun áp lực cao, rửa sạch kể cả gầm xe và các góc khuất",
        icon: "🚿",
        category: "exterior",
    },
    "Tire cleaning": {
        key: "Tire cleaning",
        label: "Vệ sinh lốp xe",
        description: "Chà sạch bùn đất và cao su chai trên lốp bằng bàn chải chuyên dụng",
        icon: "🔘",
        category: "exterior",
    },
    "Tire shine": {
        key: "Tire shine",
        label: "Làm bóng lốp",
        description: "Dưỡng và đánh bóng lốp xe, tăng thẩm mỹ",
        icon: "✨",
        category: "exterior",
    },
    "Window cleaning": {
        key: "Window cleaning",
        label: "Lau kính",
        description: "Vệ sinh kính trong suốt, không để lại vệt nước",
        icon: "🪟",
        category: "exterior",
    },
    "Interior vacuum": {
        key: "Interior vacuum",
        label: "Hút bụi nội thất",
        description: "Hút sạch bụi bẩn trên ghế, sàn và các khe hở trong xe",
        icon: "🌀",
        category: "interior",
    },
    "Interior deep clean": {
        key: "Interior deep clean",
        label: "Vệ sinh nội thất sâu",
        description: "Làm sạch toàn bộ nội thất kể cả các góc khuất khó tiếp cận",
        icon: "🧹",
        category: "interior",
    },
    "Dashboard polish": {
        key: "Dashboard polish",
        label: "Đánh bóng taplo",
        description: "Làm sạch và phủ bóng mặt taplo, ngăn ngừa nứt nẻ",
        icon: "🪞",
        category: "interior",
    },
    "Leather conditioning": {
        key: "Leather conditioning",
        label: "Dưỡng da ghế",
        description: "Thoa dưỡng chất chuyên biệt bảo vệ ghế da khỏi nứt nẻ theo thời gian",
        icon: "🛋️",
        category: "interior",
    },
    "Air freshener": {
        key: "Air freshener",
        label: "Khử mùi nội thất",
        description: "Xịt nước hoa và khử mùi toàn bộ khoang xe",
        icon: "🌸",
        category: "interior",
    },
    "Wax coating": {
        key: "Wax coating",
        label: "Phủ wax bảo vệ",
        description: "Phủ lớp wax bảo vệ sơn xe, tạo độ bóng và chống trầy xước nhẹ",
        icon: "🔆",
        category: "protection",
    },
    "Ceramic spray": {
        key: "Ceramic spray",
        label: "Phủ ceramic nano",
        description: "Phủ lớp bảo vệ ceramic tạo màng chắn nước siêu bền lên sơn xe",
        icon: "🔷",
        category: "protection",
    },
    "Engine bay cleaning": {
        key: "Engine bay cleaning",
        label: "Vệ sinh khoang máy",
        description: "Làm sạch khoang máy và các chi tiết bên trong bằng dụng cụ chuyên dụng",
        icon: "⚙️",
        category: "protection",
    },
};

// ─── HELPER: PARSE FEATURES STRING/ARRAY → ORDERED STEPS ─────────────────────

export function parseFeaturesToSteps(features: string | string[] | undefined | null): WashStepMeta[] {
    if (!features) return [];
    try {
        const arr: string[] = typeof features === "string" ? JSON.parse(features) : features;
        return arr
            .map(f => WASH_FEATURE_META[f.trim()])
            .filter(Boolean);
    } catch {
        return [];
    }
}

// ─── CATEGORY STYLES ──────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<WashStepMeta["category"], { label: string; color: string; bg: string }> = {
    exterior: { label: "Ngoại thất",   color: "text-blue-700",    bg: "bg-blue-50 border-blue-100" },
    interior: { label: "Nội thất",     color: "text-purple-700",  bg: "bg-purple-50 border-purple-100" },
    protection: { label: "Bảo vệ",    color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
    finishing: { label: "Hoàn thiện",  color: "text-amber-700",   bg: "bg-amber-50 border-amber-100" },
};

// ─── COMPONENT: WASH PROCESS TIMELINE ─────────────────────────────────────────

interface WashProcessTimelineProps {
    /** features từ booking — string JSON hoặc string[] */
    features: string | string[] | undefined | null;
    /** Nếu true, thêm "Sấy khô tự động" vào cuối (luôn có ở tất cả gói) */
    appendDrying?: boolean;
    /** compact mode — dùng trong checkout modal (không cần mô tả dài) */
    compact?: boolean;
    /** Tổng tiền để hiển thị dòng tổng kết */
    totalAmount?: number;
}

const DRYING_STEP: WashStepMeta = {
    key: "__drying__",
    label: "Sấy khô tự động",
    description: "Máy thổi khí nóng làm khô toàn bộ thân xe sau khi rửa",
    icon: "💨",
    category: "finishing",
};

export const WashProcessTimeline: React.FC<WashProcessTimelineProps> = ({
    features,
    appendDrying = true,
    compact = false,
    totalAmount,
}) => {
    const steps = parseFeaturesToSteps(features);

    if (steps.length === 0) {
        return (
            <div className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                Chưa có thông tin quy trình rửa
            </div>
        );
    }

    const allSteps = appendDrying ? [...steps, DRYING_STEP] : steps;

    if (compact) {
        // Dạng compact: dùng trong CheckoutSummaryModal — danh sách checkbox đẹp
        return (
            <div className="space-y-1.5">
                {allSteps.map((step, idx) => {
                    const catCfg = CATEGORY_CONFIG[step.category];
                    return (
                        <div
                            key={step.key}
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                        >
                            {/* Số thứ tự */}
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center">
                                {idx + 1}
                            </span>

                            {/* Icon */}
                            <span className="text-base leading-none">{step.icon}</span>

                            {/* Tên bước */}
                            <span className="flex-1 text-sm font-semibold text-slate-700 leading-tight">
                                {step.label}
                            </span>

                            {/* Category badge */}
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${catCfg.bg} ${catCfg.color} hidden sm:inline`}>
                                {catCfg.label}
                            </span>

                            {/* Tick done */}
                            <span className="text-emerald-500 font-black text-sm flex-shrink-0">✓</span>
                        </div>
                    );
                })}

                {totalAmount !== undefined && (
                    <div className="mt-3 flex justify-between items-center pt-3 border-t border-slate-200">
                        <span className="text-sm font-bold text-slate-600">
                            Tổng {allSteps.length} dịch vụ
                        </span>
                        <span className="text-xl font-black text-rose-600">
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalAmount)}
                        </span>
                    </div>
                )}
            </div>
        );
    }

    // Dạng full timeline: dùng trong BookingDetailModal
    return (
        <div className="relative">
            {/* Đường dọc */}
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-200 via-purple-100 to-emerald-200 z-0" />

            <div className="space-y-3 relative z-10">
                {allSteps.map((step, idx) => {
                    const catCfg = CATEGORY_CONFIG[step.category];
                    const isLast = idx === allSteps.length - 1;
                    return (
                        <div key={step.key} className="flex gap-3">
                            {/* Dot + icon */}
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-base border-2 ${
                                isLast
                                    ? "bg-emerald-500 border-emerald-600 text-white"
                                    : "bg-white border-blue-200 shadow-sm"
                            }`}>
                                {step.icon}
                            </div>

                            {/* Nội dung */}
                            <div className={`flex-1 pb-3 ${!isLast ? "border-b border-slate-100" : ""}`}>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-bold text-slate-800">{step.label}</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${catCfg.bg} ${catCfg.color}`}>
                                        {catCfg.label}
                                    </span>
                                    <span className="ml-auto text-emerald-500 text-xs font-black">✓ Hoàn thành</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
