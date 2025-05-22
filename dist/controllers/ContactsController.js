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
exports.ContactsController = void 0;
const axios_1 = __importDefault(require("axios"));
const ContactsModel_1 = require("../models/ContactsModel");
class ContactsController {
    constructor() {
        this.model = new ContactsModel_1.ContactsModel();
    }
    add(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Capturar IP pública correctamente
                let ipAddress = req.headers['x-forwarded-for'];
                if (typeof ipAddress === 'string') {
                    ipAddress = ipAddress.split(',')[0].trim(); // Tomar primera IP si hay múltiples
                }
                else {
                    ipAddress = req.connection.remoteAddress || ''; // Usar IP del cliente si no hay proxy
                }
                console.log("🌍 IP detectada:", ipAddress); // Log para diagnóstico
                const recaptchaToken = req.body['g-recaptcha-response'];
                // Verificar reCAPTCHA con Google
                const secretKey = '6LeT4TgrAAAAAEO3fxdHG3azJ5B6lNrlJ0wG1Y6a';
                const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
                const verificationResponse = yield axios_1.default.post(verificationUrl, new URLSearchParams({
                    secret: secretKey,
                    response: recaptchaToken,
                    remoteip: ipAddress
                }));
                const { data } = verificationResponse;
                if (!data.success) {
                    return res.status(400).render('error', { alertMessage: 'Verificación de reCAPTCHA fallida.' });
                }
                // Obtener el país desde ip-api.com con validación correcta
                let country = 'Desconocido';
                try {
                    const geoResponse = yield axios_1.default.get('https://ip-api.com/json/${ipAddress}');
                    console.log("🌍 Respuesta de ip-api:", geoResponse.data); // Diagnóstico
                    if (geoResponse.data && geoResponse.data.country) {
                        country = geoResponse.data.country;
                    }
                    else {
                        console.warn("⚠️ País no encontrado en la respuesta de ip-api.");
                    }
                }
                catch (geoError) {
                    console.error('❌ Error al obtener país:', geoError);
                }
                // Guardar datos incluyendo el país en la base de datos
                yield this.model.addContact({
                    email: req.body.email,
                    name: req.body.name,
                    comment: req.body.comment,
                    ipAddress: ipAddress,
                    country: country
                });
                res.redirect('/confirmacion');
            }
            catch (error) {
                console.error('Error al guardar contacto:', error);
                res.status(500).render('error', { message: 'Ocurrió un error al procesar tu mensaje' });
            }
        });
    }
    // Método list() para mostrar contactos registrados
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const contacts = yield this.model.getAllContacts();
                res.render('contactlist', { contacts });
            }
            catch (error) {
                console.error('Error al listar contactos:', error);
                res.status(500).render('error', { message: 'Error al cargar la lista de contactos' });
            }
        });
    }
}
exports.ContactsController = ContactsController;
