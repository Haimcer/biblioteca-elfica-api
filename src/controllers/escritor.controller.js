import connection from '../db/index.js';
import { Escritor } from '../models/escritorModel.js';
import { Livro } from '../models/livroModel.js';

class EscritorController {
    async store(req, res) {
        try {
            const { uid } = req.usuario;
            const {
                nome_completo,
                data_nascimento,
                cpf,
                telefone,
                endereco_linha1,
                endereco_linha2,
                cidade,
                estado,
                cep,
                pais,
                foto,
                is_anonimo,
                conta_bancaria,
                stripe_account_id,
            } = req.body;

            if (!nome_completo || nome_completo.trim() === '') {
                return res.status(400).json({ error: 'Nome completo é obrigatório.' });
            }
            if (!data_nascimento) {
                return res.status(400).json({ error: 'Data de nascimento é obrigatória.' });
            }
            if (!cpf || cpf.trim() === '') {
                return res.status(400).json({ error: 'CPF é obrigatório.' });
            }

            const usuario = await connection('usuarios').where({ id: uid }).first();
            if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado.' });

            const existe = await connection('escritores').where({ usuario_id: uid }).first();
            if (existe) return res.status(400).json({ error: 'Perfil de escritor já existe.' });

            await connection('escritores').insert({
                usuario_id: uid,
                nome_completo: nome_completo.trim(),
                data_nascimento,
                cpf: cpf.trim(),
                telefone: telefone ?? '',
                endereco_linha1: endereco_linha1 ?? '',
                endereco_linha2: endereco_linha2 ?? '',
                cidade: cidade ?? '',
                estado: estado ?? '',
                cep: cep ?? '',
                pais: pais ?? '',
                conta_bancaria: conta_bancaria ?? '',
                foto: foto ?? '',
                is_anonimo: is_anonimo ?? false,
                stripe_account_id: stripe_account_id ?? '',
            });

            await connection('usuarios').where({ id: uid }).update({ is_writer: true });

            return res.status(201).json({ message: 'Perfil de escritor criado com sucesso.' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao criar perfil de escritor.' });
        }
    }

    async show(req, res) {
        try {
            const escritores = await connection('escritores')
                .select('*')
                .orderBy('criado_em', 'desc');

            return res.json(escritores.map((escritor) => new Escritor(escritor)));
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao listar escritores.' });
        }
    }

    async update(req, res) {
        try {
            const { uid } = req.usuario;
            const {
                nome_completo,
                data_nascimento,
                cpf,
                telefone,
                endereco_linha1,
                endereco_linha2,
                cidade,
                estado,
                cep,
                pais,
                conta_bancaria,
                stripe_account_id,
            } = req.body;

            const escritor = await connection('escritores').where({ usuario_id: uid }).first();
            if (!escritor) return res.status(404).json({ error: 'Perfil de escritor não encontrado.' });

            const updateData = {};
            if (nome_completo !== undefined && nome_completo.trim() !== '') updateData.nome_completo = nome_completo.trim();
            if (data_nascimento !== undefined) updateData.data_nascimento = data_nascimento;
            if (cpf !== undefined && cpf.trim() !== '') updateData.cpf = cpf.trim();
            if (telefone !== undefined) updateData.telefone = telefone ?? '';
            if (endereco_linha1 !== undefined) updateData.endereco_linha1 = endereco_linha1 ?? '';
            if (endereco_linha2 !== undefined) updateData.endereco_linha2 = endereco_linha2 ?? '';
            if (cidade !== undefined) updateData.cidade = cidade ?? '';
            if (estado !== undefined) updateData.estado = estado ?? '';
            if (cep !== undefined) updateData.cep = cep ?? '';
            if (pais !== undefined) updateData.pais = pais ?? '';
            if (conta_bancaria !== undefined) updateData.conta_bancaria = conta_bancaria ?? '';
            if (stripe_account_id !== undefined) updateData.stripe_account_id = stripe_account_id ?? '';

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({ error: 'Nenhuma informação para atualizar.' });
            }

            updateData.atualizado_em = new Date();

            const [atualizado] = await connection('escritores')
                .where({ usuario_id: uid })
                .update(updateData)
                .returning('*');

            return res.json(new Escritor(atualizado));
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao atualizar perfil de escritor.' });
        }
    }

    async destroy(req, res) {
        try {
            const { uid } = req.usuario;

            const escritor = await connection('escritores').where({ usuario_id: uid }).first();
            if (!escritor) return res.status(404).json({ error: 'Perfil de escritor não encontrado.' });

            await connection('escritores').where({ usuario_id: uid }).del();
            await connection('usuarios').where({ id: uid }).update({ is_writer: false });

            return res.status(200).json({ message: 'Perfil de escritor removido com sucesso.' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao remover perfil de escritor.' });
        }
    }

    async index(req, res) {
        try {
            const { id } = req.params;

            const escritor = await connection('escritores')
                .where('id', id)
                .first();

            if (!escritor) {
                return res.status(404).json({ error: 'Escritor não encontrado.' });
            }

            const livrosPublicados = await this._buscarLivrosPublicados(escritor.usuario_id);
            const seguidores = await this._buscarSeguidores(escritor.usuario_id);
            const seguindo = await this._buscarSeguindo(escritor.usuario_id);
            const curtidores = await this._buscarCurtidores(escritor.usuario_id);

            return res.json({
                escritor: new Escritor({
                    ...escritor,
                    livrosPublicados: livrosPublicados,
                    seguidores: seguidores,
                    curtidores:curtidores,
                    seguindo: seguindo,
                }),
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao buscar detalhes do escritor.' });
        }
    }

    async showByUsuarioId(req, res) {
        try {
            const { usuario_id } = req.params;

            const escritor = await connection('escritores')
                .where('usuario_id', usuario_id)
                .first();

            if (!escritor) {
                return res.status(404).json({ error: 'Escritor não encontrado para este usuário.' });
            }

            const livrosPublicados = await this._buscarLivrosPublicados(escritor.usuario_id);
            const seguidores = await this._buscarSeguidores(escritor.usuario_id);
            const seguindo = await this._buscarSeguindo(escritor.usuario_id);
            const curtidores = await this._buscarCurtidores(escritor.usuario_id);

            return res.json({
                escritor: new Escritor({
                    ...escritor,
                    livrosPublicados: livrosPublicados,
                    seguidores: seguidores,
                    curtidores:curtidores,
                    seguindo: seguindo,
                }),
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao buscar escritor pelo usuário.' });
        }
    }

    // 🔥 Funções internas auxiliares 🔥

    // Dentro do mesmo service/controller onde estão os helpers
    async _buscarCurtidores(perfil_id, tipo_curtido = 'escritor') {
        if (!perfil_id) return [];

        // Traz quem curtiu esse perfil (usuario|escritor)
        const curtidores = await connection('curtidas_perfis')
            .where({ curtido_id: perfil_id, tipo_curtido })
            .join('usuarios', 'curtidas_perfis.usuario_id', 'usuarios.id')
            .select('usuarios.id', 'usuarios.nome_usuario', 'usuarios.foto')
            .orderBy('usuarios.nome_usuario');

        return curtidores.map((u) => ({
            id: u.id,
            nome_usuario: u.nome_usuario,
            foto: u.foto,
        }));
    }

    async _buscarLivrosPublicados(usuario_id) {
        // Busca todos os livros do usuário
        const livros = await connection('livros')
            .where('usuario_id', usuario_id)
            .select('*');

        if (!livros.length) return []; // nada publicado

        // Busca o perfil de escritor só uma vez
        const perfil = await connection('escritores')
            .where('escritores.usuario_id', usuario_id)
            .join('usuarios', 'usuarios.id', 'escritores.usuario_id')
            .select(
                'escritores.*',
                'usuarios.nome_usuario',
                'usuarios.foto'
            )
            .first();

        // Enriquecer cada livro de forma paralela
        const livrosComInfo = await Promise.all(
            livros.map(async (livro) => {
                // curtidas
                const [{ count: qtd_curtidas }] = await connection('curtidas')
                    .where('livro_id', livro.id)
                    .count('id');

                // comentários
                const [{ count: qtd_comentarios }] = await connection('comentarios')
                    .where('livro_id', livro.id)
                    .count('id');


                return new Livro({
                    ...livro,
                    author: new Escritor(perfil),
                    qtd_curtidas: Number(qtd_curtidas),
                    qtd_comentarios: Number(qtd_comentarios),
                });
            })
        );

        return livrosComInfo;
    }


    // Quem SEGUE esse usuário  ─────────────────────────────
    // (lista de followers / seguidores)
    async _buscarSeguidores(usuario_id) {
        const seguidores = await connection('seguidores')
            .where('seguindo_id', usuario_id)
            .andWhere('tipo', 'escritor')
            .join('usuarios', 'seguidores.usuario_id', 'usuarios.id')
            .select('usuarios.id', 'usuarios.nome_usuario', 'usuarios.foto');

        return seguidores.map(s => ({
            id: s.id,
            nome_usuario: s.nome_usuario,
            foto: s.foto,
        }));
    }

    // Quem ESTE usuário segue  ─────────────────────────────
    // (lista de perfis que ele segue)
    async _buscarSeguindo(usuario_id) {
        const seguindo = await connection('seguidores')
            .where('usuario_id', usuario_id)
            .andWhere('tipo', 'escritor')
            .join('usuarios', 'seguidores.seguindo_id', 'usuarios.id')
            .select('usuarios.id', 'usuarios.nome_usuario', 'usuarios.foto');

        return seguindo.map(s => ({
            id: s.id,
            nome_usuario: s.nome_usuario,
            foto: s.foto,
        }));
    }


}

export default new EscritorController();
