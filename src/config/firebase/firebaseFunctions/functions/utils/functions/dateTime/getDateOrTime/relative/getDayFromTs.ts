export default function getUTCDayFromTs({ ts }:GetUTCDayFromTsPropsType):string {
  if (ts) {
    const day:number = new Date(ts).getUTCDate();
    const maskDay:string = day < 10 ? `0${day}` : `${day}`
    return maskDay;
  }
  const day:number = new Date().getUTCDate();
  const maskDay:string = day < 10 ? `0${day}` : `${day}`
  return maskDay;
};

export type GetUTCDayFromTsPropsType = { ts?:number }
export type GetUTCDayFromTsType = (props:GetUTCDayFromTsPropsType) => string;