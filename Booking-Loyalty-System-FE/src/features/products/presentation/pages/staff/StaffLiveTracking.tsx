import React, { useMemo } from 'react';
import { StaffWashSimulation } from '@/shared/staff-wash-simulation';
import { useStaffDashboard } from '@/features/products/application/useStaffDashboard';
import { useStaff } from '@/features/products/application/useStaff';
import { format } from 'date-fns';

/**
 * /staff/live-tracking
 * Trang theo dõi tiến trình rửa xe trực tiếp dành cho Staff.
 * Lấy danh sách bookings của hôm nay, lọc status InProgress,
 * rồi truyền vào StaffWashSimulation.
 */
export const StaffLiveTracking: React.FC = () => {
    // Hook lấy toàn bộ booking hôm nay của staff
    const { bookings = [], isLoading } = useStaffDashboard();
    const { staffProfile } = useStaff();

    // Chỉ quan tâm xe đang InProgress
    const inProgressBookings = useMemo(
        () =>
            bookings
                .filter(b => b.status === 'InProgress')
                .map(b => ({
                    id: b.id,
                    bookingCode: b.bookingCode,
                    licensePlate: b.licensePlate ?? '',
                    vehicleName: b.vehicleName,
                    vehicleType: b.vehicleType,
                    serviceName: b.serviceName,
                    washPackageId: b.washPackageId,
                    // features được trả về trong response của booking — nếu BE chưa expose thì để undefined
                    features: (b as any).features,
                    bayId: b.bayId,
                    branchId: b.branchId ?? staffProfile?.branchId,
                })),
        [bookings, staffProfile]
    );

    const handleWashComplete = (bookingId: string) => {
        // Callback khi một xe hoàn tất animation
        // toast đã được hiển thị bên trong StaffWashSimulation,
        // ở đây có thể thêm logic bổ sung (e.g. highlight badge trên sidebar) nếu cần
        console.info('[StaffLiveTracking] Wash animation completed for booking:', bookingId);
    };

    if (isLoading) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-64 bg-slate-200 rounded-xl" />
                    <div className="h-[600px] bg-slate-200 rounded-3xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-4">
            <div>
                <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500 tracking-tight">
                    🔴 Live Tracking — Theo dõi rửa xe
                </h1>
                <p className="text-slate-500 text-sm mt-1 font-medium">
                    Mô phỏng quy trình rửa theo thời gian thực •{' '}
                    {format(new Date(), 'dd/MM/yyyy')} •{' '}
                    <span className="text-blue-600 font-bold">{inProgressBookings.length} xe đang rửa</span>
                </p>
            </div>

            <StaffWashSimulation
                bookings={inProgressBookings}
                onWashComplete={handleWashComplete}
                showBackButton={true}
            />
        </div>
    );
};
