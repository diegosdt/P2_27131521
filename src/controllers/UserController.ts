import bcrypt from 'bcrypt';
import { UserModel } from '../models/UserModel';
import { Request, Response } from 'express';
import 'express-session';
import path from 'path';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

declare module 'express-session' {
    interface SessionData {
        userId?: number;
        username?: string;
    }
}

export class UserController {
    static initializePassport() {
        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!
        }, async (accessToken, refreshToken, profile, done) => {
            try {
                
                const email = profile.emails?.[0]?.value;
                if (!email) {
                    return done(new Error('No se encontró email en el perfil de Google'));
                }

                let user = await UserModel.findUserByUsername(email);
                
                if (!user) {
                    
                    const randomPassword = Math.random().toString(36).slice(-8);
                    const passwordHash = await bcrypt.hash(randomPassword, 10);
                    
                    const userId = await UserModel.createUser(email, passwordHash);
                    
                    user = {
                        id: userId,
                        username: email,
                        password_hash: passwordHash,
                        created_at: new Date().toISOString()
                    };
                }
                
                return done(null, user);
            } catch (error) {
                return done(error as Error);
            }
        }));

        passport.serializeUser((user: any, done) => {
            done(null, user.id);
        });

        passport.deserializeUser(async (id: number, done) => {
            try {
                const user = await UserModel.findUserById(id);
                done(null, user);
            } catch (error) {
                done(error);
            }
        });
    }

    static async googleAuth(req: Request, res: Response) {
        passport.authenticate('google', { 
            scope: ['profile', 'email'],
            prompt: 'select_account' 
        })(req, res);
    }

    static async googleAuthCallback(req: Request, res: Response) {
        passport.authenticate('google', {
            failureRedirect: '/login',
            successRedirect: '/admin'
        })(req, res);
    }

    static async register(req: Request, res: Response): Promise<void> {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).render('register', { 
                error: 'Usuario y contraseña son requeridos' 
            });
        }
    
        try {
            console.log(`Intentando registrar usuario: ${username}`);
            
            const existingUser = await UserModel.findUserByUsername(username);
            if (existingUser) {
                console.log(`Usuario ya existe: ${username}`);
                return res.render('register', { 
                    error: 'El nombre de usuario ya está en uso' 
                });
            }
    
            console.log('Creando hash de contraseña...');
            const passwordHash = await bcrypt.hash(password, 10);
            
            console.log('Guardando usuario en la base de datos...');
            await UserModel.createUser(username, passwordHash);
            
            console.log(`Usuario registrado exitosamente: ${username}`);
            
            req.session.username = username; 
            return res.redirect('/registrado');
            
        } catch (error: unknown) {
            console.error('Error en UserController.register:', error);
            
            let errorMessage = 'Error al registrar el usuario';
            let errorDetails: string | undefined = undefined;
    
            if (error instanceof Error) {
                errorMessage = error.message;
                if (process.env.NODE_ENV === 'development') {
                    errorDetails = error.stack;
                }
                
                if (error.message.includes('SQLITE_ERROR: no such table')) {
                    errorMessage = 'Error de configuración de la base de datos';
                } else if (error.message.includes('UNIQUE constraint failed')) {
                    errorMessage = 'El nombre de usuario ya está en uso';
                }
            }
            
            return res.status(500).render('register', { 
                error: errorMessage,
                errorDetails
            });
        }
    }

    static async login(req: Request, res: Response): Promise<void> {
        const { username, password } = req.body;

        try {
            const user = await UserModel.findUserByUsername(username);
            
            if (!user) {
                return res.render('login', { 
                    error: 'Credenciales inválidas' 
                });
            }

            const passwordMatch = await bcrypt.compare(password, user.password_hash);
            if (!passwordMatch) {
                return res.render('login', { 
                    error: 'Credenciales inválidas' 
                });
            }

            req.session.userId = user.id;
            req.session.username = user.username;
            return res.redirect('/admin');
            
        } catch (error: unknown) {
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
    }   
}