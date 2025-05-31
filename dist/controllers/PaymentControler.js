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
exports.PaymentsController = void 0;
const PaymentModel_1 = require("../models/PaymentModel");
const PaymentService_1 = require("../services/PaymentService");
class PaymentsController {
    constructor() {
        this.model = new PaymentModel_1.PaymentModel();
    }
    processPayment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Incoming payment data:', req.body);
                const ipAddress = req.ip || req.connection.remoteAddress || '';
                // Validar campos requeridos
                const requiredFields = ['service', 'email', 'cardName', 'cardNumber',
                    'expMonth', 'expYear', 'cvv', 'amount', 'currency'];
                const missingFields = requiredFields.filter(field => !req.body[field]);
                if (missingFields.length > 0) {
                    return res.redirect(`/form_pay?error=missing_fields&fields=${missingFields.join(',')}`);
                }
                // Validar tarjeta antes de procesar
                if (!PaymentService_1.PaymentService.isValidTestCard(req.body.cardNumber.replace(/\s+/g, ''))) {
                    return res.redirect('/negacion');
                }
                //  Ahora si sirveeeeee
                // Procesar pago
                const apiResponse = yield PaymentService_1.PaymentService.processPayment({
                    amount: parseFloat(req.body.amount),
                    cardNumber: req.body.cardNumber.replace(/\s+/g, ''),
                    cvv: req.body.cvv,
                    expirationMonth: req.body.expMonth,
                    expirationYear: req.body.expYear,
                    fullName: req.body.cardName,
                    currency: req.body.currency.toUpperCase(),
                    description: `Service: ${req.body.service}`,
                    reference: `user:${req.body.email}`
                });
                // Manejar respuestaaa
                if (apiResponse.status !== 'APPROVED') {
                    return this.handlePaymentError(res, apiResponse);
                }
                // Guardar en base de dato uwu
                const paymentId = yield this.model.createPayment({
                    service: req.body.service,
                    email: req.body.email,
                    cardName: req.body.cardName,
                    cardNumber: req.body.cardNumber,
                    expMonth: parseInt(req.body.expMonth),
                    expYear: parseInt(req.body.expYear),
                    cvv: req.body.cvv,
                    amount: parseFloat(req.body.amount),
                    currency: req.body.currency,
                    ipAddress: ipAddress,
                    transactionId: apiResponse.transactionId,
                    status: apiResponse.status
                });
                res.redirect(`/confirmacion`);
            }
            catch (error) {
                console.error('Payment processing error:', error);
                res.redirect('/payment/error/server-error');
            }
        });
    }
    listPayments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payments = yield this.model.getAllPayments();
                res.render('paymentlist', {
                    payments,
                    formatCard: (cardNumber) => cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ')
                });
            }
            catch (error) {
                console.error('Error listing payments:', error);
                res.status(500).render('error', {
                    message: 'Error loading payment history'
                });
            }
        });
    }
    handlePaymentError(res, apiResponse) {
        const errorViewData = {
            message: apiResponse.message,
            errorCode: apiResponse.errorCode,
            suggestion: this.getErrorSuggestion(apiResponse.errorCode)
        };
        return res.status(400).render('payment-error', errorViewData);
    }
    getErrorSuggestion(errorCode) {
        const suggestions = {
            '001': 'Por favor use una de nuestras tarjetas de prueba',
            '002': 'Contacte a su banco o pruebe otro método de pago',
            '003': 'Intente nuevamente más tarde o contacte soporte',
            '004': 'Verifique el saldo de su cuenta o use otra tarjeta'
        };
        return suggestions[errorCode] || 'Por favor intente nuevamente o contacte soporte';
    }
}
exports.PaymentsController = PaymentsController;
