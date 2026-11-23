import express from 'express';
import CategoriaController from '../controllers/categorias.controller.js';
import { verificarTokenFirebase } from '../middleware/firebaseAuth.js';

const router = express.Router();

// Público
router.get('/', CategoriaController.index);

// Protegido
router.post('/', verificarTokenFirebase, CategoriaController.store);
router.put('/:id', verificarTokenFirebase, CategoriaController.update);
router.delete('/:id', verificarTokenFirebase, CategoriaController.destroy);

export default router;
