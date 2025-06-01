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
exports.PaymentModel = void 0;
const db_1 = require("../database/db");
class PaymentModel {
    createPayment(paymentData) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield (0, db_1.initializeDB)();
            try {
                if (!this.validatePaymentData(paymentData)) {
                    throw new Error('Invalid payment data');
                }
                const result = yield db.run(`INSERT INTO payments (
                    service, email, card_name, card_number, 
                    exp_month, exp_year, cvv, amount, currency, 
                    ip_address, transaction_id, status, payment_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`, [
                    paymentData.service.substring(0, 50),
                    paymentData.email.substring(0, 100),
                    paymentData.cardName.substring(0, 100),
                    this.maskCardNumber(paymentData.cardNumber),
                    paymentData.expMonth,
                    paymentData.expYear,
                    '***',
                    paymentData.amount,
                    paymentData.currency,
                    paymentData.ipAddress,
                    paymentData.transactionId,
                    paymentData.status
                ]);
                return result.lastID;
            }
            finally {
                yield db.close();
            }
        });
    }
    getAllPayments() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield (0, db_1.initializeDB)();
            try {
                return yield db.all(`
                SELECT 
                    id, service, email, amount, currency,
                    card_name as cardName, 
                    card_number as cardNumber,
                    exp_month as expMonth,
                    exp_year as expYear,
                    status, 
                    strftime('%d/%m/%Y %H:%M', payment_date) as formattedDate,
                    transaction_id as transactionId,
                    ip_address as ipAddress
                FROM payments 
                ORDER BY payment_date DESC
                LIMIT 100
            `);
            }
            finally {
                yield db.close();
            }
        });
    }
    validatePaymentData(data) {
        return !!(data.service &&
            data.email &&
            data.cardName &&
            data.cardNumber &&
            data.amount > 0 &&
            ['APPROVED', 'REJECTED', 'ERROR', 'INSUFFICIENT'].includes(data.status));
    }
    maskCardNumber(cardNumber) {
        const first6 = cardNumber.substring(0, 6);
        const last4 = cardNumber.substring(cardNumber.length - 4);
        return `${first6}******${last4}`;
    }
}
exports.PaymentModel = PaymentModel;
