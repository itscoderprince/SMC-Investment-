"use client";

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

// Generic fetch hook using React Query
function useFetch(queryKey, fetchFn, options = {}) {
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey,
        queryFn: fetchFn,
        enabled: options.immediate !== false,
        ...options,
    });

    return { 
        data, 
        loading: isLoading, 
        error: isError ? error.message : null, 
        refetch 
    };
}

// ==================== PUBLIC HOOKS ====================
export function usePublicStats() {
    return useFetch(['publicStats'], () => fetch('/api/public/stats').then(res => res.json()).then(res => res.data));
}

// ==================== USER HOOKS ====================
export function useDashboard() {
    return useFetch(['userDashboard'], userApi.getDashboard);
}

export function useProfile() {
    const { data, loading, error, refetch } = useFetch(['userProfile'], userApi.getProfile);

    const updateProfile = useCallback(async (profileData) => {
        const result = await userApi.updateProfile(profileData);
        refetch();
        return result;
    }, [refetch]);

    return { profile: data, loading, error, refetch, updateProfile };
}

export function useAvailableBalance() {
    const { data, loading, error, refetch } = useFetch(['userDashboard'], userApi.getDashboard);
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
    const { data, loading, error, refetch } = useFetch(['kycStatus'], kycApi.getStatus);

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
    const { data, loading, error, refetch } = useFetch(['indices', params], fetchIndices);

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
    const { data, loading, error, refetch } = useFetch(['index', id], fetchIndex, { immediate: !!id });

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
    const { data, loading, error, refetch } = useFetch(['investments', params], fetchInvestments);

    return {
        investments: data?.investments || [],
        pagination: data?.pagination,
        loading,
        error,
        refetch
    };
}

export function useActiveInvestments() {
    return useFetch(['activeInvestments'], investmentsApi.getActive);
}

export function useInvestmentSummary() {
    return useFetch(['investmentSummary'], investmentsApi.getSummary);
}

export function useInvestment(id) {
    const fetchInvestment = useCallback(() => investmentsApi.getById(id), [id]);
    return useFetch(['investment', id], fetchInvestment, { immediate: !!id });
}

// ==================== PAYMENTS HOOKS ====================
export function usePaymentRequests(params = {}) {
    const fetchPayments = useCallback(() => paymentsApi.getMyRequests(params), [JSON.stringify(params)]);
    const { data, loading, error, refetch } = useFetch(['paymentRequests', params], fetchPayments);

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
    const { data, loading, error, refetch } = useFetch(['withdrawals', params], fetchWithdrawals);

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
    return useFetch(['returnsHistory', params], fetchReturns);
}

export function useExpectedReturns() {
    return useFetch(['expectedReturns'], returnsApi.getExpected);
}

// ==================== TICKETS HOOKS ====================
export function useTickets(params = {}) {
    const fetchTickets = useCallback(() => ticketsApi.getAll(params), [JSON.stringify(params)]);
    const { data, loading, error, refetch } = useFetch(['tickets', params], fetchTickets);

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
    const { data, loading, error, refetch } = useFetch(['ticket', id], fetchTicket, { immediate: !!id });

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
    return useFetch(['referrals'], () => referralApi.getStats());
}

export function useReferralBonuses() {
    return useFetch(['referralBonuses'], () => referralApi.getBonuses());
}

export function useAdminReferrals() {
    return useFetch(['adminReferrals'], () => referralApi.getAdminStats());
}


// ==================== ADMIN HOOKS ====================
export function useAdminDashboard() {
    return useFetch(['adminDashboard'], adminApi.getDashboard, {
        refetchInterval: 15000, // Auto-refresh every 15 seconds to keep sidebar badges updated
        refetchOnWindowFocus: true // Refetch instantly when admin returns to the tab
    });
}

export function useAdminUsers(params = {}) {
    const fetchUsers = useCallback(() => adminApi.getUsers(params), [JSON.stringify(params)]);
    const { data, loading, error, refetch } = useFetch(['adminUsers', params], fetchUsers);

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
    const { data, loading, error, refetch } = useFetch(['adminReturns', params], fetchReturns);

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
    const fetchParams = { ...params, _t: Date.now() };
    const fetchPayments = useCallback(() => adminApi.getPayments(fetchParams), [JSON.stringify(params)]);
    const { data, loading, error, refetch } = useFetch(['adminPayments', params], fetchPayments);

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
    const { data, loading, error, refetch } = useFetch(['adminKYC', params], fetchKYC);

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
    const { data, loading, error, refetch } = useFetch(['adminWithdrawals', params], fetchWithdrawals);

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
    const { data, loading, error, refetch } = useFetch(['adminIndices', params], fetchIndices);

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
    const { data, loading, error, refetch } = useFetch(['adminTickets', params], fetchTickets);

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
    const { data, loading, error, refetch } = useFetch(['adminSettings', category], fetchSettings);

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
    const { data, loading, error, refetch } = useFetch(['adminTicket', id], fetchTicket, { immediate: !!id });

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
    const { data, loading, error, refetch } = useFetch(['adminInvestments', params], fetchInvestments);

    return {
        investments: data?.investments || [],
        pagination: data?.pagination || {},
        stats: data?.stats || {},
        loading,
        error,
        refetch
    };
}
