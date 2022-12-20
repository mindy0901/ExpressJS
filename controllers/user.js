const jwt = require('jsonwebtoken');
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getUser = async (req, res) => {
    const id = req.params.id;

    if (id === 'currentUser') {
        const token = req.cookies.access_token;
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
            });
            res.status(200).json(user);
        });
    } else {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.status(200).json(user);
    }
};

const getUsers = async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users).status(200);
};

module.exports = { getUsers, getUser };
