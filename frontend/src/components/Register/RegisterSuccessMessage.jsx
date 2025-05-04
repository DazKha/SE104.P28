import React from "react";
import { Link } from "react-router-dom";

const RegisterSuccessMessage = () => {
    return (
        <div className="register-container success-container">
            <div className="success-message">
                <h2>Đăng ký thành công</h2>
                <p>Cảm ơn bạn đã đăng ký tài khoản.</p>
                <Link to="/login" className="btn btn-primary">
                    Quay trở lại trang đăng nhập
                </Link>
            </div>
        </div>
    );
};

export default RegisterSuccessMessage;