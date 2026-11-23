import connection from '../db/index.js';
import { Livro } from '../models/livroModel.js';

class BibliotecaController {
  // Adiciona um livro à biblioteca do usuário
  async adicionar(req, res) {
    try {
      const usuario_id = req.usuario.uid;
      const { livro_id } = req.body;

      if (!livro_id) {
        return res.status(400).json({ error: 'ID do livro é obrigatório.' });
      }

      const jaExiste = await connection('biblioteca')
        .where({ usuario_id, livro_id })
        .first();

      if (jaExiste) {
        return res.status(400).json({ error: 'Livro já está na biblioteca.' });
      }

      await connection('biblioteca').insert({ usuario_id, livro_id });

      return res.status(201).json({ message: 'Livro adicionado à biblioteca.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao adicionar livro na biblioteca.' });
    }
  }

  // Lista todos os livros da biblioteca do usuário
  async listar(req, res) {
    try {
      const usuario_id = req.usuario.uid;

      const livros = await connection('biblioteca')
        .where('biblioteca.usuario_id', usuario_id)
        .join('livros', 'biblioteca.livro_id', 'livros.id')
        .leftJoin('usuarios', 'livros.usuario_id', 'usuarios.id')
        .leftJoin('categorias', 'livros.category_id', 'categorias.id')
        .select(
          'livros.*',
          'usuarios.nome_usuario',
          'usuarios.foto',
          'categorias.nome as categoria'
        );

      const livrosComDados = await Promise.all(
        livros.map(async (livro) => {
          const [{ count: qtd_curtidas }] = await connection('curtidas')
            .where('livro_id', livro.id)
            .count('id');

          const [{ count: qtd_comentarios }] = await connection('comentarios')
            .where('livro_id', livro.id)
            .count('id');

          const livroFormatado = new Livro({
            ...livro,
            author: {
              nome_usuario: livro.nome_usuario,
              foto: livro.foto,
              id: livro.usuario_id,
            },
            qtd_curtidas: Number(qtd_curtidas),
            qtd_comentarios: Number(qtd_comentarios),
          });

          delete livroFormatado.nome_usuario;
          delete livroFormatado.foto;
          delete livroFormatado.usuario_id;

          return livroFormatado;
        })
      );

      return res.json(livrosComDados);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar biblioteca.' });
    }
  }

  // Remove um livro da biblioteca
  async remover(req, res) {
    try {
      const usuario_id = req.usuario.uid;
      const { livro_id } = req.params;

      const deletado = await connection('biblioteca')
        .where({ usuario_id, livro_id })
        .del();

      if (!deletado) {
        return res.status(404).json({ error: 'Livro não encontrado na biblioteca.' });
      }

      return res.status(204).json({ message: 'Livro removido com sucesso.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao remover livro da biblioteca.' });
    }
  }
}

export default new BibliotecaController();
