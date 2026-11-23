import { Router } from 'express';
import BibliotecaController from '../controllers/biblioteca.controller.js';
import { verificarTokenFirebase } from '../middleware/firebaseAuth.js';

const router = Router();

router.use(verificarTokenFirebase);
// Todas as rotas de biblioteca precisam estar autenticadas
router.post('/:livro_id',BibliotecaController.adicionar); // Adicionar livro à biblioteca
router.get('/',BibliotecaController.listar); // Listar livros da biblioteca
router.delete('/:livro_id',BibliotecaController.remover); // Remover livro da biblioteca

export default router;
