import { Obj } from '../../common.types';

export default function isObjectKeysNullish({ obj }:IsObjectKeysNullishPropstype):boolean {
  const keysVerify = Object.keys(obj).filter((key:string) => {
    const objKey = (obj)[key];    
    return (objKey === undefined) || (objKey === null);
  });  
  if (keysVerify.length > 0) return true;
  return false
};

export type IsObjectKeysNullishPropstype = { obj:Obj<any> }