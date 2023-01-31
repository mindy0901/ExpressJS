const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
        return res.status(200).json(products);
    } catch (error) {
        return res.status(403).json({ message: 'Get products failed' });
    }
};

const createProduct = async (req, res) => {
    const product = req.body;

    console.log(product);
    try {
        const newProduct = await prisma.product.create({
            data: product,
        });

        return res.status(200).json(newProduct);
    } catch (error) {
        console.log(error);
        return res.status(403).json({ message: 'Create product failed' });
    }
};
module.exports = { getProducts, createProduct };
