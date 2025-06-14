import express, { Request, Response } from 'express';
import { ContactsController } from '../controllers/ContactsController';
import { PaymentsController } from '../controllers/PaymentControler';
import { UserController } from '../controllers/UserController'; // Cambia UserController por AuthController

const router = express.Router();
const controllerContacts = new ContactsController();
const controllerPayment = new PaymentsController();

router.get('/', (req: Request, res: Response) => {
  res.render('index', { nombre: 'Diego', apellido: 'Duarte', cedula:'27131521',seccion:'4',title:'Hola mundooo' });
});

router.get('/menu', (req: Request, res: Response) => {
  res.render('menu', { title: 'Menú' });
});

router.get('/informacion', (req: Request, res: Response) => {
  res.render('informacion', { title: 'informacion' });
});

router.get('/contact', (req: Request, res: Response) => {
  res.render('ordenes', { 
    title: 'ordenes', 
    succes: req.query.succes
  });
});

router.get('/payment', (req:Request, res:Response) => {
  res.render('payment');
});

router.get('/error', (req:Request, res:Response) => {
  res.render('error');
});

router.get('/exito', (req:Request, res:Response) => {
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

router.get('/confirmacion', (req: Request, res: Response) => {
  res.render('confirmacion', { title: 'informacion' });
});

router.get('/negacion', (req: Request, res: Response) => {
  res.render('negacion', { title: 'informacion' });
});

router.post('/contact/add', controllerContacts.add.bind(controllerContacts));

router.get('/admin/contactlist', controllerContacts.list.bind(controllerContacts));

router.post('/register', UserController.register);
router.post('/login', UserController.login);


router.get('/index', (req:Request, res:Response) => {
  res.render('index', { title: 'inicio' });

});

export default router;
