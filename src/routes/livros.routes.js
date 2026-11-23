import express from 'express';
import LivroController from '../controllers/livros.controller.js';
import { verificarTokenFirebase } from '../middleware/firebaseAuth.js';
import upload from '../middleware/uploadMidleware.js';

const router = express.Router();

// Listagem pública com suporte a query ?categoria_id=1
router.get('/:id', LivroController.index);
router.get('/:id/:id_regiao', LivroController.show);

// CRUD protegido + upload de capa e PDF
router.post(
  '/',
  verificarTokenFirebase,
  upload,
  LivroController.store
);

router.put(
  '/:id',
  verificarTokenFirebase,
  upload,
  LivroController.update
);

router.delete('/:id', verificarTokenFirebase, LivroController.destroy);

export default router;
