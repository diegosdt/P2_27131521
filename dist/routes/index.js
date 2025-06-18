"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ContactsController_1 = require("../controllers/ContactsController");
const PaymentControler_1 = require("../controllers/PaymentControler");
const UserController_1 = require("../controllers/UserController"); // Cambia UserController por AuthController
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const router = express_1.default.Router();
const controllerContacts = new ContactsController_1.ContactsController();
const controllerPayment = new PaymentControler_1.PaymentsController();
// Configuración de sesión
router.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'tu_secreto_seguro',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));
// Inicializa Passport
UserController_1.UserController.initializePassport();
router.use(passport_1.default.initialize());
router.use(passport_1.default.session());
// Rutas de autenticación
router.get('/auth/google', UserController_1.UserController.googleAuth);
router.get('/auth/google/callback', UserController_1.UserController.googleAuthCallback);
router.get('/', (req, res) => {
    res.render('index', { title: 'NutriBite - Talleres de cocina saludable',
        description: 'Aprende a preparar comidas nutritivas y deliciosas en nuestros talleres presenciales',
        ogTitle: 'Talleres de cocina saludable | NutriBite',
        ogDescription: 'Únete a nuestros talleres y transforma tu manera de comer',
        ogImage: 'https://tusitio.com/images/og-talleres.jpg',
        ogUrl: 'https://tusitio.com',
        originalUrl: req.originalUrl });
});
router.get('/menu', (req, res) => {
    res.render('menu', { title: 'Menú' });
});
router.get('/admin', (req, res) => {
    res.render('admin', { title: 'admin' });
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
router.get('/error', (req, res) => {
    res.render('error');
});
router.get('/exito', (req, res) => {
    res.render('exito');
});
router.get('/registrado', (req, res) => {
    res.render('registrado', { error: null });
});
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});
router.get('/register', (req, res) => {
    res.render('register', { error: null });
});
router.post('/payment/add', controllerPayment.processPayment.bind(controllerPayment));
router.get('/admin/paymentlist', controllerPayment.listPayments.bind(controllerPayment));
router.get('/confirmacion', (req, res) => {
    res.render('confirmacion', { title: 'informacion' });
});
router.get('/negacion', (req, res) => {
    res.render('negacion', { title: 'informacion' });
});
router.post('/contact/add', controllerContacts.add.bind(controllerContacts));
router.get('/admin/contactlist', controllerContacts.list.bind(controllerContacts));
router.post('/register', UserController_1.UserController.register);
router.post('/login', UserController_1.UserController.login);
router.get('/index', (req, res) => {
    res.render('index', { title: 'inicio' });
});
exports.default = router;
