"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDB = initializeDB;
exports.createTables = createTables;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.join(__dirname, '../../contacts.db');
async function initializeDB() {
    return (0, sqlite_1.open)({
        filename: dbPath,
        driver: sqlite3_1.default.Database
    });
}
async function createTables() {
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
    `);
    await db.close();
}
createTables().catch(console.error);
