export default function getMillisecondsFromTs({ ts }:GetMillisecondsFromTsPropsType):string {
  if (ts) {
    const milliSecond:number = new Date(ts).getMilliseconds();
    const maskMilliSecond:string = milliSecond < 10 ? `00${milliSecond}` : milliSecond < 100 ? `0${milliSecond}` : `${milliSecond}`;
    return maskMilliSecond;
  }
  const milliSecond:number = new Date().getMilliseconds();
  const maskMilliSecond:string = milliSecond < 10 ? `00${milliSecond}` : milliSecond < 100 ? `0${milliSecond}` : `${milliSecond}`;
  return maskMilliSecond;
};

export type GetMillisecondsFromTsPropsType = { ts?:number }
export type GetMillisecondsFromTsType = (props:GetMillisecondsFromTsPropsType) => string;