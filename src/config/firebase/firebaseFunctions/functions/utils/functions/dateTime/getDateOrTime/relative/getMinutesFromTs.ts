export default function getMinutesFromTs({ ts }:GetMinutesFromTsPropsType):string {
  if (ts) {
    const minute:number = new Date(ts).getMinutes();
    const maskMinute:string = minute < 10 ? `0${minute}` : `${minute}`
    return maskMinute;
  }
  const minute:number = new Date().getMinutes();
  const maskMinute:string = minute < 10 ? `0${minute}` : `${minute}`
  return maskMinute;
};

export type GetMinutesFromTsPropsType = { ts?:number }
export type GetMinutesFromTsType = (props:GetMinutesFromTsPropsType) => string;