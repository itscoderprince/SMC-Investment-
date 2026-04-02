"use client";

import { useState, useEffect, useCallback } from 'react';
import {
    userApi,
    kycApi,
    indicesApi,
    investmentsApi,
    paymentsApi,
    withdrawalsApi,
    returnsApi,
    ticketsApi,
    adminApi,
    referralApi
} from '@/lib/api';


// Generic fetch hook
function useFetch(fetchFn, deps = [], immediate = true) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState(null);

    const execute = useCallback(async (...args) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchFn(...args);
            setData(result);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchFn]);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, deps);

    return { data, loading, error, refetch: execute };
}

// ==================== PUBLIC HOOKS ====================
export function usePublicStats() {
    return useFetch(() => fetch('/api/public/stats').then(res => res.json()).then(res => res.data));
}

// ==================== USER HOOKS ====================
export function useDashboard() {
    return useFetch(userApi.getDashboard);
}

export function useProfile() {
    const { data, loading, error, refetch } = useFetch(userApi.getProfile);

    const updateProfile = useCallback(async (profileData) => {
        const result = await userApi.updateProfile(profileData);
        refetch();
        return result;
    }, [refetch]);

    return { profile: data, loading, error, refetch, updateProfile };
}

export function useAvailableBalance() {
    const { data, loading, error, refetch } = useFetch(userApi.getDashboard);
    return {
        balance: data?.summary?.walletBalance || 0,
        totalWithdrawn: data?.summary?.totalWithdrawn || 0,
        loading,
        error,
        refetch
    };
}

// ==================== KYC HOOKS ====================
export function useKYC() {
    const { data, loading, error, refetch } = useFetch(kycApi.getStatus);

    const upload = useCallback(async (formData) => {
        const result = await kycApi.upload(formData);
        refetch();
        return result;
    }, [refetch]);

    const resubmit = useCallback(async (formData) => {
        const result = await kycApi.resubmit(formData);
        refetch();
        return result;
    }, [refetch]);

    return {
        status: data?.status || 'not_submitted',
        kyc: data,
        loading,
        error,
        refetch,
        upload,
        resubmit
    };
}

// ==================== INDICES HOOKS ====================
export function useIndices(params = {}) {
    const fetchIndices = useCallback(() => indicesApi.getAll(params), [JSON.stringify(params)]);
    const { data, loading, error, refetch } = useFetch(fetchIndices, [JSON.stringify(params)]);

    return {
        indices: data?.indices || [],
        pagination: data?.pagination,
        loading,
        error,
        refetch
    };
}

export function useIndex(id) {
    const fetchIndex = useCallback(() => indicesApi.getById(id), [id]);
    const { data, loading, error, refetch } = useFetch(fetchIndex, [id], !!id);

    return {
        index: data,
        loading,
        error,
        refetch
    };
}

// ==================== INVESTMENTS HOOKS ====================
export function useInvestments(params = {}) {
    const fetchInvestments = useCallback(() => investmentsApi.getAll(params), [JSON.stringify(params)]);
    const { data, loading, error, refetch } = useFetch(fetchInvestments, [JSON.stringify(params)]);

    return {
        investments: data?.investments || [],
        pagination: data?.pagination,
        loading,
        error,
        refetch
    };
}

export function useActiveInvestments() {
    return useFetch(investmentsApi.getActive);
}

export function useInvestmentSummary() {
    return useFetch(investmentsApi.getSummary);
}

export function useInvestment(id) {
    const fetchInvestment = useCallback(() => investmentsApi.getById(id), [id]);
    return useFetch(fetchInvestment, [id], !!id);
}

// ==================== PAYMENTS HOOKS ====================
export function usePaymentRequests(params = {}) {
    const fetchPayments = useCallback(() => paymentsApi.getMyRequests(params), [JSON.stringify(params)]);
    const { data, loading, error, refetch } = useFetch(fetchPayments, [JSON.stringify(params)]);

    const createRequest = useCallback(async (requestData) => {
        const result = await paymentsApi.createRequest(requestData);
        refetch();
        return result;
    }, [refetch]);

    const uploadProof = useCallback(async (formData) => {
        const result = await paymentsApi.uploadProof(formData);
        refetch();
        return result;
    }, [refetch]);

    return {
        payments: data?.requests || [],
        pagination: data?.pagination,
        loading,
        error,
        refetch,
        createRequest,
        uploadProof
    };
}

// ==================== WITHDRAWALS HOOKS ====================
export function useWithdrawals(params = {}) {
    const fetchWithdrawals = useCallback(() => withdrawalsApi.getMyRequests(params), [JSON.stringify(params)]);
    const { data, loading, error, refetch } = useFetch(fetchWithdrawals, [JSON.stringify(params)]);

    const createRequest = useCallback(async (requestData) => {
        const result = await withdrawalsApi.createRequest(requestData);
        refetch();
        return result;
    }, [refetch]);

    return {
        withdrawals: data?.withdrawals || [],
        pagination: data?.pagination,
        loading,
        error,
        refetch,
        createRequest
    };
}

// ==================== RETURNS HOOKS ====================
export function useReturnsHistory(params = {}) {
    const fetchReturns = useCallback(() => returnsApi.getHistory(params), [JSON.stringify(params)]);
    return useFetch(fetchReturns, [JSON.stringify(params)]);
}

export function useExpectedReturns() {
    return useFetch(returnsApi.getExpected);
}

// ==================== TICKETS HOOKS ====================
export function useTickets(params = {}) {
    const fetchTickets = useCallback(() => ticketsApi.getAll(params), [JSON.stringify(params)]);
    const { data, loading, error, refetch } = useFetch(fetchTickets, [JSON.stringify(params)]);

    const createTicket = useCallback(async (ticketData) => {
        const result = await ticketsApi.create(ticketData);
        refetch();
        return result;
    }, [refetch]);

    return {
        tickets: data?.tickets || [],
        pagination: data?.pagination,
        loading,
        error,
        refetch,
        createTicket
    };
}

export function useTicket(id) {
    const fetchTicket = useCallback(() => ticketsApi.getById(id), [id]);
    const { data, loading, error, refetch } = useFetch(fetchTicket, [id], !!id);

    const reply = useCallback(async (message) => {
        const result = await ticketsApi.reply(id, message);
        refetch();
        return result;
    }, [id, refetch]);

    const close = useCallback(async () => {
        const result = await ticketsApi.close(id);
        refetch();
        return result;
    }, [id, refetch]);

    return { ticket: data, loading, error, refetch, reply, close };
}

// ==================== REFERRAL HOOKS ====================

export function useReferrals() {
    return useFetch(() => referralApi.getStats());
}

export function useReferralBonuses() {
    return useFetch(() => referralApi.getBonuses());
}

export function useAdminReferrals() {
    return useFetch(() => referralApi.getAdminStats());
}


// ==================== ADMIN HOOKS ====================
export function useAdminDashboard() {
    return useFetch(adminApi.getDashboard);
}

export function useAdminUsers(params = {}) {
    const fetchUsers = useCallback(() => adminApi.getUsers(params), [JSON.stringify(params)]);
    const { data, loading, error, refetch } = useFetch(fetchUsers, [JSON.stringify(params)]);

    return {
        users: data?.users || [],
        pagination: data?.pagination,
        loading,
        error,
        refetch
    };
}

export function useAdminReturns(params = {}) {
    const fetchReturns = useCallback(() => adminApi.getReturns(params), [JSON.stringify(params)]);
    const { data, loading, error, refetch } = useFetch(fetchReturns, [JSON.stringify(params)]);

    return {
        returns: data?.returns || [],
        pagination: data?.pagination,
        stats: data?.stats,
        loading,
        error,
        refetch
    };
}

export function useAdminPayments(params = {}) {
    // Add a timestamp to bypass any browser/Next.js caching
    const fetchParams = { ...params, _t: Date.now() };
    const fetchPayments = useCallback(() => adminApi.getPayments(fetchParams), [JSON.stringify(params)]);
    const { data, loading, error, refetch } = useFetch(fetchPayments, [JSON.stringify(params)]);

    return {
        payments: data?.payments || [],
        pagination: data?.pagination,
        loading,
        error,
        refetch
    };
}

export function useAdminKYC(params = {}) {
    const fetchKYC = useCallback(() => adminApi.getKYCRecords(params), [JSON.stringify(params)]);
    const { data, loading, error, refetch } = useFetch(fetchKYC, [JSON.stringify(params)]);

    return {
        records: data?.records || [],
        pagination: data?.pagination,
        loading,
        error,
        refetch
    };
}

export function useAdminWithdrawals(params = {}) {
    const fetchWithdrawals = useCallback(() => adminApi.getWithdrawals(params), [JSON.stringify(params)]);
    const { data, loading, error, refetch } = useFetch(fetchWithdrawals, [JSON.stringify(params)]);

    return {
        withdrawals: data?.withdrawals || [],
        pagination: data?.pagination,
        loading,
        error,
        refetch
    };
}

export function useAdminIndices(params = {}) {
    const fetchIndices = useCallback(() => adminApi.getIndices(params), [JSON.stringify(params)]);
    const { data, loading, error, refetch } = useFetch(fetchIndices, [JSON.stringify(params)]);

    const create = useCallback(async (indexData) => {
        const result = await adminApi.createIndex(indexData);
        refetch();
        return result;
    }, [refetch]);

    const update = useCallback(async (id, indexData) => {
        const result = await adminApi.updateIndex(id, indexData);
        refetch();
        return result;
    }, [refetch]);

    const remove = useCallback(async (id) => {
        const res = await adminApi.deleteIndex(id);
        refetch();
        return res;
    }, [refetch]);

    const distributeReturns = useCallback(async (id, data) => {
        return adminApi.distributeReturns(id, data);
    }, []);

    return {
        indices: data?.indices || [],
        pagination: data?.pagination,
        loading,
        error,
        refetch,
        create,
        update,
        remove,
        distributeReturns
    };
}

export function useAdminTickets(params = {}) {
    const fetchTickets = useCallback(() => adminApi.getTickets(params), [JSON.stringify(params)]);
    const { data, loading, error, refetch } = useFetch(fetchTickets, [JSON.stringify(params)]);

    return {
        tickets: data?.tickets || [],
        pagination: data?.pagination,
        stats: data?.stats,
        loading,
        error,
        refetch
    };
}

export function useAdminSettings(category) {
    const fetchSettings = useCallback(() => adminApi.getSettings(category), [category]);
    const { data, loading, error, refetch } = useFetch(fetchSettings, [category]);

    const updateSettings = useCallback(async (updates) => {
        const result = await adminApi.updateSettings(category, updates);
        refetch();
        return result;
    }, [category, refetch]);

    const initSettings = useCallback(async () => {
        const result = await adminApi.initSettings();
        refetch();
        return result;
    }, [refetch]);

    return { settings: data, loading, error, refetch, updateSettings, initSettings };
}

export function useAdminTicket(id) {
    const fetchTicket = useCallback(() => adminApi.getTicket(id), [id]);
    const { data, loading, error, refetch } = useFetch(fetchTicket, [id], !!id);

    const reply = useCallback(async (message) => {
        const result = await adminApi.replyTicket(id, message);
        refetch();
        return result;
    }, [id, refetch]);

    const update = useCallback(async (updates) => {
        const result = await adminApi.updateTicket(id, updates);
        refetch();
        return result;
    }, [id, refetch]);

    return { ticket: data, loading, error, refetch, reply, update };
}

export function useAdminInvestments(params = {}) {
    const fetchInvestments = useCallback(() => adminApi.getInvestments(params), [JSON.stringify(params)]);
    const { data, loading, error, refetch } = useFetch(fetchInvestments, [JSON.stringify(params)]);

    return {
        investments: data?.investments || [],
        pagination: data?.pagination || {},
        stats: data?.stats || {},
        loading,
        error,
        refetch
    };
}


