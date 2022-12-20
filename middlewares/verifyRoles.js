const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // 1 check if user having role
        if (!req?.role) return res.status(401).json({ message: 'User role missing' });

        // 2 check if user role exists in allowedRoles
        const rolesArray = [...allowedRoles];
        const result = rolesArray.includes(req.role);
        if (!result) return res.status(401).json({ message: 'User role denied' });
        next();
    };
};

module.exports = verifyRoles;
