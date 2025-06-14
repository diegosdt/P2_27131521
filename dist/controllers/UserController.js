"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const UserModel_1 = require("../models/UserModel");
require("express-session");
class UserController {
    static register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).render('register', {
                    error: 'Usuario y contraseña son requeridos'
                });
            }
            try {
                console.log(`Intentando registrar usuario: ${username}`);
                // Verificar si el usuario ya existe uwu
                const existingUser = yield UserModel_1.UserModel.findUserByUsername(username);
                if (existingUser) {
                    console.log(`Usuario ya existe: ${username}`);
                    return res.render('register', {
                        error: 'El nombre de usuario ya está en uso'
                    });
                }
                console.log('Creando hash de contraseña...');
                const passwordHash = yield bcrypt_1.default.hash(password, 10);
                console.log('Guardando usuario en la base de datos...');
                yield UserModel_1.UserModel.createUser(username, passwordHash);
                console.log(`Usuario registrado exitosamente: ${username}`);
                req.session.username = username;
                return res.redirect('/registrado');
            }
            catch (error) {
                console.error('Error en UserController.register:', error);
                let errorMessage = 'Error al registrar el usuario';
                let errorDetails = undefined;
                if (error instanceof Error) {
                    errorMessage = error.message;
                    if (process.env.NODE_ENV === 'development') {
                        errorDetails = error.stack;
                    }
                    if (error.message.includes('SQLITE_ERROR: no such table')) {
                        errorMessage = 'Error de configuración de la base de datos';
                    }
                    else if (error.message.includes('UNIQUE constraint failed')) {
                        errorMessage = 'El nombre de usuario ya está en uso';
                    }
                }
                return res.status(500).render('register', {
                    error: errorMessage,
                    errorDetails
                });
            }
        });
    }
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, password } = req.body;
            try {
                const user = yield UserModel_1.UserModel.findUserByUsername(username);
                if (!user) {
                    return res.render('login', {
                        error: 'Credenciales inválidas'
                    });
                }
                const passwordMatch = yield bcrypt_1.default.compare(password, user.password_hash);
                if (!passwordMatch) {
                    return res.render('login', {
                        error: 'Credenciales inválidas'
                    });
                }
                req.session.userId = user.id;
                req.session.username = user.username;
                return res.redirect('/admin/contactlist');
            }
            catch (error) {
                console.error('Error en UserController.login:', error);
                let errorMessage = 'Error al iniciar sesión';
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
                return res.render('login', {
                    error: errorMessage,
                    errorDetails: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
                });
            }
        });
    }
}
exports.UserController = UserController;
