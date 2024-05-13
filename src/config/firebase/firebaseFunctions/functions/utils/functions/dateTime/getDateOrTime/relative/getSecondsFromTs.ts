export default function getSecondsFromTs({ ts }:GetSecondsFromTsPropsType):string {
  if (ts) {
    const second:number = new Date(ts).getSeconds();
    const maskSecond:string = second < 10 ? `0${second}` : `${second}`
    return maskSecond;
  }
  const second:number = new Date().getSeconds();
  const maskSecond:string = second < 10 ? `0${second}` : `${second}`
  return maskSecond;
};

export type GetSecondsFromTsPropsType = { ts?:number }
export type GetSecondsFromTsType = (props:GetSecondsFromTsPropsType) => string;