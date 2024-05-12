import Request from './index';



export default class Post extends Request {
  private data:Record<string, any> = {};

  constructor (
    protected url:string,
    ) {
      super(url);
    };
  
  /**
   * O objeto informado será atribuído ao body da requisição.
   * 
   * Substitui os dados do body existentes, caso existam.
   * 
   * Para apenas atualizar alguns dados ou adicionar dados ao body da requisição, use o método addData
   * 
   * @param {Record<string, any>} data - Atribui ou substitui os dados informados no body da requisição.
   * @returns - retorna outra instância deste objeto
   */
  setData(data:Record<string, any>) {
    this.data = data;
    return this;
  };


  /**
   * O objeto informado será adicionado entre os dados do body da requisição.
   * 
   * Se houverem chaves correspondentes, atualizará as mesmas com as novas chaves
   * 
   * Para substituir todos os dados do body da requisição, use o método setData.
   * 
   * @param {Record<string, any>} data - Adiciona ou atualiza os dados informados no body da requisição.
   * @returns - retorna outra instância deste objeto
   */
  addData(data:Record<string, any>){
    this.data = {...this.data, ...data};
    return this;
  }


  async send() {
    if (!this.url) return;
    const method = 'POST';
    const body = JSON.stringify(this.data);
    const headers = this.headers;
    const resp = await fetch(this.url, {method, body, headers});
    return resp;
  };

};

