// Get the API base URL from environment variables
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to build API URLs
export const buildApiUrl = (path) => {
    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${API_BASE_URL}/${cleanPath}`;
};