const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.register = (req, res) => {
    console.log(req.body); // Log the request body
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
    }

    User.findByEmail(email, (err, existingUser) => {
        if (err) {
            console.error('Error finding user:', err);
            return res.status(500).json({ message: 'Lỗi máy chủ' });
        }
        if (existingUser) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }

        const hashedPassword = bcrypt.hashSync(password, 8);

        const newUser = { name, email, password: hashedPassword };

        User.create(newUser, (err) => {
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    return res.status(400).json({ message: 'Email đã tồn tại' });
                }
                console.error('Error creating user:', err);
                return res.status(500).json({ message: 'Lỗi máy chủ' });
            }
            return res.status(201).json({ message: 'Đăng ký thành công' });
        });
    });
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });

    User.findByEmail(email, (err, user) => {
        if (err) return res.status(500).json({ message: 'Lỗi máy chủ' });
        if (!user) return res.status(401).json({ message: 'Tài khoản không tồn tại' });

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: 'Mật khẩu không đúng' });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: 86400 });

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        })
    });
}

