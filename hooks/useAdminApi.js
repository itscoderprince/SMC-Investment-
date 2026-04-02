"use client";

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/api';

// Generic fetch hook for admin
function useAdminFetch(fetchFn, deps = [], immediate = true) {
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

// ==================== ADMIN DASHBOARD ====================
export function useAdminDashboard() {
    return useAdminFetch(adminApi.getDashboard);
}

// ==================== ADMIN USERS ====================
export function useAdminUsers(params = {}) {
    const fetchUsers = useCallback(() => adminApi.getUsers(params), [JSON.stringify(params)]);
    const { data, loading, error, refetch } = useAdminFetch(fetchUsers, [JSON.stringify(params)]);

    const updateUser = useCallback(async (id, userData) => {
        const result = await adminApi.updateUser(id, userData);
        refetch();
        return result;
    }, [refetch]);

    return {
        users: data?.users || [],
        pagination: data?.pagination,
        loading,
        error,
        refetch,
        updateUser
    };
}

export function useAdminUser(id) {
    const fetchUser = useCallback(() => adminApi.getUser(id), [id]);
    return useAdminFetch(fetchUser, [id], !!id);
}

// ==================== ADMIN KYC ====================
export function useAdminKYC(params = {}) {
    const fetchKYC = useCallback(() => adminApi.getKYCRecords(params), [JSON.stringify(params)]);
    const { data, loading, error, refetch } = useAdminFetch(fetchKYC, [JSON.stringify(params)]);

    const approve = useCallback(async (id) => {
        const result = await adminApi.approveKYC(id);
        refetch();
        return result;
    }, [refetch]);

    const reject = useCallback(async (id, reason) => {
        const result = await adminApi.rejectKYC(id, reason);
        refetch();
        return result;
    }, [refetch]);

    return {
        records: data?.records || [],
        pagination: data?.pagination,
        loading,
        error,
        refetch,
        approve,
        reject
    };
}

// ==================== ADMIN PAYMENTS ====================
export function useAdminPayments(params = {}) {
    const fetchPayments = useCallback(() => adminApi.getPayments(params), [JSON.stringify(params)]);
    const { data, loading, error, refetch } = useAdminFetch(fetchPayments, [JSON.stringify(params)]);

    const approve = useCallback(async (id) => {
        const result = await adminApi.approvePayment(id);
        refetch();
        return result;
    }, [refetch]);

    const reject = useCallback(async (id, reason) => {
        const result = await adminApi.rejectPayment(id, reason);
        refetch();
        return result;
    }, [refetch]);

    return {
        payments: data?.requests || [],
        stats: data?.stats,
        pagination: data?.pagination,
        loading,
        error,
        refetch,
        approve,
        reject
    };
}

// ==================== ADMIN WITHDRAWALS ====================
export function useAdminWithdrawals(params = {}) {
    const fetchWithdrawals = useCallback(() => adminApi.getWithdrawals(params), [JSON.stringify(params)]);
    const { data, loading, error, refetch } = useAdminFetch(fetchWithdrawals, [JSON.stringify(params)]);

    const approve = useCallback(async (id, transactionReference) => {
        const result = await adminApi.approveWithdrawal(id, transactionReference);
        refetch();
        return result;
    }, [refetch]);

    const reject = useCallback(async (id, reason) => {
        const result = await adminApi.rejectWithdrawal(id, reason);
        refetch();
        return result;
    }, [refetch]);

    return {
        withdrawals: data?.withdrawals || [],
        stats: data?.stats,
        pagination: data?.pagination,
        loading,
        error,
        refetch,
        approve,
        reject
    };
}

// ==================== ADMIN INDICES ====================
export function useAdminIndices(params = {}) {
    const fetchIndices = useCallback(() => adminApi.getIndices(params), [JSON.stringify(params)]);
    const { data, loading, error, refetch } = useAdminFetch(fetchIndices, [JSON.stringify(params)]);

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
        const result = await adminApi.deleteIndex(id);
        refetch();
        return result;
    }, [refetch]);

    const distributeReturns = useCallback(async (id, data) => {
        const result = await adminApi.distributeReturns(id, data);
        refetch();
        return result;
    }, [refetch]);

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

// ==================== ADMIN SETTINGS ====================
export function useAdminSettings(category = null) {
    const fetchSettings = useCallback(() => adminApi.getSettings(category), [category]);
    const { data, loading, error, refetch } = useAdminFetch(fetchSettings, [category]);

    const update = useCallback(async (cat, settings) => {
        const result = await adminApi.updateSettings(cat, settings);
        refetch();
        return result;
    }, [refetch]);

    const init = useCallback(async () => {
        const result = await adminApi.initSettings();
        refetch();
        return result;
    }, [refetch]);

    return {
        settings: data?.settings || {},
        loading,
        error,
        refetch,
        update,
        init
    };
}

// ==================== ADMIN TICKETS ====================
export function useAdminTickets(params = {}) {
    const fetchTickets = useCallback(() => adminApi.getTickets(params), [JSON.stringify(params)]);
    const { data, loading, error, refetch } = useAdminFetch(fetchTickets, [JSON.stringify(params)]);

    const reply = useCallback(async (id, message) => {
        const result = await adminApi.replyTicket(id, message);
        refetch();
        return result;
    }, [refetch]);

    const updateTicket = useCallback(async (id, ticketData) => {
        const result = await adminApi.updateTicket(id, ticketData);
        refetch();
        return result;
    }, [refetch]);

    return {
        tickets: data?.tickets || [],
        stats: data?.stats,
        pagination: data?.pagination,
        loading,
        error,
        refetch,
        reply,
        updateTicket
    };
}

export function useAdminTicket(id) {
    const fetchTicket = useCallback(() => adminApi.getTicket(id), [id]);
    const { data, loading, error, refetch } = useAdminFetch(fetchTicket, [id], !!id);

    const reply = useCallback(async (message) => {
        const result = await adminApi.replyTicket(id, message);
        refetch();
        return result;
    }, [id, refetch]);

    const update = useCallback(async (ticketData) => {
        const result = await adminApi.updateTicket(id, ticketData);
        refetch();
        return result;
    }, [id, refetch]);

    return { ticket: data, loading, error, refetch, reply, update };
}
