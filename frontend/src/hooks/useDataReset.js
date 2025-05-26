import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

// Custom hook để reset component state chỉ khi user thay đổi
export const useDataReset = (resetCallback) => {
  const { authKey, currentUserId, isLoggedIn } = useAuth();
  const prevUserIdRef = useRef(null);
  const prevLoggedInRef = useRef(false);
  
  useEffect(() => {
    const userChanged = prevUserIdRef.current && 
                       prevUserIdRef.current !== currentUserId && 
                       currentUserId !== null;
    
    const justLoggedIn = !prevLoggedInRef.current && isLoggedIn;
    
    // Reset chỉ khi:
    // 1. User thay đổi (khác user ID)
    // 2. Hoặc lần đầu đăng nhập (từ logged out -> logged in)
    if ((userChanged || justLoggedIn) && resetCallback && typeof resetCallback === 'function') {
      console.log('Data reset triggered:', { userChanged, justLoggedIn, currentUserId });
      resetCallback();
    }
    
    // Update refs
    prevUserIdRef.current = currentUserId;
    prevLoggedInRef.current = isLoggedIn;
  }, [authKey, currentUserId, isLoggedIn, resetCallback]);
  
  return authKey;
};

// Hook để clear localStorage data chỉ khi user thay đổi
export const useClearUserData = () => {
  const { currentUserId } = useAuth();
  const prevUserIdRef = useRef(null);
  
  useEffect(() => {
    const userChanged = prevUserIdRef.current && 
                       prevUserIdRef.current !== currentUserId && 
                       currentUserId !== null;
    
    if (userChanged) {
      console.log('User changed, clearing localStorage data...');
      // Clear any user-specific data from localStorage
      const userSpecificKeys = [
        'transactions',
        'budgets',
        'savings',
        'loans',
        'userPreferences'
      ];
      
      userSpecificKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
        }
      });
    }
    
    prevUserIdRef.current = currentUserId;
  }, [currentUserId]);
}; 