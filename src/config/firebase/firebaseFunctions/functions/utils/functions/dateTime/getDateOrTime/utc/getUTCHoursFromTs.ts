export default function getUTCHoursFromTs({ ts }:GetUTCHoursFromTsPropsType):string {
  if (ts) {
    const hour:number = new Date(ts).getUTCHours();
    const maskHour:string = hour < 10 ? `0${hour}` : `${hour}`
    return maskHour;
  }
  const hour:number = new Date().getUTCHours();
  const maskHour:string = hour < 10 ? `0${hour}` : `${hour}`
  return maskHour;
};

export type GetUTCHoursFromTsPropsType = { ts?:number }
export type GetUTCHoursFromTsType = (props:GetUTCHoursFromTsPropsType) => string;