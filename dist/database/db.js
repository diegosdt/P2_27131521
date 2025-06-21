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
exports.initializeDB = initializeDB;
exports.createTables = createTables;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const path_1 = __importDefault(require("path"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dbPath = path_1.default.join(__dirname, '../../contacts.db');
function initializeDB() {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, sqlite_1.open)({
            filename: dbPath,
            driver: sqlite3_1.default.Database
        });
    });
}
function createTables() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = yield initializeDB();
        yield db.exec(`
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
            const adminExists = yield db.get('SELECT 1 FROM users WHERE username = ?', ['admin']);
            if (!adminExists) {
                const saltRounds = 10;
                const passwordHash = yield bcryptjs_1.default.hash('admin123', saltRounds);
                yield db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', ['admin', passwordHash]);
                console.log('Usuario admin creado exitosamente');
            }
            else {
                console.log('El usuario admin ya existe');
            }
        }
        catch (error) {
            console.error('Error al crear usuario admin:', error);
        }
        yield db.close();
    });
}
createTables().catch(console.error);
