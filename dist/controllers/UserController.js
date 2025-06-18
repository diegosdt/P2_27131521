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
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
class UserController {
    static initializePassport() {
        passport_1.default.use(new passport_google_oauth20_1.Strategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL
        }, (accessToken, refreshToken, profile, done) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                // Buscar o crear usuario basado en el perfil de Google
                const email = (_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value;
                if (!email) {
                    return done(new Error('No se encontró email en el perfil de Google'));
                }
                let user = yield UserModel_1.UserModel.findUserByUsername(email);
                if (!user) {
                    // Crear un hash de contraseña aleatorio para el usuario de Google
                    const randomPassword = Math.random().toString(36).slice(-8);
                    const passwordHash = yield bcrypt_1.default.hash(randomPassword, 10);
                    const userId = yield UserModel_1.UserModel.createUser(email, passwordHash);
                    user = {
                        id: userId,
                        username: email,
                        password_hash: passwordHash,
                        created_at: new Date().toISOString()
                    };
                }
                return done(null, user);
            }
            catch (error) {
                return done(error);
            }
        })));
        passport_1.default.serializeUser((user, done) => {
            done(null, user.id);
        });
        passport_1.default.deserializeUser((id, done) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield UserModel_1.UserModel.findUserById(id);
                done(null, user);
            }
            catch (error) {
                done(error);
            }
        }));
    }
    static googleAuth(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            passport_1.default.authenticate('google', {
                scope: ['profile', 'email'],
                prompt: 'select_account'
            })(req, res);
        });
    }
    static googleAuthCallback(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            passport_1.default.authenticate('google', {
                failureRedirect: '/login',
                successRedirect: '/admin'
            })(req, res);
        });
    }
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
                return res.redirect('/admin');
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
