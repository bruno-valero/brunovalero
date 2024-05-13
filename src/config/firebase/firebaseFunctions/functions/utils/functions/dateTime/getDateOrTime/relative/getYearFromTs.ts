export default function getYearFromTs({ ts }:GetYearFromTsPropsType):string {
  if (ts) {
    const year:number = new Date(ts).getFullYear();
    return `${year}`;
  }
  const year:number = new Date().getFullYear();
  return `${year}`;
};

export type GetYearFromTsPropsType = { ts?:number }
export type GetYearFromTsType = (props:GetYearFromTsPropsType) => string;