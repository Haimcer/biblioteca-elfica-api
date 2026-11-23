// src/controllers/curtidas.controller.js
import connection from '../db/index.js';
import { Curtida } from '../models/curtidaModel.js'; // opcional

class CurtidasController {
  /* ------------------------------------------------------------------ */
  // 1. Alternar curtir / descurtir  (POST /curtidas/:livro_id)
  /* ------------------------------------------------------------------ */
  async toggle(req, res) {
    try {
      const { livro_id } = req.params;
      const usuario_id   = req.usuario.uid;

      if (!livro_id) {
        return res.status(400).json({ error: 'ID do livro é obrigatório.' });
      }

      const existe = await connection('curtidas')
        .where({ usuario_id, livro_id })
        .first();

      if (existe) {
        await connection('curtidas').where({ usuario_id, livro_id }).del();
        return res.json({ message: 'Curtida removida.' });
      } else {
        await connection('curtidas').insert({ usuario_id, livro_id });
        return res.json({ message: 'Livro curtido!' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao alternar curtida.' });
    }
  }

  /* ------------------------------------------------------------------ */
  // 2. Status  (GET /curtidas/:livro_id)
  /* ------------------------------------------------------------------ */
  async status(req, res) {
    try {
      const { livro_id } = req.params;
      const usuario_id   = req.usuario.uid;

      if (!livro_id) {
        return res.status(400).json({ error: 'ID do livro é obrigatório.' });
      }

      // total de curtidas
      const [{ count }] = await connection('curtidas')
        .where({ livro_id })
        .count('*');

      // se o usuário logado curtiu
      const curtiu = await connection('curtidas')
        .where({ usuario_id, livro_id })
        .first();

      return res.json({
        total: Number(count),
        curtiu: !!curtiu
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao buscar status da curtida.' });
    }
  }

  /* ------------------------------------------------------------------ */
  // 3. Listar quem curtiu  (GET /curtidas/usuarios/:livro_id)
  /* ------------------------------------------------------------------ */
  async listarUsuarios(req, res) {
    try {
      const { livro_id } = req.params;

      if (!livro_id) {
        return res.status(400).json({ error: 'ID do livro é obrigatório.' });
      }

      const usuarios = await connection('curtidas')
        .where({ livro_id })
        .join('usuarios', 'curtidas.usuario_id', 'usuarios.id')
        .select('usuarios.id', 'usuarios.nome_usuario', 'usuarios.foto')
        .orderBy('usuarios.nome_usuario');

      // se quiser usar model:
      // return res.json(usuarios.map(u => new Curtida({ ...u, livro_id })));
      return res.json(usuarios);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar usuários que curtiram.' });
    }
  }

  /* ------------------------------------------------------------------ */
  // 4. Remover curtida explicitamente  (DELETE /curtidas/:livro_id)
  /* ------------------------------------------------------------------ */
  async remover(req, res) {
    try {
      const { livro_id } = req.params;
      const usuario_id   = req.usuario.uid;

      if (!livro_id) {
        return res.status(400).json({ error: 'ID do livro é obrigatório.' });
      }

      const deletado = await connection('curtidas')
        .where({ usuario_id, livro_id })
        .del();

      if (!deletado) {
        return res.status(404).json({ error: 'Curtida não encontrada.' });
      }

      return res.status(204).json({ message: 'Curtida removida com sucesso.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao remover curtida.' });
    }
  }
}

export default new CurtidasController();
