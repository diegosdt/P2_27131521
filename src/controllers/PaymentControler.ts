import { Request, Response } from 'express';
import { PaymentModel } from '../models/PaymentModel';

export class PaymentsController {
    private model: PaymentModel;

    constructor() {
        this.model = new PaymentModel();
    }

    async processPayment(req: Request, res: Response) {
        try {
            const ipAddress = req.ip || req.connection.remoteAddress || '';
            
            const paymentData = {
                service: req.body.service,
                email: req.body.email,
                cardName: req.body.cardName,
                cardNumber: req.body.cardNumber,
                expMonth: parseInt(req.body.expMonth),
                expYear: parseInt(req.body.expYear),
                cvv: req.body.cvv,
                amount: parseFloat(req.body.amount),
                currency: req.body.currency,
                ipAddress: ipAddress
            };

            await this.model.createPayment(paymentData);
            res.redirect('/exito');
        } catch (error) {
            console.error('Error processing payment:', error);
            res.status(500).render('payment-error', { 
                message: 'Ocurrió un error al procesar el pago' 
            });
        }
    }

    async listPayments(req: Request, res: Response) {
        try {
            const payments = await this.model.getAllPayments();
            res.render('paymentlist', { payments });
        } catch (error) {
            console.error('Error listing payments:', error);
            res.status(500).render('error', {
                message: 'Error al cargar los pagos'
            });
        }
    }
}