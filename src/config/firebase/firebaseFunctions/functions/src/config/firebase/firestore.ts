import { addDoc, collection, CollectionReference, deleteDoc, deleteField, doc, DocumentData, DocumentReference, Firestore, getDoc, getDocs, onSnapshot, query, QueryFieldFilterConstraint, setDoc, updateDoc } from "firebase/firestore";
import { Obj } from '../../../utils/common.types';

// type FromCollectionProps = {
//   name:string,
//   ref:Firestore,
// }

export type FromCollection = ReturnType<typeof fromCollection>;
export type GetDocById = ReturnType<FromCollection['getDocById']>;

type FirestoreRef = DocumentReference<DocumentData, DocumentData> | CollectionReference<DocumentData, DocumentData> |  Firestore
export default function fromCollection (name:string, ref:FirestoreRef) {

  const coll = collection(ref as Firestore, name);
  // @ts-ignore
  const createDoc = async (data:Obj<any>) => {
    if (!data) data = {};
    try {
      await addDoc(coll, data);
      console.log('Documento adicionado com sucesso.');
    } catch (error) {
      console.log('Erro ao adicionar o documento:', error);
      return [];
    }
  }

  const createDocById = async (name:string, data:Obj<any>) => {    
    const document = doc(coll, name); doc(coll,)
    if (!data) data = {};
    try {
      await setDoc(document, data);
      console.log('Documento adicionado com sucesso.');
    } catch (error) {
      console.log('Erro ao adicionar o documento:', error);
      return ;
    }
  }

  const deleteFieldsFromId = async (name:string, data:Obj<any>) => {    
    const document = doc(coll, name); 
    if (!data) data = {};
    try {
      data = data.reduce((acc:Obj<any>, item:any) => {
        acc[item] = deleteField();
        return acc;
      }, {})
      await updateDoc(document, data);
      console.log('Campos deletados com sucesso com sucesso.');
    } catch (error) {
      console.log('Erro ao deletar os campos do documento:', error);
      return ;
    }
  }


  const onSnapshotExecute = async (callback:(props:{id: string, data: DocumentData}[]) => any, ref:Obj<any>, refName:string, collRef=coll, queries?:QueryFieldFilterConstraint[]) => { 
    
    ref[refName] = onSnapshot(queries ? query(collRef, ...queries) : collRef, snapshot => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));

      callback(data);
    });

  }


  const docs = async (queries?:QueryFieldFilterConstraint[]) => {    
    try {      
      const querySnapshot = queries ? await getDocs(query(coll, ...queries)) : await getDocs(coll);
      if (querySnapshot.size === 0) {
        // addDoc(coll, {})
        // const querySnapshotSecond = await getDocs(coll);
        // querySnapshotSecond.forEach(doc => deleteDoc(doc.ref))
        return []
      }
      return querySnapshot.docs.map(doc => {
        const result = {data: doc.data(), id: doc.id, ref:getDocById(String(doc.id))};
        return result;
      });
    } catch (error) {
      console.log('Erro ao pegar os documentos:', error);
      return [];
    }
  };


  
  function getDocById (name:string) {   
    const document = doc(coll, name); 
    // @ts-ignore
    const data = async () => {
      try {
        const querySnapshot = await getDoc(document)
        const result = querySnapshot.exists() ? (Object.keys(querySnapshot.data()).length > 0 ? querySnapshot.data() : null)
         : null;
        return result;
      } catch(e) {
        console.log('Erro ao pegar o documentos:', e)
      }
    };

    type OnSnapshotExecuteData = {
      data: DocumentData;
      id: string;
    } | null
    const onSnapshotExecute = (callback:(props:OnSnapshotExecuteData) => any, ref:Obj<any>, refId?:string) => {
  
      ref[refId ?? 'current'] = onSnapshot(document, snapshot => {
        const data = snapshot.exists() ? {data:snapshot.data(), id:snapshot.id} : null;
  
        callback(data);
      });
  
    }

    async function update(data:Obj<any>) {
      await updateDoc(document, data);
    }

    async function remove() {
      deleteDoc(document);
    }

    const getCollection = (collName:string) => {
      return fromCollection(collName, document);
    }

    return {
      data,
      getCollection,
      onSnapshotExecute,
      update,
      remove,
    }
  };

  // type Operator = "<" | "<=" | "==" | "<" | "<=" | "!=" | 
  //     "array-contains" | "array-contains-any" | "in"
  //   async function whereFilter(field:string,operator:Operator, value:string[] | number[] | string | number) {

  //     return docs(query(coll, where(field, operator, value)) as CollectionReference<DocumentData, DocumentData>)
  //   }

  

  const updateDocById = async (name:string, data:Obj<any>) => {   
    const document = doc(coll, name); 
    try {
      await updateDoc(document, data);
      console.log('Documento atualizado com sucesso.');
    } catch (error) {
      console.log('Erro ao atualizar o documento:', error);
      return ;
    }
  }

  const deleteDocById = async (name:string) => {   
    const document = doc(coll, name); 
    try {
      await deleteDoc(document);
      console.log('Documento excluído com sucesso.');
    } catch (error) {
      console.log('Erro ao excluir o documento:', error);
      return ;
    }
  }

  return {
    createDoc,
    createDocById,
    deleteFieldsFromId,
    onSnapshotExecute,
    docs,
    getDocById,
    updateDocById,
    deleteDocById,
  }
};

