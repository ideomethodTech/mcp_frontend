import { useMemo } from 'react';

/**
 * Custom hook to get user initials from user data
 * @param {Object} user - User object containing user data
 * @returns {string} User initials (up to 2 characters)
 */
export function useUserInitials(user) {
  return useMemo(() => {
    if (!user?.user) return "";

    const name = user.user.name || user.user.username || user.user.email;
    if (!name) return "";

    const parts = name.split(/\s+|\./).filter(Boolean);
    
    if (parts.length === 1 && parts[0].includes("@")) {
      // Email: use first two letters before @
      return parts[0].split("@")[0].slice(0, 2).toUpperCase();
    }
    
    // Name or username: use first letter of each word (up to 2)
    return parts.map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  }, [user]);
}
