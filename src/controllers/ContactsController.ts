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
    status: string;
    country?: string;
    countryCode?: string;
    message?: string;
}

export class ContactsController {
    private model: ContactsModel;

    constructor() {
        this.model = new ContactsModel();
    }

    async add(req: Request, res: Response) {
        try {
            // Capturar IP pública correctamente
            let ipAddress = req.headers['x-forwarded-for'] as string || req.ip || req.connection.remoteAddress || '';
            
            // Limpiar la dirección IP
            ipAddress = ipAddress.split(',')[0].trim();
            ipAddress = ipAddress.replace(/^::ffff:/, ''); // Eliminar prefijo IPv6 para IPv4
            
            // Si es localhost, usar una IP pública de prueba o dejarlo como desconocido
            if (ipAddress === '127.0.0.1' || ipAddress === '::1') {
                console.warn('⚠️ Dirección local detectada, no se puede geolocalizar');
                ipAddress = ''; // O podrías usar '8.8.8.8' para pruebas
            }

            console.log("🌍 IP detectada:", ipAddress);

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

            // Obtener el país desde ip-api.com
            let country = 'Desconocido';
            let countryCode = '';

            if (ipAddress) {
                try {
                    const geoResponse = await axios.get<GeoResponse>(
                        `http://ip-api.com/json/${ipAddress}?fields=status,message,country,countryCode`
                    );
                    
                    console.log("🌍 Respuesta de ip-api:", geoResponse.data);
                    
                    if (geoResponse.data.status === 'success') {
                        country = geoResponse.data.country || 'Desconocido';
                        countryCode = geoResponse.data.countryCode || '';
                        console.log('✅ País detectado: ${country} (${countryCode})');
                    } else {
                       
                        console.warn('⚠️ IP-API no pudo determinar el país. Razón: ${geoResponse.data.message }');
                    }
                } catch (geoError) {
                    console.error('❌ Error al obtener país:', geoError instanceof Error ? geoError.message : geoError);
                }
            }

            // Guardar datos en la base de datos
            await this.model.addContact({
                email: req.body.email,
                name: req.body.name,
                comment: req.body.comment,
                ipAddress: ipAddress,
                country: country,
                countryCode: countryCode
            });

            res.redirect('/confirmacion');
        } catch (error) {
            console.error('Error al guardar contacto:', error instanceof Error ? error.message : error);
            res.status(500).render('error', { message: 'Ocurrió un error al procesar tu mensaje' });
        }
    }

    async list(req: Request, res: Response) {
        try {
            const contacts = await this.model.getAllContacts();
            res.render('contactlist', { contacts });
        } catch (error) {
            console.error('Error al listar contactos:', error instanceof Error ? error.message : error);
            res.status(500).render('error', { message: 'Error al cargar la lista de contactos' });
        }
    }
}