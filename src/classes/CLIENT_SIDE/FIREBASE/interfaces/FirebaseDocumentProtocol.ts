import Schema from '@/src/classes/Schema/index';
import { GetDocById } from '@/src/config/firebase/firestore';
import { Auth, Unsubscribe, User } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { ZodType, ZodTypeDef } from 'zod';
import UserAuth from '../UserAuth';
import FirebaseAuthProtocol from './FirebaseAuthProtocol';


export interface FirebaseDocumentProtocolContructor<T> {
  user?:User | null;
  db:Firestore;
  auth:Auth;
  resetState?:() => void;
  schema:T;
  _collection:(uid:string) => GetDocById;
  apiCreationPath:string;
  documentId?:string;
};

export default abstract class FirebaseDocumentProtocol<T> {


  // on instance
  protected user:User | null;
  protected db:Firestore;
  protected auth:Auth;
  public readonly resetState?:() => void;
  userAuth:FirebaseAuthProtocol;
  readonly schema:Schema<T>;
  readonly documentId?:string;
  protected readonly _collection:(uid:string) => GetDocById;
  protected apiCreationPath:string;
  // ---------------------------------------------------

  protected _data:T | null = null;
  protected _snapshots:Record<string, any> = {};
  protected _unsubscribeAuth:Unsubscribe | (() => void) = () => {}

  constructor({auth, db, user, resetState, schema, _collection, documentId, apiCreationPath}:FirebaseDocumentProtocolContructor<ZodType<any, ZodTypeDef, T>>) {
    this.auth = auth;
    this.db = db;
    this.user = user ?? null;
    this.resetState = resetState;
    this.schema = new Schema(schema);
    this._collection = _collection;
    this.documentId = documentId;
    this.apiCreationPath = apiCreationPath;
    this.userAuth = new UserAuth({ auth, user:user ?? null, resetState });
  };


  /**
   * Dados do documento
   */
  get data():T | null {
    return this._data;
  };
  /**
   * Retorna a referência do documento no firestore
   
   * @returns {GetDocById} - Retorna a referência do documento no firestore
   */
  protected collection():GetDocById {
    return this._collection((this.documentId ?? this.userAuth.data?.uid) ?? '');
  };

  
  abstract get():Promise<any>;
  abstract getAgain():Promise<any>;
  protected abstract create():Promise<any>;
  abstract createWithLogin():Promise<any>;
  abstract update(data:Partial<any>):Promise<any>;
  abstract onSnapshot(user:User | null, callback:(arg?:any) => any):any;
  abstract clearSnapshots():any;


};