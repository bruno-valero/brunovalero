export default function getDayFromTs({ ts }:GetDayFromTsPropsType):string {
  if (ts) {
    const day:number = new Date(ts).getDate();
    const maskDay:string = day < 10 ? `0${day}` : `${day}`
    return maskDay;
  }
  const day:number = new Date().getDate();
  const maskDay:string = day < 10 ? `0${day}` : `${day}`
  return maskDay;
};

export type GetDayFromTsPropsType = { ts?:number }
export type GetDayFromTsType = (props:GetDayFromTsPropsType) => string;