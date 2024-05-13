export default function sumArray({ arr }:SumArrayPropsType):number {
  const sum = arr.reduce((acc:number, num:number) => {
    acc += num;
    return acc;
  }, 0);

  return sum;
};

export type SumArrayPropsType = {
  arr:Array<number>,
};

export type SumArrayType = (props:SumArrayPropsType) => number;