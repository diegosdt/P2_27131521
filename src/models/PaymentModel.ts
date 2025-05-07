import { initializeDB } from '../database/db';

export class PaymentModel {
    async createPayment(paymentData: {
        service: string;
        email: string;
        cardName: string;
        cardNumber: string;
        expMonth: number;
        expYear: number;
        cvv: string;
        amount: number;
        currency: string;
        ipAddress: string;
    }) {
        const db = await initializeDB();
        try {
            const result = await db.run(
                `INSERT INTO payments (
                    service, email, card_name, card_number, 
                    exp_month, exp_year, cvv, amount, currency, ip_address
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    paymentData.service,
                    paymentData.email,
                    paymentData.cardName,
                    paymentData.cardNumber,
                    paymentData.expMonth,
                    paymentData.expYear,
                    paymentData.cvv,
                    paymentData.amount,
                    paymentData.currency,
                    paymentData.ipAddress
                ]
            );
            return result.lastID;
        } finally {
            await db.close();
        }
    }

    async getAllPayments() {
        const db = await initializeDB();
        try {
            return await db.all(`
                SELECT * FROM payments 
                ORDER BY payment_date DESC
            `);
        } finally {
            await db.close();
        }
    }
}