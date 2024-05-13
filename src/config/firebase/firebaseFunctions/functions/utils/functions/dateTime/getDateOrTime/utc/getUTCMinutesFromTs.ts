export default function getUTCMinutesFromTs({ ts }:getUTCMinutesFromTsPropsType):string {
  if (ts) {
    const minute:number = new Date(ts).getUTCMinutes();
    const maskMinute:string = minute < 10 ? `0${minute}` : `${minute}`
    return maskMinute;
  }
  const minute:number = new Date().getUTCMinutes();
  const maskMinute:string = minute < 10 ? `0${minute}` : `${minute}`
  return maskMinute;
};

export type getUTCMinutesFromTsPropsType = { ts?:number }
export type getUTCMinutesFromTsType = (props:getUTCMinutesFromTsPropsType) => string;