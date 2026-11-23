export class Livro {
  constructor({
    id,
    title,
    author,
    description,
    cover_url,
    download_url,
    is_premium,
    preco,
    is_free,
    categoria,
    idioma,
    regiao,
    transcricao,
    qtd_curtidas,
    qtd_comentarios,
    list_curtidas,
    list_comentarios,
    criado_em,
    usuario
  }) {
    this.id = id;
    this.usuario = usuario;
    this.title = title;
    this.is_free = is_free;
    this.author = author;
    this.description = description;
    this.cover_url = cover_url;
    this.download_url = download_url;
    this.is_premium = is_premium;
    this.preco = preco;
    this.categoria = categoria;
    this.idioma = idioma;
    this.regiao = regiao;
    this.transcricao = transcricao;
    this.qtd_curtidas = qtd_curtidas;
    this.qtd_comentarios = qtd_comentarios;
    this.list_curtidas = list_curtidas;
    this.list_comentarios = list_comentarios;
    this.criado_em = criado_em;
  }
}
