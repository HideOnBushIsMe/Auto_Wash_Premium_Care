import React, { useEffect, useState } from 'react';
// Removed useTranslation
import { useAdminPayment } from '../../../application/useAdminPayment';
import { Search, CheckCircle, XCircle, Clock, FileText, Loader2, RefreshCw } from 'lucide-react';
import { useBooking } from '../../../application/useBooking';
import { useBranch as useAdminBranch } from '../../../application/useAdminBranch';

export function AdminTransactions() {
    const { data, isLoading, fetchPayments } = useAdminPayment();
    const { downloadInvoice } = useBooking({ loadMyBookings: false });
    const { branches } = useAdminBranch();

    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize] = useState(20);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [branchFilter, setBranchFilter] = useState('All');
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const loadData = () => {
        fetchPayments({
            pageIndex,
            pageSize,
            search,
            status: statusFilter === 'All' ? '' : statusFilter,
            branchId: branchFilter === 'All' ? undefined : branchFilter
        });
    };

    useEffect(() => {
        loadData();
    }, [pageIndex, pageSize, statusFilter, branchFilter]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPageIndex(0);
        loadData();
    };

    const handleDownload = async (bookingId: string) => {
        if (!bookingId || bookingId === '00000000-0000-0000-0000-000000000000') return;
        setDownloadingId(bookingId);
        try {
            await downloadInvoice(bookingId);
        } finally {
            setDownloadingId(null);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return '---';
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateStr));
    };

    const getStatusBadge = (status: string) => {
        switch (status.toUpperCase()) {
            case 'COMPLETED':
            case 'SUCCESS':
            case 'PAID':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle className="w-3 h-3" /> Thành công
                    </span>
                );
            case 'FAILED':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
                        <XCircle className="w-3 h-3" /> Thất bại
                    </span>
                );
            case 'PENDING':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                        <Clock className="w-3 h-3" /> Chờ xử lý
                    </span>
                );
            case 'CANCELLED':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                        <XCircle className="w-3 h-3" /> Đã hủy
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Lịch sử giao dịch</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Quản lý và đối soát các giao dịch thanh toán
                    </p>
                </div>
                <button
                    onClick={loadData}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Làm mới
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-4 justify-between">
                    <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm mã giao dịch..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                    </form>
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex gap-2 items-center">
                            <span className="text-sm text-slate-500 font-medium">Chi nhánh:</span>
                            <select
                                value={branchFilter}
                                onChange={(e) => {
                                    setBranchFilter(e.target.value);
                                    setPageIndex(0);
                                }}
                                className="py-2 pl-3 pr-8 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                            >
                                <option value="All">Tất cả</option>
                                {branches?.map(b => (
                                    <option key={b.id} value={b.id}>{b.branchName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2 items-center">
                            <span className="text-sm text-slate-500 font-medium">Trạng thái:</span>
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPageIndex(0);
                                }}
                                className="py-2 pl-3 pr-8 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                            >
                                <option value="All">Tất cả</option>
                                <option value="Paid">Thành công</option>
                                <option value="Pending">Chờ xử lý</option>
                                <option value="Failed">Thất bại</option>
                                <option value="Cancelled">Đã hủy</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 whitespace-nowrap">Thời gian</th>
                                <th className="px-6 py-4 whitespace-nowrap">Mã giao dịch</th>
                                <th className="px-6 py-4 whitespace-nowrap">Phương thức</th>
                                <th className="px-6 py-4 whitespace-nowrap">Chi nhánh</th>
                                <th className="px-6 py-4 text-right whitespace-nowrap">Số tiền</th>
                                <th className="px-6 py-4 whitespace-nowrap text-center">Trạng thái</th>
                                <th className="px-6 py-4 text-right whitespace-nowrap">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                                        <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
                                    </td>
                                </tr>
                            ) : data?.items?.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium">
                                        Không tìm thấy giao dịch nào.
                                    </td>
                                </tr>
                            ) : (
                                data?.items.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-slate-900">{formatDate(tx.createdAt)}</div>
                                            {tx.paidAt && (
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    Thanh toán: {formatDate(tx.paidAt)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">
                                            <div className="font-bold text-blue-700">{tx.transactionRef}</div>
                                            {tx.transactionNo && (
                                                <div className="text-slate-500 mt-0.5">Gateway: {tx.transactionNo}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 uppercase">
                                                {tx.method || 'N/A'}
                                            </span>
                                            {tx.bankCode && (
                                                <span className="ml-2 text-xs text-slate-500 font-semibold">{tx.bankCode}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-700">
                                                {tx.branchName || '---'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-black text-slate-900">
                                            {formatCurrency(tx.amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {getStatusBadge(tx.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => handleDownload(tx.bookingId)}
                                                disabled={downloadingId === tx.bookingId || !tx.bookingId || tx.bookingId === '00000000-0000-0000-0000-000000000000'}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {downloadingId === tx.bookingId ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <FileText className="w-3.5 h-3.5" />
                                                )}
                                                Chi tiết Bill
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Phân trang */}
                {!isLoading && data && data.totalCount > 0 && (
                    <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                        <p className="text-sm text-slate-600 font-medium">
                            Hiển thị <span className="font-bold text-slate-900">{pageIndex * pageSize + 1}</span> -{' '}
                            <span className="font-bold text-slate-900">
                                {Math.min((pageIndex + 1) * pageSize, data.totalCount)}
                            </span>{' '}
                            trên tổng <span className="font-bold text-slate-900">{data.totalCount}</span> giao dịch
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPageIndex(p => Math.max(0, p - 1))}
                                disabled={pageIndex === 0}
                                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                            >
                                Trước
                            </button>
                            <button
                                onClick={() => setPageIndex(p => p + 1)}
                                disabled={(pageIndex + 1) * pageSize >= data.totalCount}
                                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
