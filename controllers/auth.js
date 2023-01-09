require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const CryptoJS = require('crypto-js');
const { validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const signup = async (req, res) => {
    // 1 validate signup request
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    // 2 check for duplicate username or email in the database
    const { username, password, email, role } = req.body;

    const duplicateName = await prisma.user.findUnique({
        where: { username: username },
    });

    if (duplicateName) return res.status(409).json({ message: 'Username already exists' });

    const duplicateEmail = await prisma.user.findUnique({
        where: { email: email },
    });

    if (duplicateEmail) return res.status(409).json({ message: 'Email already exists' });

    // 3 create user
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const data = {
            username: username,
            email: email,
            password: hashedPassword,
            role: role,
        };

        const newUser = await prisma.user.create({
            data: data,
        });

        delete newUser.password;

        return res.status(201).json(newUser);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const signin = async (req, res) => {
    // 1 validate signin request
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    // 2 find user in database
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
        where: { username: username },
    });

    if (!user) return res.status(401).json({ message: 'User does not exists' });

    // 3 check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).json({ message: 'Password does not match' });

    // 4 assign token
    const access_token = jwt.sign({ id: user.id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '8h',
    });
    const refresh_token = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '24h',
    });

    // 5 pass access_token to
    res.header('Authorization', `Bearer ${access_token}`);
    res.header('Access-Control-Expose-Headers', 'Authorization');

    const encryptedRefreshToken = CryptoJS.AES.encrypt(refresh_token, process.env.CRYPTO_KEY).toString();

    await prisma.user.update({
        where: { username: username },
        data: { refresh_token: encryptedRefreshToken },
    });

    return res.status(200).json({ message: `You're in ${username}` });
};

const signout = async (req, res) => {
    try {
        await prisma.user.update({
            where: { id: req.userId },
            data: { refresh_token: '' },
        });

        res.header('Authorization', '');
        res.header('Access-Control-Expose-Headers', 'Authorization');

        return res.status(200).json({ message: 'Signout successful' });
    } catch (error) {
        return res.status(200).json({ message: 'Signout failed' });
    }
};

const refreshToken = async (req, res) => {
    // 1 get refresh token from request
    const refreshToken = req?.body?.refresh_token;

    if (!refreshToken) res.status(403).json({ message: 'Refresh token not found' });

    // 2 decrypt refresh token
    const bytes = CryptoJS.AES.decrypt(refreshToken, process.env.CRYPTO_KEY);

    const decryptedRefreshToken = bytes?.toString(CryptoJS.enc.Utf8);

    if (!decryptedRefreshToken) res.status(403).json({ message: 'Refresh token decryption failed' });

    // 3 verify refresh token expired time, get user info
    let userId;

    jwt.verify(decryptedRefreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) res.status(403).json({ message: err.message[0].toUpperCase() + err.message.substring(1) });

        userId = decoded.id;
    });

    // 4 find user in database by user info
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) res.status(403).json({ message: 'User not found, refresh token failed' });

    if (user.refresh_token !== refreshToken) res.status(403).json({ message: 'Refresh token does not match' });

    // 5 create new access & refresh token
    const access_token = jwt.sign({ id: user.id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '8h',
    });

    const refresh_token = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '24h' });

    // 6 encrypt refresh token and update user in database
    const encryptedRefreshToken = CryptoJS.AES.encrypt(refresh_token, process.env.CRYPTO_KEY).toString();

    await prisma.user.update({
        where: { id: user.id },
        data: { refresh_token: encryptedRefreshToken },
    });

    // 7 replace access token at response headers
    res.header('Authorization', `Bearer ${access_token}`);
    res.header('Access-Control-Expose-Headers', 'Authorization');

    res.status(200).json(encryptedRefreshToken);
};

module.exports = { signup, signin, signout, refreshToken };
