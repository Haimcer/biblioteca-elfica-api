import express from 'express';
import UsuarioController from '../controllers/usuarios.controller.js';
import { verificarTokenFirebase } from '../middleware/firebaseAuth.js';

const router = express.Router();

// Cria ou retorna usuário autenticado
router.post('/me', verificarTokenFirebase, UsuarioController.storeOrFetch);

// get livre
router.get('/usuarios-publico', UsuarioController.listagemPublica);
router.get('/disponivel', UsuarioController.verificarDisponibilidade);
router.get('/:id', UsuarioController.show);

// Protegido
router.put('/:id', verificarTokenFirebase, UsuarioController.update);
router.delete('/:id', verificarTokenFirebase, UsuarioController.destroy);

export default router;
