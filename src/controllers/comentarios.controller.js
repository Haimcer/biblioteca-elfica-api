import connection from '../db/index.js';
import { Comentario } from '../models/comentarioModel.js';

class ComentarioController {
  async index(req, res) {
    const { livro_id } = req.params;

    if (!livro_id) return res.status(400).json({ error: 'ID do livro é obrigatório.' });

    const comentarios = await connection('comentarios')
      .where({ livro_id })
      .join('usuarios', 'comentarios.usuario_id', 'usuarios.id')
      .select(
        'comentarios.id',
        'comentarios.usuario_id',
        'comentarios.livro_id',
        'comentarios.mensagem',
        'comentarios.criado_em',
        'usuarios.nome_usuario',
        'usuarios.foto'
      )
      .orderBy('comentarios.criado_em', 'asc');

    return res.json(comentarios.map(c => new Comentario(c)));
  }

  async store(req, res) {
    const { livro_id } = req.params;
    const { mensagem } = req.body;
    const usuario_id = req.usuario.uid;

    if (!livro_id) return res.status(400).json({ error: 'ID do livro é obrigatório.' });
    if (!mensagem) return res.status(400).json({ error: 'Mensagem é obrigatória.' });

    const [comentario] = await connection('comentarios')
      .insert({ usuario_id, livro_id, mensagem })
      .returning('*');

    return res.status(201).json(new Comentario(comentario));
  }

  async update(req, res) {
    const { id } = req.params;
    const { mensagem } = req.body;
    const usuario_id = req.usuario.uid;

    if (!mensagem) return res.status(400).json({ error: 'Mensagem é obrigatória.' });

    const comentario = await connection('comentarios').where({ id }).first();
    if (!comentario) return res.status(404).json({ error: 'Comentário não encontrado.' });

    if (comentario.usuario_id !== usuario_id) {
      return res.status(403).json({ error: 'Você não pode editar este comentário.' });
    }

    const [atualizado] = await connection('comentarios')
      .where({ id })
      .update({ mensagem })
      .returning('*');

    return res.json(new Comentario(atualizado));
  }

  async destroy(req, res) {
    const { id } = req.params;
    const usuario_id = req.usuario.uid;

    const comentario = await connection('comentarios').where({ id }).first();
    if (!comentario) return res.status(404).json({ error: 'Comentário não encontrado.' });

    if (comentario.usuario_id !== usuario_id) {
      return res.status(403).json({ error: 'Você não pode excluir este comentário.' });
    }

    await connection('comentarios').where({ id }).del();
    return res.status(204).json({ message: 'Comentário removido com sucesso.' });
  }
}

export default new ComentarioController();