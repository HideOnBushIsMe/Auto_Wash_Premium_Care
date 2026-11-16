import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { AdminPaymentRepository } from '../infrastructure/repositories/admin-payment/admin-payment.repository';
import type { PaymentAuditRequest, PaymentAuditResponse } from '../infrastructure/repositories/admin-payment/admin-payment.repository';

const paymentRepo = new AdminPaymentRepository();

export const useAdminPayment = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<PaymentAuditResponse | null>(null);

    const fetchPayments = useCallback(async (request: PaymentAuditRequest) => {
        setIsLoading(true);
        try {
            const response = await paymentRepo.getPaymentsAudit(request);
            setData(response);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Lỗi khi tải lịch sử giao dịch');
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        data,
        fetchPayments
    };
};
