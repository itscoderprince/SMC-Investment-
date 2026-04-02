let accessToken = null;
let refreshToken = null;

export const setTokens = (access, refresh) => {
    accessToken = access;
    refreshToken = refresh;
};

export const getAccessToken = () => {
    // If memory is empty, try to get from local storage if in browser
    if (!accessToken && typeof window !== 'undefined') {
        try {
            const storage = JSON.parse(localStorage.getItem('auth-storage'));
            if (storage?.state?.accessToken) {
                accessToken = storage.state.accessToken;
                refreshToken = storage.state.refreshToken;
            }
        } catch (e) {
            // Ignore storage errors
        }
    }
    return accessToken;
};

export const getRefreshToken = () => {
    if (!refreshToken && typeof window !== 'undefined') {
        getAccessToken(); // This will populate both
    }
    return refreshToken;
};

export const clearTokens = () => {
    accessToken = null;
    refreshToken = null;
};
