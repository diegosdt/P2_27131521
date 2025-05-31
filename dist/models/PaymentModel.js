"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentModel = void 0;
const db_1 = require("../database/db");
class PaymentModel {
    async createPayment(paymentData) {
        const db = await (0, db_1.initializeDB)();
        try {
            if (!this.validatePaymentData(paymentData)) {
                throw new Error('Invalid payment data');
            }
            const result = await db.run(`INSERT INTO payments (
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
            await db.close();
        }
    }
    async getAllPayments() {
        const db = await (0, db_1.initializeDB)();
        try {
            return await db.all(`
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
            await db.close();
        }
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
