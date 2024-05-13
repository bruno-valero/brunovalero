export default function getUTCMonthFromTs({ ts }:getUTCMonthFromTsPropsType):string {
  if (ts) {
    const month:number = (new Date(ts).getUTCMonth()) + 1;
    const maskMonth:string = month < 10 ? `0${month}` : `${month}`
    return maskMonth;
  }
  const month:number = (new Date().getUTCMonth()) + 1;
  const maskMonth:string = month < 10 ? `0${month}` : `${month}`
  return maskMonth;
};

export type getUTCMonthFromTsPropsType = { ts?:number }
export type getUTCMonthFromTsType = (props:getUTCMonthFromTsPropsType) => string;