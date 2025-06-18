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
exports.UserModel = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.resolve(__dirname, '../../contacts.db');
class UserModel {
    static getDb() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = yield (0, sqlite_1.open)({
                    filename: dbPath,
                    driver: sqlite3_1.default.Database
                });
                const tableCheck = yield db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
                if (!tableCheck) {
                    throw new Error('La tabla users no existe en la base de datos');
                }
                return db;
            }
            catch (error) {
                console.error('Error al conectar a la base de datos:', error);
                throw error;
            }
        });
    }
    static createUser(username, passwordHash) {
        return __awaiter(this, void 0, void 0, function* () {
            let db;
            try {
                db = yield this.getDb();
                const result = yield db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, passwordHash]);
                if (!result.lastID) {
                    throw new Error('No se pudo crear el usuario');
                }
                return result.lastID;
            }
            catch (error) {
                console.error('Error al crear usuario:', error);
                throw error;
            }
            finally {
                if (db)
                    yield db.close();
            }
        });
    }
    static findUserByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            let db;
            try {
                db = yield this.getDb();
                const user = yield db.get('SELECT * FROM users WHERE username = ?', [username]);
                return user || null;
            }
            catch (error) {
                console.error('Error al buscar usuario:', error);
                throw error;
            }
            finally {
                if (db)
                    yield db.close();
            }
        });
    }
    static findUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let db;
            try {
                db = yield this.getDb();
                const user = yield db.get('SELECT * FROM users WHERE id = ?', [id]);
                return user || null;
            }
            catch (error) {
                console.error('Error al buscar usuario por ID:', error);
                throw error;
            }
            finally {
                if (db)
                    yield db.close();
            }
        });
    }
}
exports.UserModel = UserModel;
