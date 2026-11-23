import connection from '../db/index.js';
import { Categoria } from '../models/categoriaModel.js';

class CategoriaController {
  async index(req, res) {
    const categorias = await connection('categorias').orderBy('id', 'asc');
    return res.json(categorias.map(c => new Categoria(c)));
  }

  async store(req, res) {
    const { nome } = req.body;

    if (!nome) return res.status(400).json({ error: 'Nome da categoria é obrigatório.' });

    const [categoria] = await connection('categorias')
      .insert({ nome })
      .returning('*');

    return res.status(201).json(new Categoria(categoria));
  }

  async update(req, res) {
    const { id } = req.params;
    const { nome } = req.body;

    const atual = await connection('categorias').where({ id }).first();
    if (!atual) return res.status(404).json({ error: 'Categoria não encontrada.' });

    const [categoria] = await connection('categorias')
      .where({ id })
      .update({ nome: nome ?? atual.nome })
      .returning('*');

    return res.json(new Categoria(categoria));
  }

  async destroy(req, res) {
    const { id } = req.params;

    const deleted = await connection('categorias').where({ id }).del();
    if (!deleted) return res.status(404).json({ error: 'Categoria não encontrada.' });

    return res.status(204).json({ message: 'Categoria excluída com sucesso.' });
  }
}

export default new CategoriaController();