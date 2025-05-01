import React from "react";
import { Link } from "react-router-dom";

const RegisterSuccessMessage = () => {
    return (
        <div className="register-container success-container">
            <div className="success-message">
                <h2>Đăng ký thành công</h2>
                <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng kiểm tra email để xác nhận tài khoản.</p>
            </div>
        </div>
    );
};

export default RegisterSuccessMessage;