

export default class Request {

  protected headers:Record<string, string> = {
    'Content-Type':'application/json',
  };
  protected method:'POST' | 'GET' = 'GET';

  constructor (
    protected url:string,
    ) {};


  /**
   * Adiciona um novo Header ou atualiza um header existente.
   * 
   * Por padrão há um header inicial {"Content-Type":"application/json"}.
   * 
   * Para substituir todos os headers por novos, use o Método setHeaders
   * 
   * @param {Record<string, string>} header - Novo header a ser adicionado
   * @returns - retorna outra instância deste objeto
   */

  addHeader(header:Record<string, string>) {
    this.headers = {...this.headers, ...header};
    return this;
  };

  /**
   * Substitui todos os headers existentes pelo objeto informado.
   * 
   * Por padrão há um header inicial {"Content-Type":"application/json"}
   * 
   * Para apenas adicionar novo header ou atualizar um header específico, use o Método addHeaders
   * 
   * @param {Record<string, string>} headers  - Substitui todos os headers anteriores pelo novo objeto headers informado
   * @returns - retorna outra instância deste objeto
   */
  setHeaders(headers:Record<string, string>) {
    this.headers = headers;
    return this;
  };

  /**
   * Método Assíncrono que executa a requisição para a url Informada, retornando a resposta da função fetch bruta
   * @returns - retorna a resposta da função fetch, que pode ser transformada para Blob, JSON, etc
   */

  async send() {
    if (!this.url) return;
    const method = this.method;
    const headers = this.headers;
    const resp = await fetch(this.url, {method, headers});
    return resp;
  };
  
};