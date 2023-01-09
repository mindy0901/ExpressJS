const exclude = (user, keys) => {
    for (let key of keys) {
        delete user[key];
    }
    return user;
};

module.exports = exclude;
