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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsController = void 0;
const ContactsModel_1 = require("../models/ContactsModel");
class ContactsController {
    constructor() {
        this.model = new ContactsModel_1.ContactsModel();
    }
    add(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ipAddress = req.ip || req.connection.remoteAddress || '';
                yield this.model.addContact({
                    email: req.body.email,
                    name: req.body.name,
                    comment: req.body.comment,
                    ipAddress: ipAddress
                });
                res.redirect('/confirmacion');
            }
            catch (error) {
                console.error('Error al guardar contacto:', error);
                res.status(500).render('error', {
                    message: 'Ocurrió un error al procesar tu mensaje'
                });
            }
        });
    }
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const contacts = yield this.model.getAllContacts();
                res.render('contactlist', { contacts });
            }
            catch (error) {
                console.error('Error al listar contactos:', error);
                res.status(500).render('error', {
                    message: 'Error al cargar la lista de contactos'
                });
            }
        });
    }
}
exports.ContactsController = ContactsController;
