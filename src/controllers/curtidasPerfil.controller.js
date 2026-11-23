import connection from '../db/index.js';
import { CurtidaPerfil } from '../models/curtidaPerfilModel.js';

class CurtidaPerfilController {
  async toggle(req, res) {
    try {
      const { perfil_id, tipo_curtido } = req.params;
      const usuario_id = req.usuario.uid;

      if (!perfil_id || !tipo_curtido) {
        return res.status(400).json({ error: 'ID do perfil e tipo são obrigatórios.' });
      }

      if (!['usuario', 'escritor'].includes(tipo_curtido)) {
        return res.status(400).json({ error: 'Tipo de curtido inválido.' });
      }

      const existe = await connection('curtidas_perfis')
        .where({
          usuario_id,
          curtido_id: perfil_id,
          tipo_curtido
        })
        .first();

      if (existe) {
        await connection('curtidas_perfis')
          .where({
            usuario_id,
            curtido_id: perfil_id,
            tipo_curtido
          })
          .del();
        return res.json({ message: 'Curtida removida com sucesso.' });
      } else {
        await connection('curtidas_perfis').insert({
          usuario_id,
          curtido_id: perfil_id,
          tipo_curtido
        });
        return res.json({ message: 'Perfil curtido com sucesso.' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao alternar curtida de perfil.' });
    }
  }

  async status(req, res) {
    try {
      const { perfil_id, tipo_curtido } = req.params;
      const usuario_id = req.usuario.uid;

      if (!perfil_id || !tipo_curtido) {
        return res.status(400).json({ error: 'ID do perfil e tipo são obrigatórios.' });
      }

      const total = await connection('curtidas_perfis')
        .where({ curtido_id: perfil_id, tipo_curtido })
        .count('* as total')
        .first();

      const curtiu = await connection('curtidas_perfis')
        .where({ usuario_id, curtido_id: perfil_id, tipo_curtido })
        .first();

      return res.json({
        total: parseInt(total.total),
        curtiu: !!curtiu
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao consultar status de curtida.' });
    }
  }

  async listarUsuarios(req, res) {
    try {
      const { perfil_id, tipo_curtido } = req.params;

      if (!perfil_id || !tipo_curtido) {
        return res.status(400).json({ error: 'ID do perfil e tipo são obrigatórios.' });
      }

      const usuarios = await connection('curtidas_perfis')
        .where({ curtido_id: perfil_id, tipo_curtido })
        .join('usuarios', 'curtidas_perfis.usuario_id', 'usuarios.id')
        .select('usuarios.id', 'usuarios.nome_usuario', 'usuarios.foto')
        .orderBy('usuarios.nome_usuario');

      return res.json(
        usuarios.map(u => new CurtidaPerfil({
          ...u,
          curtido_id: perfil_id,
          tipo_curtido: tipo_curtido,
        }))
      );
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar curtidas de perfil.' });
    }
  }

  async remover(req, res) {
    try {
      const { perfil_id, tipo_curtido } = req.params;
      const usuario_id = req.usuario.uid;

      if (!perfil_id || !tipo_curtido) {
        return res.status(400).json({ error: 'ID do perfil e tipo são obrigatórios.' });
      }

      const deletado = await connection('curtidas_perfis')
        .where({ usuario_id, curtido_id: perfil_id, tipo_curtido })
        .del();

      if (!deletado) {
        return res.status(404).json({ error: 'Curtida de perfil não encontrada.' });
      }

      return res.status(204).json({ message: 'Curtida removida com sucesso.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao remover curtida de perfil.' });
    }
  }
}

export default new CurtidaPerfilController();
