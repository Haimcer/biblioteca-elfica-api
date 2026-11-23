import express from 'express';
import ComentarioController from '../controllers/comentarios.controller.js';
import { verificarTokenFirebase } from '../middleware/firebaseAuth.js';

const router = express.Router();

// Listar todos os comentários de um livro
router.get('/:livro_id', ComentarioController.index);

// protegido
router.post('/:livro_id', verificarTokenFirebase, ComentarioController.store);
router.put('/:id', verificarTokenFirebase, ComentarioController.update);
router.delete('/:id', verificarTokenFirebase, ComentarioController.destroy);

export default router;
