import React from "react";
import { Link } from "react-router-dom";

const RegisterSuccessMessage = () => {
    return (
        <div className="register-container success-container">
            <div className="success-message">
                <h2>Registration successful</h2>
                <p>Thank you for registering.</p>
                <Link to="/login" className="btn btn-primary">
                    Go back to login page
                </Link>
            </div>
        </div>
    );
};

export default RegisterSuccessMessage;