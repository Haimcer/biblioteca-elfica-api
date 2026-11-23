import connection from '../db/index.js';
import fs from 'fs';
import { uploadFile } from '../utils/uploadFileS3.js';
import { Livro } from '../models/livroModel.js';
import { Escritor } from '../models/escritorModel.js';

class LivroController {
  async show(req, res) {
    try {
      const { categoria_id, regiao } = req.query;

      let query = connection('livros')
        .select(
          'livros.*',
          'usuarios.nome_usuario',
          'usuarios.foto',
          'categorias.nome as categoria'
        )
        .leftJoin('usuarios', 'livros.usuario_id', 'usuarios.id')
        .leftJoin('categorias', 'livros.category_id', 'categorias.id');

      if (categoria_id) {
        query = query.where('livros.category_id', categoria_id);
      }
      if (regiao) {
        query = query.where('livros.regiao', regiao);
      }

      const livros = await query.orderBy([
        { column: 'livros.is_premium', order: 'asc' },
        { column: 'livros.id', order: 'desc' }
      ]);

      const livrosComQtd = await Promise.all(
        livros.map(async (livro) => {
          const [{ count: qtd_curtidas }] = await connection('curtidas')
            .where('livro_id', livro.id)
            .count('id');

          const [{ count: qtd_comentarios }] = await connection('comentarios')
            .where('livro_id', livro.id)
            .count('id');
          // Busca o perfil de escritor e traz alguns dados do próprio usuário
          const perfil = await connection('escritores')
            .where('escritores.usuario_id', livro.usuario_id)
            .join('usuarios', 'usuarios.id', 'escritores.usuario_id')
            .select(
              'escritores.*',              // dados do perfil
              'usuarios.nome_usuario',     // nome do usuário
              'usuarios.foto'              // foto do usuário
            )
            .first();

          const livroFormatado = new Livro({
            ...livro,
            author: new Escritor(perfil),
            qtd_curtidas: Number(qtd_curtidas),
            qtd_comentarios: Number(qtd_comentarios),
          });

          delete livroFormatado.nome_usuario;
          delete livroFormatado.foto;
          delete livroFormatado.usuario_id;

          return livroFormatado;
        })
      );

      return res.json(livrosComQtd);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar livros.' });
    }
  }

  async index(req, res) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'ID do livro é obrigatório.' });

      /* ──────────────────────────────────────────────────────────────
         1. Detalhes básicos do livro + autor + categoria
      ─────────────────────────────────────────────────────────────── */
      const livroDB = await connection('livros')
        .where('livros.id', id)
        .leftJoin('usuarios', 'livros.usuario_id', 'usuarios.id')
        .leftJoin('categorias', 'livros.category_id', 'categorias.id')
        .select(
          'livros.*',
          'usuarios.nome_usuario',
          'usuarios.foto',
          'categorias.nome as categoria'
        )
        .first();

      if (!livroDB) return res.status(404).json({ error: 'Livro não encontrado.' });

      /* ──────────────────────────────────────────────────────────────
         2. Autor (perfil de escritor)
      ─────────────────────────────────────────────────────────────── */
      const perfil = await connection('escritores')
        .where('escritores.usuario_id', livroDB.usuario_id)
        .join('usuarios', 'usuarios.id', 'escritores.usuario_id')
        .select(
          'escritores.*',
          'usuarios.nome_usuario',
          'usuarios.foto'
        )
        .first();

      /* ──────────────────────────────────────────────────────────────
         3. Curtidas + quem curtiu
      ─────────────────────────────────────────────────────────────── */
      const [{ count: qtd_curtidas }] = await connection('curtidas')
        .where('livro_id', id)
        .count('id');

      const usuariosCurtem = await connection('curtidas')
        .where('livro_id', id)
        .join('usuarios', 'curtidas.usuario_id', 'usuarios.id')
        .select('usuarios.id', 'usuarios.nome_usuario', 'usuarios.foto')
        .orderBy('usuarios.nome_usuario');

      /* ──────────────────────────────────────────────────────────────
         4. Comentários
      ─────────────────────────────────────────────────────────────── */
      const [{ count: qtd_comentarios }] = await connection('comentarios')
        .where('livro_id', id)
        .count('id');

      const comentarios = await connection('comentarios')
        .where('comentarios.livro_id', id)
        .join('usuarios', 'comentarios.usuario_id', 'usuarios.id')
        .select(
          'comentarios.id',
          'comentarios.mensagem',
          'comentarios.criado_em',
          'usuarios.id as usuario_id',
          'usuarios.nome_usuario',
          'usuarios.foto'
        )
        .orderBy('comentarios.criado_em', 'desc');

      /* ──────────────────────────────────────────────────────────────
         5. Formata e responde
      ─────────────────────────────────────────────────────────────── */
      // 1. Autor resumido  ────────────────────────────────
      const authorResumo = perfil
        ? {
          nome_completo: perfil.nome_completo,
          foto: perfil.foto,
          is_anonimo: perfil.is_anonimo
        }
        : null; // caso não seja escritor

      // 2. Usuário (dono do livro) resumido  ──────────────
      const usuarioResumo = livroDB.is_anonimo
        ? null
        : {
          id: livroDB.usuario_id,
          nome_usuario: livroDB.nome_usuario,
          foto: livroDB.foto
        };

      // 3. Constrói a resposta final  ─────────────────────
      const livro = new Livro({
        ...livroDB,
        author: authorResumo,     // só nome, foto e is_anonimo
        usuario: usuarioResumo,   // novo campo
        qtd_curtidas: Number(qtd_curtidas),
        qtd_comentarios: Number(qtd_comentarios),
        list_curtidas: usuariosCurtem,
        list_comentarios: comentarios
      });

      // Remove campos duplicados que vieram do SELECT
      delete livro.nome_usuario;
      delete livro.foto;
      delete livro.usuario_id;

      return res.json(livro);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao buscar detalhes do livro.' });
    }
  }


  async store(req, res) {
    try {
      const {
        title,
        description,
        category_id,
        is_premium,
        is_free,
        preco,
        regiao,
        idioma
      } = req.body;
      const usuario_id = req.usuario.uid;

      // Busca o perfil de escritor e traz alguns dados do próprio usuário
      const perfil = await connection('escritores')
        .where('escritores.usuario_id', usuario_id)
        .join('usuarios', 'usuarios.id', 'escritores.usuario_id')
        .select(
          'escritores.*',              // dados do perfil
          'usuarios.nome_usuario',     // nome do usuário
          'usuarios.foto'              // foto do usuário
        )
        .first();
      if (!perfil) return res.status(400).json({ error: 'Usuário precisa ser um escritor para realizar essa ação.' });
      if (!title || title.trim() === '') return res.status(400).json({ error: 'Título é obrigatório.' });
      if (!description || description.trim() === '') return res.status(400).json({ error: 'Descrição é obrigatória.' });
      if (!category_id || isNaN(parseInt(category_id))) return res.status(400).json({ error: 'Categoria é obrigatória e deve ser um número válido.' });
      if (!regiao || regiao.trim() === '') return res.status(400).json({ error: 'Região é obrigatória.' });
      if (!idioma || idioma.trim() === '') return res.status(400).json({ error: 'Idioma é obrigatório.' });

      const capaFile = req.files?.capa?.[0];
      const pdfFile = req.files?.pdf?.[0];

      if (!capaFile) return res.status(400).json({ error: 'Arquivo da capa é obrigatório.' });
      if (!pdfFile) return res.status(400).json({ error: 'Arquivo PDF é obrigatório.' });

      const capaUrl = await uploadFile(capaFile.path, capaFile.originalname, 'capas');
      const pdfUrl = await uploadFile(pdfFile.path, pdfFile.originalname, 'livros');

      fs.unlinkSync(capaFile.path);
      fs.unlinkSync(pdfFile.path);

      const free = is_free === undefined || is_free === null ? true : is_free === 'true' || is_free === true;

      if (!free && (!preco || isNaN(parseInt(preco)))) {
        return res.status(400).json({ error: 'Preço é obrigatório para livros pagos.' });
      }



      const [livro] = await connection('livros')
        .insert({
          title: title.trim(),
          description: description.trim(),
          category_id: parseInt(category_id),
          is_premium: is_premium ?? false,
          is_free: free,
          preco: free ? 0 : parseInt(preco),
          usuario_id,
          cover_url: capaUrl,
          download_url: pdfUrl,
          regiao: regiao.trim(),
          idioma: idioma.trim(),
        })
        .returning('*');

      return res.status(201).json(new Livro({ ...livro, author: new Escritor(perfil), }));
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao criar livro.' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        title,
        author,
        description,
        category_id,
        is_premium,
        is_free,
        preco,
        regiao,
        idioma
      } = req.body;
      const usuario_id = req.usuario.uid;

      const livroAtual = await connection('livros').where({ id }).first();
      if (!livroAtual) return res.status(404).json({ error: 'Livro não encontrado.' });

      if (livroAtual.usuario_id !== usuario_id) {
        return res.status(403).json({ error: 'Você não tem permissão para editar este livro.' });
      }

      let cover_url = livroAtual.cover_url;
      let download_url = livroAtual.download_url;

      const novaCapa = req.files?.capa?.[0];
      const novoPdf = req.files?.pdf?.[0];

      if (novaCapa) {
        cover_url = await uploadFile(novaCapa.path, novaCapa.originalname, 'capas');
        fs.unlinkSync(novaCapa.path);
      }

      if (novoPdf) {
        download_url = await uploadFile(novoPdf.path, novoPdf.originalname, 'livros');
        fs.unlinkSync(novoPdf.path);
      }

      const free = is_free === undefined || is_free === null ? livroAtual.is_free : (is_free === 'true' || is_free === true);

      if (!free && (!preco || isNaN(parseInt(preco)))) {
        return res.status(400).json({ error: 'Preço é obrigatório para livros pagos.' });
      }

      const [livro] = await connection('livros')
        .where({ id })
        .update({
          title: title?.trim() ?? livroAtual.title,
          author: author?.trim() ?? livroAtual.author,
          description: description?.trim() ?? livroAtual.description,
          category_id: category_id ? parseInt(category_id) : livroAtual.category_id,
          is_premium: is_premium ?? livroAtual.is_premium,
          is_free: free,
          preco: free ? 0 : parseInt(preco) ?? livroAtual.preco,
          cover_url,
          download_url,
          regiao: regiao?.trim() ?? livroAtual.regiao,
          idioma: idioma?.trim() ?? livroAtual.idioma,
        })
        .returning('*');

      return res.json(new Livro(livro));
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao atualizar livro.' });
    }
  }

  async destroy(req, res) {
    try {
      const { id } = req.params;
      const usuario_id = req.usuario.uid;

      const livro = await connection('livros').where({ id }).first();
      if (!livro) return res.status(404).json({ error: 'Livro não encontrado.' });

      if (livro.usuario_id !== usuario_id) {
        return res.status(403).json({ error: 'Você não tem permissão para deletar este livro.' });
      }

      await connection('livros').where({ id }).del();
      return res.status(204).json({ message: 'Livro excluído com sucesso.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao deletar livro.' });
    }
  }
}

export default new LivroController();
