/**
 * Generate a random alphanumeric ID
 * @param {string} prefix - Optional prefix for the ID
 * @param {number} length - Length of the random part (default 8)
 * @returns {string} - The generated ID (e.g., TKT-A1B2C3D4)
 */
export function generateId(prefix = 'ID', length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix ? `${prefix}-${result}` : result;
}

// Default export for safety
const idUtils = { generateId };
export default idUtils;
