export default function getMonthFromTs({ ts }:GetMonthFromTsPropsType):string {
  if (ts) {
    const month:number = (new Date(ts).getMonth()) + 1;
    const maskMonth:string = month < 10 ? `0${month}` : `${month}`
    return maskMonth;
  }
  const month:number = (new Date().getMonth()) + 1;
  const maskMonth:string = month < 10 ? `0${month}` : `${month}`
  return maskMonth;
};

export type GetMonthFromTsPropsType = { ts?:number }
export type GetMonthFromTsType = (props:GetMonthFromTsPropsType) => string;