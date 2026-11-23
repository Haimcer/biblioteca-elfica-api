export class Seguidor {
    constructor({
      id,
      seguidor_id,
      seguido_id,
      tipo_seguido, // 'usuario' ou 'escritor'
      criado_em,
    }) {
      this.id = id;
      this.seguidor_id = seguidor_id; // Quem está seguindo
      this.seguido_id = seguido_id;   // Quem está sendo seguido
      this.tipo_seguido = tipo_seguido; // Tipo: 'usuario' ou 'escritor'
      this.criado_em = criado_em;
    }
  }
  