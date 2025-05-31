"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class PaymentService {
    static isValidTestCard(cardNumber) {
        const testCards = [
            '4111111111111111', // Visa
            '555555555554444', // Mastercard
            '37828246310005', // American Express
            '601111111111117', // Discover
            '3530111333300000', // JCB
            '30569309025904' // Diners Club
        ];
        return testCards.includes(cardNumber.replace(/\s+/g, ''));
    }
    static async processPayment(paymentData) {
        try {
            const requestData = {
                amount: paymentData.amount.toFixed(2),
                "card-number": paymentData.cardNumber,
                "cvv": paymentData.cvv,
                "expiration-month": paymentData.expirationMonth.padStart(2, '0'),
                "expiration-year": paymentData.expirationYear,
                "full-name": paymentData.fullName.toUpperCase(),
                currency: paymentData.currency,
                description: paymentData.description?.substring(0, 100) || "Payment",
                reference: paymentData.reference || `ref_${Date.now()}`
            };
            const response = await axios_1.default.post(`${this.API_URL}/payments`, requestData, {
                headers: {
                    'Authorization': `Bearer ${this.API_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 5000
            });
            if (response.data.error_code) {
                return this.mapErrorResponse(response.data.error_code);
            }
            return {
                status: 'APPROVED',
                transactionId: response.data.transaction_id,
                message: 'Pago procesado exitosamente',
                rawResponse: response.data
            };
        }
        catch (error) {
            console.error('Payment API Error:', error.response?.data || error.message);
            return this.handleApiError(error);
        }
    }
    static mapErrorResponse(errorCode) {
        const errorMap = {
            '001': { status: 'ERROR', errorCode: '001', message: 'Número de tarjeta inválido' },
            '002': { status: 'REJECTED', errorCode: '002', message: 'Pago rechazado' },
            '003': { status: 'ERROR', errorCode: '003', message: 'Error procesando el pago' },
            '004': { status: 'INSUFFICIENT', errorCode: '004', message: 'Fondos insuficientes' }
        };
        return errorMap[errorCode] || {
            status: 'ERROR',
            errorCode: '000',
            message: 'Error desconocido en el pago'
        };
    }
    static handleApiError(error) {
        if (error.response) {
            if (error.response.data?.error_code) {
                return this.mapErrorResponse(error.response.data.error_code);
            }
            return {
                status: 'ERROR',
                errorCode: `HTTP_${error.response.status}`,
                message: error.response.data?.message || 'Error en la solicitud a la API'
            };
        }
        else if (error.request) {
            return {
                status: 'ERROR',
                errorCode: 'NETWORK',
                message: 'No se recibió respuesta del gateway de pago'
            };
        }
        else {
            return {
                status: 'ERROR',
                errorCode: 'CONFIG',
                message: 'Error de configuración en la solicitud de pago'
            };
        }
    }
}
exports.PaymentService = PaymentService;
PaymentService.API_URL = 'https://fakepayment.onrender.com';
PaymentService.API_KEY = process.env.FAKE_PAYMENT_API_KEY;
