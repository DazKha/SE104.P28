const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.register = (req, res) => {
    console.log(req.body); // Log the request body
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
    }

    try {
        const existingUser = User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }

        const hashedPassword = bcrypt.hashSync(password, 8);
        const newUser = { name, email, password: hashedPassword };

        User.create(newUser);
        return res.status(201).json({ message: 'Đăng ký thành công' });
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }
        console.error('Error creating user:', err);
        return res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};

exports.login = (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
        }

        const user = User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Tài khoản không tồn tại' });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Mật khẩu không đúng' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Error in login:', err);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};

