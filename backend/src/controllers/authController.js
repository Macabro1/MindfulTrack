const authService = require("../services/authService");
const {
    successResponse,
    errorResponse
} = require("../utils/response");

// Registrar usuario
const register = async (req, res) => {
    try {

        const usuario = await authService.register(req.body);

        return successResponse(
            res,
            "Usuario registrado correctamente.",
            usuario,
            201
        );

    } catch (error) {

        return errorResponse(
            res,
            error.message,
            400
        );

    }
};

// Iniciar sesión
const login = async (req, res) => {

    try {

        const { correo, password } = req.body;

        const resultado = await authService.login(
            correo,
            password
        );

        return successResponse(
            res,
            "Inicio de sesión exitoso.",
            resultado,
            200
        );

    } catch (error) {

        return errorResponse(
            res,
            error.message,
            401
        );

    }

};

module.exports = {
    register,
    login
};