import { Obj } from '../../common.types';


export default function updateObjectArray(arr:Obj<any>[], item:Obj<any>[], arrField:string, itemField:string):Obj<any>[] {
  const response = arr.filter(data => {
    const same = item.filter(each => each[itemField] === data[arrField]);
    return same.length === 0;
  });

  
  
  const dataToUpdate = item.filter(data => {
    const same = arr.filter(each => each[arrField] === data[itemField]);
    return same.length > 0;
  });
  console.log('dataToUpdate updating...', dataToUpdate);
  return [...response, ...dataToUpdate];
};