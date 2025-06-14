import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../contacts.db');

interface User {
    id: number;
    username: string;
    password_hash: string;
    created_at: string;
}

export class UserModel {
    private static async getDb() {
        try {
            const db = await open({
                filename: dbPath,
                driver: sqlite3.Database
            });
            
            
            const tableCheck = await db.get(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
            );
            
            if (!tableCheck) {
                throw new Error('La tabla users no existe en la base de datos');
            }
            
            return db;
        } catch (error) {
            console.error('Error al conectar a la base de datos:', error);
            throw error;
        }
    }

    static async createUser(username: string, passwordHash: string): Promise<number> {
        let db;
        try {
            db = await this.getDb();
            const result = await db.run(
                'INSERT INTO users (username, password_hash) VALUES (?, ?)',
                [username, passwordHash]
            );
            
            if (!result.lastID) {
                throw new Error('No se pudo crear el usuario');
            }
            
            return result.lastID;
        } catch (error) {
            console.error('Error al crear usuario:', error);
            throw error;
        } finally {
            if (db) await db.close();
        }
    }

    static async findUserByUsername(username: string): Promise<User | null> {
        let db;
        try {
            db = await this.getDb();
            const user = await db.get<User>(
                'SELECT * FROM users WHERE username = ?',
                [username]
            );
            return user || null;
        } catch (error) {
            console.error('Error al buscar usuario:', error);
            throw error;
        } finally {
            if (db) await db.close();
        }
    }
}