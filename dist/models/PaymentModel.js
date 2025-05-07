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
                const result = yield db.run(`INSERT INTO payments (
                    service, email, card_name, card_number, 
                    exp_month, exp_year, cvv, amount, currency, ip_address
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
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
                SELECT * FROM payments 
                ORDER BY payment_date DESC
            `);
            }
            finally {
                yield db.close();
            }
        });
    }
}
exports.PaymentModel = PaymentModel;
