import sumArray from './sumArray';

export default function meanArray({ arr }:MeanArrayPropsType):number {

  const total = sumArray({ arr });
  const mean = total / arr.length;

  return mean;
};

export type MeanArrayPropsType = {
  arr:Array<number>,
};

export type SumArrayType = (props:MeanArrayPropsType) => number;