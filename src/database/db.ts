import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(__dirname, '../../contacts.db');

export async function initializeDB() {
    return open({
        filename: dbPath,
        driver: sqlite3.Database
    });
}

export async function createTables() {
    const db = await initializeDB();
    
    await db.exec(`
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            name TEXT NOT NULL,
            comment TEXT NOT NULL,
            ip_address TEXT NOT NULL,
            country TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            service TEXT NOT NULL,
            email TEXT NOT NULL,
            card_name TEXT NOT NULL,
            card_number TEXT NOT NULL,
            exp_month INTEGER NOT NULL,
            exp_year INTEGER NOT NULL,
            cvv TEXT NOT NULL,
            amount REAL NOT NULL,
            currency TEXT NOT NULL,
            ip_address TEXT NOT NULL,
            transaction_id TEXT,  
            status TEXT NOT NULL, 
            payment_date DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    `);

   
    try {
        const adminExists = await db.get(
            'SELECT 1 FROM users WHERE username = ?', 
            ['admin']
        );
        
        if (!adminExists) {
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash('admin123', saltRounds);
            
            await db.run(
                'INSERT INTO users (username, password_hash) VALUES (?, ?)',
                ['admin', passwordHash]
            );
            console.log('Usuario admin creado exitosamente');
        } else {
            console.log('El usuario admin ya existe');
        }
    } catch (error) {
        console.error('Error al crear usuario admin:', error);
    }
    


    await db.close();
}


createTables().catch(console.error);