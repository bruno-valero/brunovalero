export default function getUTCMillisecondsFromTs({ ts }:GetUTCMillisecondsFromTsPropsType):string {
  if (ts) {
    const milliSecond:number = new Date(ts).getUTCMilliseconds();
    const maskMilliSecond:string = milliSecond < 10 ? `00${milliSecond}` : milliSecond < 100 ? `0${milliSecond}` : `${milliSecond}`;
    return maskMilliSecond;
  }
  const milliSecond:number = new Date().getUTCMilliseconds();
  const maskMilliSecond:string = milliSecond < 10 ? `00${milliSecond}` : milliSecond < 100 ? `0${milliSecond}` : `${milliSecond}`;
  return maskMilliSecond;
};

export type GetUTCMillisecondsFromTsPropsType = { ts?:number }
export type GetUTCMillisecondsFromTsType = (props:GetUTCMillisecondsFromTsPropsType) => string;