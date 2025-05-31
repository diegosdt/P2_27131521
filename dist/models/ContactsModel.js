"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsModel = void 0;
const db_1 = require("../database/db");
class ContactsModel {
    async addContact(contactData) {
        const db = await (0, db_1.initializeDB)();
        try {
            const result = await db.run(`INSERT INTO contacts (email, name, comment, ip_address, country) 
                 VALUES (?, ?, ?, ?, ?)`, [
                contactData.email,
                contactData.name,
                contactData.comment,
                contactData.ipAddress,
                contactData.country
            ]);
            return result.lastID;
        }
        finally {
            await db.close();
        }
    }
    async getAllContacts() {
        const db = await (0, db_1.initializeDB)();
        try {
            return await db.all('SELECT * FROM contacts ORDER BY created_at DESC');
        }
        finally {
            await db.close();
        }
    }
}
exports.ContactsModel = ContactsModel;
