export default function getUTCSecondsFromTs({ ts }:getUTCSecondsFromTsPropsType):string {
  if (ts) {
    const second:number = new Date(ts).getUTCSeconds();
    const maskSecond:string = second < 10 ? `0${second}` : `${second}`
    return maskSecond;
  }
  const second:number = new Date().getUTCSeconds();
  const maskSecond:string = second < 10 ? `0${second}` : `${second}`
  return maskSecond;
};

export type getUTCSecondsFromTsPropsType = { ts?:number }
export type getUTCSecondsFromTsType = (props:getUTCSecondsFromTsPropsType) => string;