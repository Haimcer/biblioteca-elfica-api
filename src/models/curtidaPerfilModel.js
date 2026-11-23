export class CurtidaPerfil {
    constructor({
      id,
      usuario_id,
      curtido_id,
      tipo_curtido, // 'usuario' ou 'escritor'
      criado_em,
    }) {
      this.id = id;
      this.usuario_id = usuario_id;   // Quem deu a curtida
      this.curtido_id = curtido_id;   // Quem recebeu a curtida
      this.tipo_curtido = tipo_curtido; // Tipo: 'usuario' ou 'escritor'
      this.criado_em = criado_em;
    }
  }
  