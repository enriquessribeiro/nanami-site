/** Erro com status HTTP. Evita expor stack/detalhe interno na resposta. */
export class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
