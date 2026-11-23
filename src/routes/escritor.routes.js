import { Router } from 'express';
import EscritorController from '../controllers/escritor.controller.js';
import { verificarTokenFirebase } from '../middleware/firebaseAuth.js';

const router = Router();
// Criar perfil de escritor
router.post('/', verificarTokenFirebase, (req, res) => EscritorController.store(req, res));

// Atualizar perfil de escritor
router.put('/', verificarTokenFirebase, (req, res) => EscritorController.update(req, res));

// Remover perfil de escritor
router.delete('/', verificarTokenFirebase, (req, res) => EscritorController.destroy(req, res));

// Buscar perfil de escritor pelo ID do escritor (não precisa login)
router.get('/:id', (req, res) => EscritorController.index(req, res));

// Buscar perfil de escritor pelo ID do usuário (não precisa login)
router.get('/usuario/:usuario_id', (req, res) => EscritorController.showByUsuarioId(req, res));

// Listar todos os escritores (não precisa login)
router.get('/', (req, res) => EscritorController.show(req, res));

export default router;
