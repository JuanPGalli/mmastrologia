// Error del lado del cliente (datos incompletos/incorrectos) — se traduce a
// HTTP 400. Cualquier otro error (falla de Gemini, red, etc.) se trata como
// técnico/upstream (502) en los handlers, ya que ahí el usuario no hizo nada
// mal y conviene ofrecerle reintentar o contactar soporte en vez de un
// mensaje de "pedido inválido".
export class ValidationError extends Error {}
