const { PrismaClient } = require('@prisma/client');
const { defineAbilityFor, Actions } = require('../middlewares/ability');
const prisma = new PrismaClient();

const getUsers = async (req, res) => {
    const ability = defineAbilityFor(req.user);

    if (!ability.can(Actions.ReadAll, 'User'))
        return res.status(403).json({ message: 'Permission denied - read all user' });
    
    try {
        const users = await prisma.user.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        return res.status(200).json(users);
    } catch (error) {
        return res.status(403).json({ message: 'Get users failed' });
    }
};

const getUser = async (req, res) => {
    const id = req.params.id;

    if (id === 'me') {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        delete user.password;

        return res.status(200).json(user);
    } else {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        delete user.password;

        return res.status(200).json(user);
    }
};

const updateUser = async (id, form, user) => {
    // 1 find old user in database
    const oldUser = await this.prisma.user.findUnique({
        where: { id: parseInt(id) },
    });

    // 2 check request user ability
    const ability = this.abilityFactory.defineAbilitiesFor(user);
    if (!ability.can(Action.Update, subject('User', oldUser)))
        throw new UnauthorizedException('You are not allowed to update this user');

    // 3 update user
    try {
        const updatedUser = await this.prisma.user.update({
            where: { id: parseInt(id) },
            data: form,
        });

        delete updatedUser.password;

        return updatedUser;
    } catch (error) {
        if (error?.meta?.cause) throw new NotFoundException(error.meta.cause);
        throw new NotAcceptableException('Error when updating user, please check your information');
    }
};

const deleteUser = async (id, user) => {
    // 1 find user in database
    const data = await this.prisma.user.findUnique({
        where: { id: parseInt(id) },
    });
    if (!data) throw new NotFoundException('User not found');

    // 2 check request user ability
    const ability = this.abilityFactory.defineAbilitiesFor(user);
    if (!ability.can(Action.Delete, subject('User', data)))
        throw new UnauthorizedException('You are not allowed to delete this user');

    // 3 delete user
    try {
        await this.prisma.user.delete({
            where: { id: parseInt(id) },
        });
        return 'User deleted';
    } catch (error) {
        throw new ForbiddenException('Delete user failed');
    }
};

module.exports = { getUser, getUsers };
