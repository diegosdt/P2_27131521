"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ContactsController_1 = require("../controllers/ContactsController");
const PaymentControler_1 = require("../controllers/PaymentControler");
const router = express_1.default.Router();
const controllerContacts = new ContactsController_1.ContactsController();
const controllerPayment = new PaymentControler_1.PaymentsController();
router.get('/', (req, res) => {
    res.render('index', { nombre: 'Diego', apellido: 'Duarte', cedula: '27131521', seccion: '4', title: 'Hola mundooo' });
});
router.get('/menu', (req, res) => {
    res.render('menu', { title: 'Menú' });
});
router.get('/informacion', (req, res) => {
    res.render('informacion', { title: 'informacion' });
});
router.get('/contact', (req, res) => {
    res.render('ordenes', {
        title: 'ordenes',
        succes: req.query.succes
    });
});
router.get('/payment', (req, res) => {
    res.render('payment');
});
router.get('/exito', (req, res) => {
    res.render('exito');
});
router.post('/payment/add', controllerPayment.processPayment.bind(controllerPayment));
router.get('/admin/paymentlist', controllerPayment.listPayments.bind(controllerPayment));
router.get('/confirmacion', (req, res) => {
    res.render('confirmacion', { title: 'informacion' });
});
router.post('/contact/add', controllerContacts.add.bind(controllerContacts));
router.get('/admin/contactlist', controllerContacts.list.bind(controllerContacts));
router.get('/index', (req, res) => {
    res.render('index', { title: 'inicio' });
});
exports.default = router;
