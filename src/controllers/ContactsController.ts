import { Request, Response } from 'express';
import { ContactsModel } from '../models/ContactsModel';

export class ContactsController {
    private model: ContactsModel;

    constructor() {
        this.model = new ContactsModel();
    }

    async add(req: Request, res: Response) {
        try {
            const ipAddress = req.ip || req.connection.remoteAddress || '';
            
            await this.model.addContact({
                email: req.body.email,
                name: req.body.name,
                comment: req.body.comment,
                ipAddress: ipAddress
            });

            res.redirect('/confirmacion');
        } catch (error) {
            console.error('Error al guardar contacto:', error);
            res.status(500).render('error', { 
                message: 'Ocurrió un error al procesar tu mensaje' 
            });
        }
    }

    async list(req: Request, res: Response) {
        try {
            const contacts = await this.model.getAllContacts();
            res.render('contactlist', { contacts });
        } catch (error) {
            console.error('Error al listar contactos:', error);
            res.status(500).render('error', { 
                message: 'Error al cargar la lista de contactos' 
            });
        }
    }
}