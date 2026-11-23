export class Escritor {
    constructor({
      id,
      usuario_id,
      foto,
      is_anonimo,
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
      criado_em,
      livrosPublicados,
      seguidores,
      seguindo,
      curtidores
    }) {
      this.curtidores = curtidores;
      this.livrosPublicados = livrosPublicados;
      this.seguidores = seguidores;
      this.seguindo = seguindo;
      this.id = id;
      this.foto = foto;
      this.usuario_id = usuario_id;
      this.is_anonimo = is_anonimo;
      this.nome_completo = nome_completo;
      this.data_nascimento = data_nascimento;
      this.cpf = cpf;
      this.telefone = telefone;
      this.endereco_linha1 = endereco_linha1;
      this.endereco_linha2 = endereco_linha2;
      this.cidade = cidade;
      this.estado = estado;
      this.cep = cep;
      this.pais = pais;
      this.conta_bancaria = conta_bancaria;
      this.stripe_account_id = stripe_account_id;
      this.criado_em = criado_em;
    }
  }
  