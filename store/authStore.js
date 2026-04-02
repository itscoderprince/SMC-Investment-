import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi } from '@/lib/api';
import { setTokens, clearTokens as clearTokenCache } from '@/lib/tokens';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: true,
            error: null,

            // Actions
            setUser: (user) => set({ user, isAuthenticated: !!user }),
            setTokens: (accessToken, refreshToken) => {
                // Sync to token cache so axios interceptor always has fresh tokens
                setTokens(accessToken, refreshToken);
                set({ accessToken, refreshToken });
            },

            setLoading: (isLoading) => set({ isLoading }),
            setError: (error) => set({ error }),

            login: async (credentials) => {
                set({ isLoading: true, error: null });
                try {
                    const data = await authApi.login(credentials);
                    // Sync tokens to cache
                    setTokens(data.accessToken, data.refreshToken);
                    set({
                        user: data.user,
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                        isAuthenticated: true,
                        isLoading: false
                    });
                    return data;
                } catch (err) {
                    set({ error: err.message, isLoading: false });
                    throw err;
                }
            },

            register: async (userData) => {
                set({ isLoading: true, error: null });
                try {
                    // The API expects 'name', but the form might provide 'fullName'
                    const apiData = {
                        name: userData.fullName || userData.name,
                        email: userData.email,
                        phone: userData.phone,
                        password: userData.password,
                        referralCode: userData.referralCode || undefined
                    };

                    const data = await authApi.register(apiData);
                    // Sync tokens to cache
                    setTokens(data.accessToken, data.refreshToken);
                    set({
                        user: data.user,
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                        isAuthenticated: true,
                        isLoading: false
                    });
                    return data;
                } catch (err) {
                    set({ error: err.message, isLoading: false });
                    throw err;
                }
            },

            logout: async () => {
                try {
                    await authApi.logout();
                } catch (err) {
                    console.error('Logout error:', err);
                } finally {
                    clearTokenCache();
                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false
                    });
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('auth-storage');
                    }
                }
            },

            checkAuth: async () => {
                const { accessToken } = get();
                if (!accessToken) {
                    set({ isLoading: false });
                    return;
                }

                // Sync token from store to cache on page load
                setTokens(accessToken, get().refreshToken);

                try {
                    const data = await authApi.getMe();
                    set({ user: data.user, isAuthenticated: true, isLoading: false });
                } catch (err) {
                    console.error('Auth check failed:', err);
                    set({ isLoading: false });
                }
            },

            refreshUser: async () => {
                try {
                    const data = await authApi.getMe();
                    set({ user: data.user });
                    return data.user;
                } catch (err) {
                    console.error('Refresh user failed:', err);
                    return null;
                }
            }
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                user: state.user,
                isAuthenticated: state.isAuthenticated
            }),
            // On rehydration, sync tokens to cache
            onRehydrateStorage: () => (state) => {
                if (state?.accessToken) {
                    setTokens(state.accessToken, state.refreshToken);
                }
            }
        }
    )
);

// Derived getters for convenience
export const getKycStatus = () => useAuthStore.getState().user?.kycStatus;
