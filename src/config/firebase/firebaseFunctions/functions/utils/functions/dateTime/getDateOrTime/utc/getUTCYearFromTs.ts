export default function getUTCYearFromTs({ ts }:GetUTCYearFromTsPropsType):string {
  if (ts) {
    const year:number = new Date(ts).getUTCFullYear();
    return `${year}`;
  }
  const year:number = new Date().getUTCFullYear();
  return `${year}`;
};

export type GetUTCYearFromTsPropsType = { ts?:number }
export type GetUTCYearFromTsType = (props:GetUTCYearFromTsPropsType) => string;