const jwt = require('jsonwebtoken');
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createPost = async (userId, data) => {
    try {
        const newPost = await this.prisma.post.create({ data: { ...data, authorId: userId } });
        return newPost;
    } catch (error) {
        throw new BadRequestException('Error when creating post, please check your information');
    }
};

const getPosts = async (user) => {
    const ability = this.abilityFactory.defineAbilitiesFor(user);

    if (ability.can(Action.ReadAllHidden, 'Post')) {
        const posts = await this.prisma.post.findMany();

        return posts;
    } else if (ability.can(Action.ReadAllPublish, 'Post')) {
        const posts = await this.prisma.post.findMany({
            where: { isPublish: true },
        });

        return posts;
    } else {
        throw new ForbiddenException('You are not allowed to read posts');
    }
};

const getPost = async (user, postId) => {
    // 1 find post
    const post = await this.prisma.post.findUnique({
        where: { id: postId },
    });
    if (!post) throw new NotFoundException('Post not found');

    // 2 check request user ability for read post
    const ability = this.abilityFactory.defineAbilitiesFor(user);
    if (!ability.can(Action.Read, subject('Post', post)))
        throw new ForbiddenException('You are not allowed to read this post');

    // 3 return post
    return post;
};

const updatePost = async (user, postId, data) => {
    // 1 find post in database
    const post = await this.prisma.post.findUnique({
        where: { id: postId },
    });
    if (!post) throw new NotFoundException('Post not found');

    // 2 check request user ability for update post
    const ability = this.abilityFactory.defineAbilitiesFor(user);

    if (!ability.can(Action.Update, subject('Post', post)))
        throw new ForbiddenException('You are not allowed to update this post');

    // 3 update and return post
    try {
        const updatedPost = await this.prisma.post.update({
            where: { id: postId },
            data: data,
        });

        return updatedPost;
    } catch (error) {
        throw new BadRequestException('Error when updating post, please check your information');
    }
};

const deletePost = async (user, postId) => {
    const post = await this.prisma.post.findUnique({
        where: { id: postId },
    });

    if (!post) throw new NotFoundException('Post not found');

    const ability = this.abilityFactory.defineAbilitiesFor(user);

    if (!ability.can(Action.Delete, subject('Post', post)))
        throw new ForbiddenException('You are not allowed to delete this post');

    try {
        await this.prisma.post.delete({
            where: { id: postId },
        });

        return 'Post deleted';
    } catch (error) {}
};

module.exports = {};
