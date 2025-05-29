import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authKey, setAuthKey] = useState(0); // Key để force re-render components hoặc trigger data refresh
  const [currentUserId, setCurrentUserId] = useState(null); // Track current user ID

  // Kiểm tra token khi app khởi động
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      // Có thể decode token để lấy user info nếu cần
    }
  }, []);

  const login = (userData, token) => {
    console.log('AuthContext: User logged in', userData);
    
    // Kiểm tra xem có phải user khác không
    const newUserId = userData.id || userData.email; // Sử dụng ID hoặc email làm identifier
    const isNewUser = currentUserId && currentUserId !== newUserId;
    
    if (isNewUser) {
      // Chỉ clear data khi chuyển sang user khác
      console.log('Different user detected, clearing data...');
      clearUserData();
    }
    
    setUser(userData);
    setCurrentUserId(newUserId);
    setIsLoggedIn(true);
    
    // Increment authKey để force re-render tất cả components
    setAuthKey(prev => prev + 1);
  };

  const logout = () => {
    console.log('AuthContext: User logged out');
    
    // Clear tokens
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    // KHÔNG clear user data khi logout - chỉ clear authentication state
    // Data sẽ được giữ lại cho lần đăng nhập tiếp theo của cùng user
    
    setUser(null);
    setIsLoggedIn(false);
    // KHÔNG reset currentUserId để có thể detect same user login lại
    
    // Increment authKey để force re-render tất cả components
    setAuthKey(prev => prev + 1);
  };

  const clearUserData = () => {
    // Clear any cached data in localStorage that might be user-specific
    const keysToKeep = ['theme', 'language']; // Giữ lại các settings không liên quan đến user
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key) && key !== 'token') {
        localStorage.removeItem(key);
      }
    });
  };

  // Method để force clear data (có thể dùng khi cần)
  const forceClearData = () => {
    clearUserData();
    setCurrentUserId(null);
    setAuthKey(prev => prev + 1);
  };

  // Method để trigger làm mới dữ liệu
  const triggerDataRefresh = () => {
    setAuthKey(prev => prev + 1);
  };

  const value = {
    isLoggedIn,
    user,
    authKey, // Expose authKey để components có thể sử dụng hoặc lắng nghe sự thay đổi
    currentUserId,
    login,
    logout,
    clearUserData,
    forceClearData,
    triggerDataRefresh // Expose hàm trigger làm mới dữ liệu
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 