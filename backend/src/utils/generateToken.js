const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            correo: user.correo,
            rol: user.rol
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "24h"
        }
    );
};

module.exports = generateToken;