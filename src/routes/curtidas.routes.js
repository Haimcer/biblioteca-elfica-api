import express from 'express';
import { verificarTokenFirebase } from '../middleware/firebaseAuth.js';
import CurtidaController from '../controllers/curtidas.controller.js';

const router = express.Router();

router.post('/:livro_id', verificarTokenFirebase, CurtidaController.toggle);
router.get('/:livro_id', verificarTokenFirebase, CurtidaController.status);
router.get('/usuarios/:livro_id', verificarTokenFirebase, CurtidaController.listarUsuarios);
router.delete('/:livro_id', verificarTokenFirebase, CurtidaController.remover);

export default router;
