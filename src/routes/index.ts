import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.render('index', { nombre: 'Diego', apellido: 'Duarte', cedula:'27131521',seccion:'4',title:'Hola mundooo' });
});

export default router;
