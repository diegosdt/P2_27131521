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
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
// Cargar variables de entorno
dotenv_1.default.config();
class ContactsController {
    constructor() {
        var _a;
        // Verificar variables de entorno requeridas
        this.validateEnvVariables();
        this.model = new ContactsModel_1.ContactsModel();
        this.emailRecipients = ((_a = process.env.EMAILDESTINO) === null || _a === void 0 ? void 0 : _a.split(',')) || [];
        this.transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            },
            tls: {
                rejectUnauthorized: process.env.NODE_ENV === 'production'
            }
        });
    }
    validateEnvVariables() {
        const requiredVars = ['GMAIL_USER', 'GMAIL_APP_PASSWORD', 'CONTRARECAPTCHA'];
        const missingVars = requiredVars.filter(varName => !process.env[varName]);
        if (missingVars.length > 0) {
            throw new Error(`Faltan variables de entorno requeridas: ${missingVars.join(', ')}`);
        }
    }
    sendNotificationEmail(contactData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.emailRecipients.length === 0) {
                console.warn('No hay destinatarios configurados para el correo');
                return;
            }
            try {
                yield this.transporter.verify();
                const mailOptions = {
                    from: `"Formulario de Contacto" <${process.env.GMAIL_USER}>`,
                    to: this.emailRecipients.join(', '),
                    subject: 'Nuevo formulario completado',
                    html: `
                    <h1>Nuevo formulario recibido</h1>
                    <p><strong>Nombre:</strong> ${contactData.name}</p>
                    <p><strong>Email:</strong> ${contactData.email}</p>
                    <p><strong>Comentario:</strong> ${contactData.comment}</p>
                    <p><strong>Dirección IP:</strong> ${contactData.ipAddress}</p>
                    <p><strong>País:</strong> ${contactData.country}</p>
                    <p><strong>Fecha/Hora:</strong> ${contactData.date}</p>
                `
                };
                const info = yield this.transporter.sendMail(mailOptions);
                console.log('Correo enviado:', info.messageId);
            }
            catch (error) {
                console.error('Error al enviar correo:', error);
                throw new Error('Falló el envío del correo de notificación');
            }
        });
    }
    getCountryFromIp(ipAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ipAddress || ipAddress === "127.0.0.1" || ipAddress === "::1") {
                return 'Localhost';
            }
            try {
                // Primero intentamos con ip-api.com
                const geoResponse = yield axios_1.default.get(`https://ip-api.com/json/${ipAddress}`);
                if (geoResponse.data.status === "success" && geoResponse.data.country) {
                    return geoResponse.data.country;
                }
                // Si falla, intentamos con ipinfo.io
                const fallbackResponse = yield axios_1.default.get(`https://ipinfo.io/${ipAddress}/json`);
                return fallbackResponse.data.country || 'Desconocido';
            }
            catch (error) {
                console.error('Error al obtener país:', error);
                return 'Desconocido';
            }
        });
    }
    add(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Validar reCAPTCHA
                const recaptchaToken = req.body['g-recaptcha-response'];
                if (!recaptchaToken) {
                    throw new Error('Token reCAPTCHA no proporcionado');
                }
                // Verificación reCAPTCHA
                const verificationResponse = yield axios_1.default.post('https://www.google.com/recaptcha/api/siteverify', new URLSearchParams({
                    secret: process.env.CONTRARECAPTCHA || '',
                    response: recaptchaToken,
                    remoteip: req.ip || ''
                }).toString(), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
                if (!verificationResponse.data.success) {
                    const errorCodes = ((_a = verificationResponse.data['error-codes']) === null || _a === void 0 ? void 0 : _a.join(', ')) || 'desconocido';
                    console.error('Error reCAPTCHA:', errorCodes);
                    throw new Error('Verificación reCAPTCHA fallida');
                }
                // Obtener IP del cliente
                let ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
                if (Array.isArray(ipAddress)) {
                    ipAddress = ipAddress[0];
                }
                ipAddress = (ipAddress === null || ipAddress === void 0 ? void 0 : ipAddress.toString().split(',')[0].trim()) || '';
                // Obtener país
                const country = yield this.getCountryFromIp(ipAddress);
                // Datos del contacto
                const contactData = {
                    email: req.body.email,
                    name: req.body.name,
                    comment: req.body.comment,
                    ipAddress: ipAddress,
                    country: country,
                    date: new Date().toLocaleString('es-ES', {
                        timeZone: 'America/Mexico_City',
                        dateStyle: 'full',
                        timeStyle: 'long'
                    })
                };
                // Guardar en base de datos
                yield this.model.addContact(contactData);
                // Enviar notificación por correo
                yield this.sendNotificationEmail(contactData);
                res.redirect('/confirmacion');
            }
            catch (error) {
                console.error('Error en el formulario:', error);
                res.status(500).render('error', {
                    message: error instanceof Error ? error.message : 'Ocurrió un error inesperado'
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
