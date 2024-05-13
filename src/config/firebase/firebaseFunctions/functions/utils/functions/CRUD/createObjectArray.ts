import { Obj } from '../../common.types';


export default function createObjectArray(arr:Obj<any>[], item:Obj<any>[]):Obj<any>[] {
  const response = [...arr, ...item];
  return response;
};