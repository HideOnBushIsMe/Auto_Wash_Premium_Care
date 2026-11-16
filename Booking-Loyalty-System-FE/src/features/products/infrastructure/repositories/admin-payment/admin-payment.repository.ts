import { httpClient } from '@/core/http/httpClient';
import { ENDPOINTS } from '@/core/api/endpoints';
import type { ApiResponse } from '../../../domain/apiResponse';

export interface PaymentAuditItem {
    id: string;
    bookingId: string;
    amount: number;
    method: string;
    gateway: string;
    transactionRef: string;
    transactionNo?: string;
    bankCode?: string;
    status: string;
    branchName?: string;
    createdAt: string;
    paidAt?: string;
}

export interface PaymentAuditResponse {
    items: PaymentAuditItem[];
    totalCount: number;
}

export interface PaymentAuditRequest {
    status?: string;
    search?: string;
    branchId?: string;
    pageIndex: number;
    pageSize: number;
}

export class AdminPaymentRepository {
    async getPaymentsAudit(request: PaymentAuditRequest): Promise<PaymentAuditResponse> {
        const response = await httpClient.get<ApiResponse<PaymentAuditResponse>>(
            ENDPOINTS.ADMIN_PAYMENT.AUDIT,
            { params: request }
        );
        return response.data;
    }
}
