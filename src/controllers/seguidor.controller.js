import connection from '../db/index.js';
import { Seguidor } from '../models/seguidoresModel.js';

class SeguidorController {
  // Alterna seguir ⇆ deixar de seguir
  async toggle(req, res) {
    try {
      const { perfil_id }   = req.params;          // quem será seguido
      const { tipo }        = req.params;     // 'usuario' | 'escritor'  (pode vir na query)
      const usuario_id      = req.usuario.uid;

      // validações básicas
      if (!perfil_id || !tipo) {
        return res.status(400).json({ error: 'ID do perfil e tipo são obrigatórios.' });
      }
      if (!['usuario', 'escritor'].includes(tipo)) {
        return res.status(400).json({ error: 'Tipo inválido.' });
      }
      if (perfil_id === usuario_id) {
        return res.status(400).json({ error: 'Você não pode seguir a si mesmo.' });
      }

      const existe = await connection('seguidores')
        .where({ usuario_id, seguindo_id: perfil_id, tipo })
        .first();

      if (existe) {
        // já segue → deixar de seguir
        await connection('seguidores')
          .where({ usuario_id, seguindo_id: perfil_id, tipo })
          .del();
        return res.json({ message: 'Deixou de seguir.' });
      } else {
        // seguir
        await connection('seguidores').insert({
          usuario_id,
          seguindo_id: perfil_id,
          tipo
        });
        return res.json({ message: 'Agora está seguindo.' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao alternar seguir.' });
    }
  }

  // Status: total de seguidores + se o usuário logado segue
  async status(req, res) {
    try {
      const { perfil_id } = req.params;
      const { tipo }      = req.query || {};
      const usuario_id    = req.usuario.uid;

      if (!perfil_id || !tipo) {
        return res.status(400).json({ error: 'ID do perfil e tipo são obrigatórios.' });
      }

      const [{ count }] = await connection('seguidores')
        .where({ seguindo_id: perfil_id, tipo })
        .count('*');

      const segue = await connection('seguidores')
        .where({ usuario_id, seguindo_id: perfil_id, tipo })
        .first();

      return res.json({
        total: Number(count),
        segue: !!segue
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao obter status de seguidores.' });
    }
  }

  // Lista de usuários que seguem o perfil
  async listarUsuarios(req, res) {
    try {
      const { perfil_id } = req.params;
      const { tipo }      = req.query || {};

      if (!perfil_id || !tipo) {
        return res.status(400).json({ error: 'ID do perfil e tipo são obrigatórios.' });
      }

      const usuarios = await connection('seguidores')
        .where({ seguindo_id: perfil_id, tipo })
        .join('usuarios', 'seguidores.usuario_id', 'usuarios.id')
        .select('usuarios.id', 'usuarios.nome_usuario', 'usuarios.foto')
        .orderBy('usuarios.nome_usuario');

      return res.json(
        usuarios.map(u => new Seguidor({
          ...u,
          seguindo_id: perfil_id,
          tipo
        }))
      );
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar seguidores.' });
    }
  }

  // Remover (deixar de seguir) explicitamente
  async remover(req, res) {
    try {
      const { perfil_id } = req.params;
      const { tipo }      = req.query || {};
      const usuario_id    = req.usuario.uid;

      if (!perfil_id || !tipo) {
        return res.status(400).json({ error: 'ID do perfil e tipo são obrigatórios.' });
      }

      const deletado = await connection('seguidores')
        .where({ usuario_id, seguindo_id: perfil_id, tipo })
        .del();

      if (!deletado) {
        return res.status(404).json({ error: 'Você não segue esse perfil.' });
      }

      return res.status(204).json({ message: 'Deixou de seguir.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao deixar de seguir.' });
    }
  }
}

export default new SeguidorController();
