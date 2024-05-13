// @ts-ignore
import { Auth, User } from 'firebase/auth';
// @ts-ignore
import { Firestore } from 'firebase/firestore';
import { ZodType, ZodTypeDef } from 'zod';

import Post from '../Request/Post';
import FirebaseDocumentProtocol, { FirebaseDocumentProtocolContructor } from './interfaces/FirebaseDocumentProtocol';

export default class FirebaseUserBase<T> extends FirebaseDocumentProtocol<T> {

  /**
   * 
   * @param {Auth} auth - Objeto Auth do firebase/auth
   * @param {Firestore} db - Objeto Firestore do firebase/firestore
   * @param {User} user - Objeto User do firebase/auth
   * @param {() => void} resetState - uma função de callback utilizada para resetar os estados do React, para que as alterações realizadas no usuário reflitam no DOM quando houver uma nova re-renderização do DOM
   */
  constructor({auth, db, user, resetState, schema, _collection, apiCreationPath}:FirebaseDocumentProtocolContructor<ZodType<any, ZodTypeDef, T>>) {
    super({ auth, db, user, resetState, schema, _collection, apiCreationPath });
  };


  // /**
  //  * Dados do usuário
  //  */
  // get data() {
  //   return this._data;
  // };


  resetUser() {
    this._data = null;
    this.user = null;
    this.resetState?.();
  }


  /**
   * Caso já possua os dados do usuário na instância, os retorna.
   * 
   * Se os dados não estiverem disponíveis, busca-os no firestore.
   * 
   * @returns retorna os dados do usuário
   */
  async get():Promise<T | null> {
    try {
      if (!this._data) return await this.getAgain();      
      return this._data;
    } catch (e:any) {
      alert(`Ocorreu um erro: ${e.message}`);
      this._data = null;
      return null;
    }
  };

  /**
   * Busca os dados no firestore e atualiza a instância com os mesmos.
   * 
   * @returns retorna os dados recém buscados do firestore.
   */
  async getAgain():Promise<T | null> {
    if (!this.user) return null;
    try {
      const resp = await this.collection().data();
      if (!resp) {
        this._data = null;
        this.resetState?.();
        return null;
      };
      const { error, schema } = this.schema.validadeSchema(resp)
      // const parsed = customerDataSchema.safeParse(resp);
      if (error) {
        alert(error);
        this._data = null;
        this.resetState?.();
        return null;
      };
      if (!schema) {
        alert('Os dados não pueram ser buscados');
        this._data = null;
        this.resetState?.();
        return null;
      };
      this._data = schema;
      this.resetState?.();
      return this._data;
    } catch (e:any) {
      alert(`Ocorreu um erro: ${e.message}`);
      this._data = null;
      this.resetState?.();
      return null;
    };
  };

  /**
   * 
   * Cria o usuário com o esquema correto.
   * 
   * @returns - Retorna os dados do usuário
   */
  protected async create():Promise<T | null> {
    if (!this.user) return null;    
    const post = new Post(this.apiCreationPath);
    post.addData({uid:this.user.uid});
    console.log(`POST para: ${this.apiCreationPath}`)
    const resp = await post.send()
    const json = await resp?.json() as {error?:string, data?:any};
    const {error, data} = json;
    if (error) {
      alert(`Houve um erro: ${error}`);
      return null;
    };
    if (!data) {
      alert(`Houve um erro: O usuário não pode ser criado`);
      return null;
    }
    const { error:schemaError, schema } = this.schema.validadeSchema(data);
    if (schemaError) {
      alert(schemaError);
      this._data = null;
      this.resetState?.();
      return null;
    };
    if (!schema) {
      alert(`O usuário veio com o formato incorreto`);
      this._data = null;
      this.resetState?.();
      return null;
    };
    this._data = null;
    this.resetState?.();
    return schema;
  };

  /**
   * inicia o login com o google.
   * 
   * Se o login for bem sucedido, verifica se usuário já existe no banco de dados com o esquema correto.
   * 
   * Caso exista com o esquema correto, retorna os dados do usuário,
   * 
   * Caso não exista, ou esteja com o esquema de dados incorreto, cria um novo usuário ou substitui os dados existentes pelo esquema correto.
   * 
   * @returns Retorna o usuário ou um texto descrevendo o erro
   */
  async createWithLogin():Promise<{error?:string, data?:T}> {
    const { error, user } = await this.userAuth.googleLogin()
    if (error) return { error };
    if (!user) return { error:'Não foi possível logar' }
    this.user = user;
    const currData = await this.collection().data();    
    if (currData) {
      const { error:schemaError, schema } = this.schema.validadeSchema(currData);
      if (schemaError) {
        this._data = null;
        this.resetState?.();
        return { error:schemaError };
      };
      if (schema) {
        this._data = schema;
        this?.resetState?.();
        return {data:schema};
      };
      const usr = await this.create();
      if (!usr) return { error:'Não foi possível criar o usuário' }
      this._data = usr;
      this?.resetState?.();
      return {data:usr};
    }
    const usr = await this.create();
    if (!usr) return { error:'Não foi possível criar o usuário' }
    this._data = usr;
    this?.resetState?.();
    return {data:usr};
  };


  /**
   * Atualiza os dados do usuário no banco de dados com os dados informados.
   * @param {Partial<T>} data - Dados a serem atualizados no banco de dados.
   * @returns {Promise<null | undefined>} retorna null ou undefined
   */
  // @ts-ignore
  async update(data:Partial<T>) {
    if (!this.user) return null;
    try {
      await this.collection().update(data);
    } catch (e:any) {
      alert(`Ocorreu um erro: ${e.message}`);
    };
  };


  /**
   * Adiciona uma subscrição no Firebase Firestore que retornará os dados do usuário e atualizará a instância toda vez que houver mudanças no documento contendo os dados do mesmo.
   * 
   * @param {User | null} user - Usuário do Firebase Auth 
   * @param {(arg?:any) => any} callback - Função callback executada toda vez que houverem mudanças neste usuário
   * @returns {null | undefined} - null | undefined
   */
  // @ts-ignore
  onSnapshot(user:User | null, callback:(arg?:any) => any):null | undefined {
    if (!user) return null;
    this.user = user;
    this.collection().onSnapshotExecute((data) => {
      callback(data?.data);
      if (!data) {
        this._data = null;
        this.resetState?.();
        return;
      }
      const { error:schemaError, schema } = this.schema.validadeSchema(data.data);
      if (schemaError) {
        this._data = null;
        this.resetState?.();
        return;
      };
      if (!schema) {
        this._data = null;
        this.resetState?.();
        return;
      };
      this._data = schema;
      this?.resetState?.();
      return {data:schema};      
    }, this._snapshots, 'userBase');
  }

  /**
   * Remove todas as subscrições do usuário dessa instância no Firebase Firestore.
   */
  clearSnapshots() {
    Object.keys(this._snapshots).map(snap => this._snapshots[snap]())
  }

};


// const u = new FirebaseUserBase({} as unknown as User, {} as unknown as Firestore)
// u.update({email:''})