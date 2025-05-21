import { Request, Response } from 'express';
import axios from 'axios';
import { ContactsModel } from '../models/ContactsModel';

interface RecaptchaResponse {
    success: boolean;
    challenge_ts: string;
    hostname: string;
    'error-codes'?: string[];
}

interface GeoResponse {
    country: string;
}

export class ContactsController {
    private model: ContactsModel;

    constructor() {
        this.model = new ContactsModel();
    }

    async add(req: Request, res: Response) {
        try {
            // Capturar IP pública correctamente
            let ipAddress = req.headers['x-forwarded-for'];
            if (typeof ipAddress === 'string') {
                ipAddress = ipAddress.split(',')[0].trim(); // Tomar primera IP si hay múltiples
            } else {
                ipAddress = req.connection.remoteAddress || ''; // Usar IP del cliente si no hay proxy
            }

            console.log("🌍 IP detectada:", ipAddress); // Log para diagnóstico

            const recaptchaToken = req.body['g-recaptcha-response'];  

            // Verificar reCAPTCHA con Google
            const secretKey = '6LeT4TgrAAAAAEO3fxdHG3azJ5B6lNrlJ0wG1Y6a';
            const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';

            const verificationResponse = await axios.post<RecaptchaResponse>(
                verificationUrl,
                new URLSearchParams({
                    secret: secretKey,
                    response: recaptchaToken,
                    remoteip: ipAddress
                })
            );

            const { data } = verificationResponse;
            if (!data.success) {
                return res.status(400).render('error', { alertMessage: 'Verificación de reCAPTCHA fallida.' });
            }

            // Obtener el país desde ip-api.com con validación correcta
            let country = 'Desconocido';
            try {
                const geoResponse = await axios.get<GeoResponse>(`https://ip-api.com/json/${ipAddress}`);
                console.log("🌍 Respuesta de ip-api:", geoResponse.data); // Diagnóstico
                if (geoResponse.data && geoResponse.data.country) {
                    country = geoResponse.data.country;
                } else {
                    console.warn("⚠️ País no encontrado en la respuesta de ip-api.");
                }
            } catch (geoError) {
                console.error('❌ Error al obtener país:', geoError);
            }

            // Guardar datos incluyendo el país en la base de datos
            await this.model.addContact({
                email: req.body.email,
                name: req.body.name,
                comment: req.body.comment,
                ipAddress: ipAddress,
                country: country
            });

            res.redirect('/confirmacion');
        } catch (error) {
            console.error('Error al guardar contacto:', error);
            res.status(500).render('error', { message: 'Ocurrió un error al procesar tu mensaje' });
        }
    }

    // Método list() para mostrar contactos registrados
    async list(req: Request, res: Response) {
        try {
            const contacts = await this.model.getAllContacts();
            res.render('contactlist', { contacts });
        } catch (error) {
            console.error('Error al listar contactos:', error);
            res.status(500).render('error', { message: 'Error al cargar la lista de contactos' });
        }
    }
}