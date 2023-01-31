const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getProducts = async (req, res) => {
    try {
        // const products = await prisma.product.findMany({
        //     orderBy: {
        //         createdAt: 'desc',
        //     },
        // });

        return res.status(200).json('done', process.env.DATABASE_URL, process.env.PORT);
    } catch (error) {
        return res.status(403).json({ message: error });
    }
};

const createProduct = async (req, res) => {
    const product = req.body;

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
