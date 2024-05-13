export default function getHoursFromTs({ ts }:GetHoursFromTsPropsType):string {
  if (ts) {
    const hour:number = new Date(ts).getHours();
    const maskHour:string = hour < 10 ? `0${hour}` : `${hour}`
    return maskHour;
  }
  const hour:number = new Date().getHours();
  const maskHour:string = hour < 10 ? `0${hour}` : `${hour}`
  return maskHour;
};

export type GetHoursFromTsPropsType = { ts?:number }
export type GetHoursFromTsType = (props:GetHoursFromTsPropsType) => string;