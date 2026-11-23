// curtidaPerfil.route.js
import { Router } from 'express';
import SeguidorController from '../controllers/seguidor.controller.js';
import { verificarTokenFirebase } from '../middleware/firebaseAuth.js';

const router = Router();
router.use(verificarTokenFirebase);

router.post('/perfil/:perfil_id/:tipo/seguir', SeguidorController.toggle);
router.get ('/perfil/:perfil_id/seguir/status', SeguidorController.status);
router.get ('/perfil/:perfil_id/seguidores-usuario', SeguidorController.listarUsuarios);
router.delete('/perfil/:perfil_id/seguir', SeguidorController.remover);

export default router;
