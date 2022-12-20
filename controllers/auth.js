const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const signup = async (req, res) => {
    const { username, password, email, role } = req.body;

    // 1 check required field
    if (!username || !password || !email)
        return res.status(400).json({ message: 'Username, Password and Email are required.' });

    // 2 check for duplicate username or email in the database
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
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const signin = async (req, res) => {
    const { username, password } = req.body;

    // 1 check required field
    if (!username || !password) return res.status(400).json({ message: 'Username and Password are required.' });

    // 2 find user in database
    const user = await prisma.user.findUnique({
        where: { username: username },
    });

    if (!user) return res.status(401).json({ message: 'User does not exists' });

    // 3 check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Password does not match' });

    // 4 assign token
    const access_token = jwt.sign({ id: user.id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '10m',
    });
    const refresh_token = jwt.sign({ id: user.id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '1d',
    });

    // 5 pass access_token to
    res.cookie('access_token', access_token, {
        httpOnly: true,
        sameSite: 'None',
        maxAge: 1 * 60 * 60 * 1000,
    });

    res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        sameSite: 'None',
        maxAge: 24 * 60 * 60 * 1000,
    });

    const exclude = (user, keys) => {
        for (let key of keys) {
            delete user[key];
        }
        return user;
    };
    const userWithoutPassword = exclude(user, ['password']);

    res.status(200).json(userWithoutPassword);
};

const signout = async (req, res) => {
    res.clearCookie('access_token', { httpOnly: true, sameSite: 'None' });
    res.clearCookie('refresh_token', { httpOnly: true, sameSite: 'None' });
    return res.status(200).json({ message: 'Signout successful' });
};

const refreshToken = async (req, res) => {
    // 1 get cookies
    const cookies = req.cookies;
    if (!cookies?.refresh_token) return res.status(401).json({ message: 'Refresh token not found' });

    // 2 verify refresh_token
    jwt.verify(cookies.refresh_token, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Error when verifying token' });
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) return res.status(403).json({ message: 'No user found for this refresh token' });

        const access_token = jwt.sign({ id: user.id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '10m',
        });

        res.cookie('access_token', access_token, {
            httpOnly: true,
            sameSite: 'None',
            maxAge: 1 * 60 * 60 * 1000,
        });
        res.status(200).json({ message: 'Token refresh succesful' });
    });
};

module.exports = { signup, signin, signout, refreshToken };
