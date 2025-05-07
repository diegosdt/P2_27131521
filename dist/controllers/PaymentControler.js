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
class PaymentsController {
    constructor() {
        this.model = new PaymentModel_1.PaymentModel();
    }
    processPayment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                yield this.model.createPayment(paymentData);
                res.redirect('/exito');
            }
            catch (error) {
                console.error('Error processing payment:', error);
                res.status(500).render('payment-error', {
                    message: 'Ocurrió un error al procesar el pago'
                });
            }
        });
    }
    listPayments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payments = yield this.model.getAllPayments();
                res.render('paymentlist', { payments });
            }
            catch (error) {
                console.error('Error listing payments:', error);
                res.status(500).render('error', {
                    message: 'Error al cargar los pagos'
                });
            }
        });
    }
}
exports.PaymentsController = PaymentsController;
