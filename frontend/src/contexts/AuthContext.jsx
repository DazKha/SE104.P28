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
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setIsLoggedIn(true);
        setUser(userData);
        setCurrentUserId(userData.id || userData.email);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        clearUserData();
      }
    }
  }, []);

  const login = (userData, token) => {
    console.log('AuthContext: User logged in', userData);
    
    const newUserId = userData.id || userData.email;
    const isNewUser = currentUserId && currentUserId !== newUserId;
    
    if (isNewUser) {
      console.log('Different user detected, clearing data...');
      clearUserData();
    }
    
    setUser(userData);
    setCurrentUserId(newUserId);
    setIsLoggedIn(true);
    setAuthKey(prev => prev + 1);
  };

  const logout = () => {
    console.log('AuthContext: User logged out');
    
    // Chỉ xóa token và thông tin xác thực
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    // KHÔNG xóa dữ liệu người dùng
    // Chỉ xóa thông tin xác thực
    setUser(null);
    setIsLoggedIn(false);
    
    // Giữ lại currentUserId để có thể phát hiện đăng nhập lại của cùng user
    setAuthKey(prev => prev + 1);
  };

  const clearUserData = () => {
    // Chỉ xóa dữ liệu khi thực sự cần thiết (ví dụ: khi chuyển user)
    const keysToKeep = ['theme', 'language'];
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