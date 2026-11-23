import connection from '../db/index.js';
import { Usuario } from '../models/UsuarioModel.js';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

class UsuarioController {
  async storeOrFetch(req, res) {
    try {
      const { uid, email, picture } = req.usuario;

      if (!uid || !email) {
        return res.status(400).json({ error: 'UID e Email são obrigatórios.' });
      }

      let usuario = await connection('usuarios').where({ id: uid }).first();

      if (!usuario) {
        // Gerar nome de usuário único
        let nome_usuario;
        let tentativa = 0;
        let encontrado = true;

        do {
          tentativa++;
          const tentativaNome = `${uniqueNamesGenerator({
            dictionaries: [adjectives, animals],
            separator: '_',
            style: 'lowerCase'
          })}_${Math.floor(Math.random() * 1000)}`;

          const existente = await connection('usuarios').where({ nome_usuario: tentativaNome }).first();
          if (!existente) {
            nome_usuario = tentativaNome;
            encontrado = false;
          }
        } while (encontrado && tentativa < 10);

        if (!nome_usuario) {
          return res.status(500).json({ error: 'Falha ao gerar nome de usuário único.' });
        }

        const letras = '0123456789ABCDEF';
        let backgroundColor = '';
        for (let i = 0; i < 6; i++) {
          backgroundColor += letras[Math.floor(Math.random() * 16)];
        }

        const fotoFinal = picture && picture.trim() !== ''
          ? picture
          : `https://ui-avatars.com/api/?name=${nome_usuario}&background=${backgroundColor}&color=FFFFFF`;

        const [novo] = await connection('usuarios')
          .insert({
            id: uid,
            nome_usuario,
            email,
            foto: fotoFinal
          })
          .returning('*');

        usuario = novo;
      }

      // Busca o perfil de escritor e traz alguns dados do próprio usuário
      const perfil = await connection('escritores')
        .where('escritores.usuario_id', uid)
        .join('usuarios', 'usuarios.id', 'escritores.usuario_id')
        .select(
          'escritores.*',              // dados do perfil
          'usuarios.nome_usuario',     // nome do usuário
          'usuarios.foto'              // foto do usuário
        )
        .first();


      return res.json(new Usuario({ ...usuario, perfil_escritor: perfil }));
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno ao buscar ou criar usuário.' });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'ID do usuário é obrigatório.' });

      const usuario = await connection('usuarios').where({ id }).first();
      if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado.' });

      // Seguidores (quem segue ESTE usuário)
      const seguidores = await connection('seguidores')
        .where({ seguindo_id: id, tipo: 'usuario' })
        .join('usuarios', 'seguidores.usuario_id', 'usuarios.id')
        .select('usuarios.id', 'usuarios.nome_usuario', 'usuarios.foto');

      // Seguindo (quem ESTE usuário segue)
      const seguindo = await connection('seguidores')
        .where({ usuario_id: id, tipo: 'usuario' })
        .join('usuarios', 'seguidores.seguindo_id', 'usuarios.id')
        .select('usuarios.id', 'usuarios.nome_usuario', 'usuarios.foto');

      // Curtidores do perfil
      const curtidores = await connection('curtidas_perfis')
        .where({ curtido_id: id, tipo_curtido: 'usuario' })
        .join('usuarios', 'curtidas_perfis.usuario_id', 'usuarios.id')
        .select('usuarios.id', 'usuarios.nome_usuario', 'usuarios.foto');

      // 1) busca os livros que o usuário curtiu
      const livrosCurtidosRaw = await connection('curtidas')
        .where('curtidas.usuario_id', id)
        .join('livros', 'curtidas.livro_id', 'livros.id')
        .leftJoin('categorias', 'livros.category_id', 'categorias.id')
        .select(
          'livros.*',
          'categorias.nome as categoria'
        );

      // 2) para cada livro, conta curtidas e comentários
      const livrosCurtidos = await Promise.all(
        livrosCurtidosRaw.map(async livro => {
          const [{ count: qtd_curtidas }] = await connection('curtidas')
            .where('livro_id', livro.id)
            .count('*');

          const [{ count: qtd_comentarios }] = await connection('comentarios')
            .where('livro_id', livro.id)
            .count('*');

          const perfil = await connection('escritores')
            .where('escritores.usuario_id', livro.usuario_id)
            .join('usuarios', 'usuarios.id', 'escritores.usuario_id')
            .select(
              'escritores.*',
              'usuarios.nome_usuario',
              'usuarios.foto'
            )
            .first();

          const authorResumo = perfil
            ? {
              nome_completo: perfil.nome_completo,
              foto: perfil.foto,
              is_anonimo: perfil.is_anonimo
            }
            : null; // caso não seja escritor

          return {
            ...livro,
            author: authorResumo,
            qtd_curtidas: Number(qtd_curtidas),
            qtd_comentarios: Number(qtd_comentarios)
          };
        })
      );

      // Perfil de escritor (caso exista)
      const perfil = await connection('escritores')
        .where('escritores.usuario_id', id)
        .join('usuarios', 'usuarios.id', 'escritores.usuario_id')
        .select(
          'escritores.*',
          'usuarios.nome_usuario',
          'usuarios.foto'
        )
        .first();

      return res.json(
        new Usuario({
          ...usuario,
          seguidores: seguidores ?? [],
          seguindo: seguindo ?? [],
          curtidores: curtidores ?? [],
          perfil_escritor: perfil,
          livros_curtidos: livrosCurtidos ?? [],
        })
      );
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno ao buscar detalhes do usuário.' });
    }
  }



  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome_usuario, foto, bio, site_pessoal } = req.body;

      if (!id) return res.status(400).json({ error: 'ID do usuário é obrigatório.' });

      const usuario = await connection('usuarios').where({ id }).first();
      if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado.' });

      // Validações extras
      if (nome_usuario !== undefined && nome_usuario.trim() === '') {
        return res.status(400).json({ error: 'Nome de usuário não pode ser vazio.' });
      }
      if (foto !== undefined && foto.trim() === '') {
        return res.status(400).json({ error: 'Foto não pode ser vazia.' });
      }
      if (bio !== undefined && bio.trim() === '') {
        return res.status(400).json({ error: 'Bio não pode ser vazia.' });
      }
      if (site_pessoal !== undefined && site_pessoal.trim() === '') {
        return res.status(400).json({ error: 'Site pessoal não pode ser vazio.' });
      }

      // Verificar duplicação de nome_usuario se for alterar
      if (nome_usuario && nome_usuario !== usuario.nome_usuario) {
        const existe = await connection('usuarios').where({ nome_usuario }).first();
        if (existe) return res.status(400).json({ error: 'Nome de usuário já está em uso.' });
      }

      const [atualizado] = await connection('usuarios')
        .where({ id })
        .update({
          nome_usuario: nome_usuario ?? usuario.nome_usuario,
          foto: foto ?? usuario.foto,
          bio: bio ?? usuario.bio,
          site_pessoal: site_pessoal ?? usuario.site_pessoal
        })
        .returning('*');

      return res.json(new Usuario(atualizado));
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno ao atualizar usuário.' });
    }
  }

  async destroy(req, res) {
    try {
      const { id } = req.params;

      if (!id) return res.status(400).json({ error: 'ID do usuário é obrigatório.' });

      if (req.usuario.uid !== id) {
        return res.status(403).json({ error: 'Você só pode excluir sua própria conta.' });
      }

      const deletado = await connection('usuarios').where({ id }).del();
      if (!deletado) return res.status(404).json({ error: 'Usuário não encontrado.' });

      return res.status(204).json({ message: 'Usuário excluído com sucesso.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno ao excluir usuário.' });
    }
  }

  async verificarDisponibilidade(req, res) {
    try {
      const { nome } = req.query;

      if (!nome || nome.trim() === '') {
        return res.status(400).json({ error: 'Nome de usuário é obrigatório.' });
      }

      const existente = await connection('usuarios').where({ nome_usuario: nome }).first();

      return res.json({ disponivel: !existente });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno ao verificar nome de usuário.' });
    }
  }

  async listagemPublica(req, res) {
    try {
      const usuarios = await connection('usuarios')
        .select('id', 'nome_usuario', 'foto')
        .orderBy('nome_usuario');

      return res.json(usuarios);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno ao listar usuários públicos.' });
    }
  }

}

export default new UsuarioController();
