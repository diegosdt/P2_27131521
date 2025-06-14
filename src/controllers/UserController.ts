import bcrypt from 'bcrypt';
import { UserModel } from '../models/UserModel';
import { Request, Response } from 'express';
import 'express-session';
import path from 'path';

declare module 'express-session' {
    interface SessionData {
        userId?: number;
        username?: string;
    }
}

export class UserController {
    static async register(req: Request, res: Response): Promise<void> {
        const { username, password } = req.body;
        
        
        if (!username || !password) {
            return res.status(400).render('register', { 
                error: 'Usuario y contraseña son requeridos' 
            });
        }
    
        try {
            console.log(`Intentando registrar usuario: ${username}`);
            
            // Verificar si el usuario ya existe uwu
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
            return res.redirect('/admin/contactlist');
            
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