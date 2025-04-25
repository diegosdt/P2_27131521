import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.render('index', { nombre: 'Diego', apellido: 'Duarte', cedula:'27131521',seccion:'4',title:'Hola mundooo' });
});

router.get('/menu', (req: Request, res: Response) => {
  res.render('menu', { title: 'Menú' });
});

router.get('/informacion', (req: Request, res: Response) => {
  res.render('informacion', { title: 'informacion' });
});

router.get('/ordenes', (req: Request, res: Response) => {
  res.render('ordenes', { title: 'ordenes' });
});

router.get('/index', (req, res) => {
  res.render('index', { title: 'inicio' });
});

export default router;
