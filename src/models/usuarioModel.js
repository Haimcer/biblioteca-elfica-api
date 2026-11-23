export class Usuario {
  constructor({
    id,
    nome_usuario,
    email,
    foto,
    is_writer,
    stripe_account_id,
    bio,
    site_pessoal,
    criado_em,
    perfil_escritor = {},
    seguidores = [],
    seguindo = [],
    livros_curtidos = [],
    curtidores = []
  }) {
    this.id = id;
    this.curtidores = curtidores;
    this.perfil_escritor = perfil_escritor;
    this.nome_usuario = nome_usuario;
    this.email = email;
    this.foto = foto;
    this.is_writer = is_writer;
    this.stripe_account_id = stripe_account_id;
    this.bio = bio;
    this.site_pessoal = site_pessoal;
    this.criado_em = criado_em;
    this.seguidores = seguidores;
    this.seguindo = seguindo;
    this.livros_curtidos = livros_curtidos;
  }
}
