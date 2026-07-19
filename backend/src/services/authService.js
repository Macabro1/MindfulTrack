const bcrypt = require("bcrypt");

const userModel = require("../models/userModel");
const generateToken = require("../utils/generateToken");

const register = async (usuario) => {

    const {
        nombre,
        apellido,
        correo,
        password
    } = usuario;

    // Verificar si el correo ya existe
    const usuarioExiste = await userModel.findByEmail(correo);

    if (usuarioExiste) {
        throw new Error("El correo electrónico ya está registrado.");
    }

    // Encriptar contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Rol por defecto: Usuario
    const rol_id = 2;

    // Crear usuario
    const id = await userModel.create({
        nombre,
        apellido,
        correo,
        password: passwordHash,
        rol_id
    });

    return {
        id,
        nombre,
        apellido,
        correo
    };
};

const login = async (correo, password) => {

    const usuario = await userModel.findByEmail(correo);

    if (!usuario) {
        throw new Error("Correo o contraseña incorrectos.");
    }

    if (!usuario.activo) {
        throw new Error("La cuenta se encuentra deshabilitada.");
    }

    const passwordValida = await bcrypt.compare(
        password,
        usuario.password
    );

    if (!passwordValida) {
        throw new Error("Correo o contraseña incorrectos.");
    }

    const token = generateToken(usuario);

    return {
        token,
        usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            correo: usuario.correo,
            rol: usuario.rol
        }
    };
};

module.exports = {
    register,
    login
};