export class Comentario {
  constructor({
    id,
    usuario_id,
    livro_id,
    mensagem,
    nome_usuario,
    foto,
    criado_em,
  }) {
    this.id = id;
    this.usuario_id = usuario_id;
    this.livro_id = livro_id;
    this.mensagem = mensagem;
    this.nome_usuario = nome_usuario;
    this.foto = foto;
    this.criado_em = criado_em;
  }
}
