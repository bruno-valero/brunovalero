import { Auth, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, Unsubscribe, User } from 'firebase/auth';


export interface FirebaseAuthProtocolContructor {
  user:User | null;
  auth:Auth;
  resetState?:() => void;
}

export default abstract class FirebaseAuthProtocol {


  // on instance
  protected user:User | null;
  protected auth:Auth;
  public readonly resetState?:() => void;
  // ---------------------------------------------------

  protected _unsubscribeAuth:Unsubscribe | (() => void) = () => {}

  /**
   * 
   * @param {Auth} auth - Objeto Auth do firebase/auth   
   * @param {User} user - Objeto User do firebase/auth
   * @param {() => void} resetState - uma função de callback utilizada para resetar os estados do React, para que as alterações realizadas no usuário reflitam no DOM quando houver uma nova re-renderização do DOM
   */
  constructor({auth, user, resetState}:FirebaseAuthProtocolContructor) {
    this.auth = auth;
    this.user = user;
    this.resetState = resetState;
  };


  /**
   * Retorna os dados do Usuário do Firebase Auth
   */
  get data() {
    return this.user;
  };


  async isAdmin() {
    if (!this.user) return false;
    const userToken = await this.user.getIdTokenResult();
    // console.log('user claims no front end: ', userToken.claims);
    return (userToken.claims.isAdmin ?? false) as boolean;
  }


  /**
   * Aplica uma subscribe que escuta alterações no estado de autenticação do usuário.
   * 
   * Dessa forma, sempre que o usuário logar, ou deslogar, ele irá atualizar a instância com essa informação
   * 
   * @param {(user?:User | null) => any} callback -  Função de callback executada quando houver alteração no estado de autenticação do usuário
   * @returns {Unsubscribe} - retorna uma função, que  ao ser executada, remove a subscrição que escuta mudanças no estado de autenticação do usuário nessa instância.
   */
  onAuthStateChanged(callback?:(user?:User | null) => any):Unsubscribe {
    const sub = onAuthStateChanged(this.auth, user => {
      this.user = user;
      callback?.(user);
      this.resetState?.();
    });
    this._unsubscribeAuth = sub;
    return sub;
  };

  unsubscribeAuth() {
    this._unsubscribeAuth();
  };


  async loginWithEmailAndPassword(email:string, password:string) {
    try {
      const user = await signInWithEmailAndPassword(this.auth, email, password);
      this.user = user.user;
    } catch (e:any) {
      alert(e.message);
      this.user = null;
    }
  }

  /**
   * Aplica o login com o google, abrindo uma nova janela para que o usuário escolha qual conta usar.
   * @returns {Promise<{user?: User, error?: string}>} retorna o usuário (User do firebase/auth) ou ma string contendo o erro ocorrido durante o processo
   */
  async googleLogin():Promise<{user?: User, error?: string}> {
    try {    

      if (!this.auth) throw new Error("auth não foi passado pelo servidor");    
      
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      // const credential = GoogleAuthProvider.credentialFromResult(result);
      // const token = credential?.accessToken;
      const user = result.user;
      // console.log(JSON.stringify({ user:user }, null, 2));
      this.resetState?.();
      this.user = user;
      return {user}
  
    } catch (e:any) {  
      // @ts-ignore  
      const errorCode = e.code;
      const eMessage = e.message as string;
      // The email of the user's account used.
      // const email = e.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(e);
      console.log('houve um erro', 'credential: ', JSON.stringify(credential, null, 2) + '\n', 'message: ', eMessage);      
      this.resetState?.();
      alert(`houve um erro: ${eMessage}`);   
      this.user = null;   
      return {error:eMessage};
    }
  };

  /**
   * Realiza o logout do usuário
   */
  async logout() {
    await signOut(this.auth);
    this.resetState?.();
  };

  

}