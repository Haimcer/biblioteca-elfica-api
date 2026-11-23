export class Curtida {
  constructor({
    id,
    usuario_id,
    livro_id,
    nome_usuario,
    foto,
    criado_em,
  }) {
    this.id = id;
    this.usuario_id = usuario_id;
    this.livro_id = livro_id;
    this.nome_usuario = nome_usuario;
    this.foto = foto;
    this.criado_em = criado_em;
  }
}
