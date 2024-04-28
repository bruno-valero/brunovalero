import { GetDocById } from '@/src/config/firebase/firestore';
import { Auth, User } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { ZodType, ZodTypeDef } from 'zod';
import FirebaseUserBase from '../FIREBASE/FirebaseUserBase';

type Data<UBS> = {
  authUser?:User,
  userBase:FirebaseUserBase<UBS>,
};


interface CustomerConstructor<UBS> {
  db:Firestore,
  auth:Auth,
  resetState?:() => void,
  user?:User,
  userBase: {
    schema:ZodType<any, ZodTypeDef, UBS>,
    collection:(uid:string) => GetDocById,
    apiCreationPath:string
  },
}

export default class Customer<UBS> {

  protected readonly db:Firestore;
  protected readonly auth:Auth;
  public readonly resetState?:() => void;
  protected readonly user?:User;
  private _data:Data<UBS>;

  /**
   *    
   * @param {Firestore} db - Objeto Firestore do firebase/firestore
   * @param {Auth} auth - Objeto Auth do firebase/auth
   * @param {Data} user - Objeto User do firebase/auth 
   * @param {() => void} resetState - uma função de callback utilizada para resetar os estados do React, para que as alterações realizadas no usuário reflitam no DOM quando houver uma nova re-renderização do DOM
   */
  constructor({auth, db, resetState, user, userBase:{collection, schema, apiCreationPath}}:CustomerConstructor<UBS>) {
    
    // on instance
    this.auth = auth;  
    this.db = db;  
    this.resetState = resetState;  
    this.user = user;  
    // ---------------------------------------

    this._data = {
        userBase:new FirebaseUserBase({user:user ?? null, db, auth, resetState, schema, _collection:collection, apiCreationPath})
      };
  }

  /**
   * Exibe todos os dados do usuário
   */

  get data() {
    return {
      base:this._data.userBase,
    };
  };

};