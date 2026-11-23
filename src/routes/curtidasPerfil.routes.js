import { Router } from 'express';
import CurtidaPerfilController from '../controllers/curtidasPerfil.controller.js';
import { verificarTokenFirebase } from '../middleware/firebaseAuth.js';

const router = Router();

// Todas as rotas precisam do usuário autenticado
router.use(verificarTokenFirebase);

// Alternar curtida (curtir/descurtir)
router.post('/perfil/:perfil_id/:tipo_curtido/toggle', CurtidaPerfilController.toggle);

// Consultar status de curtida (total + se o usuário curtiu)
router.get('/perfil/:perfil_id/:tipo_curtido/status', CurtidaPerfilController.status);

// Listar usuários que curtiram o perfil
router.get('/perfil/:perfil_id/:tipo_curtido/listar', CurtidaPerfilController.listarUsuarios);

// Remover curtida
router.delete('/perfil/:perfil_id/:tipo_curtido/remover', CurtidaPerfilController.remover);

export default router;
