import { Obj } from '../../common.types';


export default function deleteObjectArray(arr:Obj<any>[], item:Obj<any>[], arrField:string, itemField:string):Obj<any>[] {
  const response = arr.filter(data => {
    const same = item.filter(each => each[itemField] === data[arrField])
    return same.length === 0;
  });
  return response;
};