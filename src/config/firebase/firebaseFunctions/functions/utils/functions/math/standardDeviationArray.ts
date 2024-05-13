import meanArray from './meanArray';
import sumArray from './sumArray';

export default function standardDeviationArray({ arr }:StandardDeviationArrayPropsType):number {

  const mean = meanArray({ arr });
  const itemMinusMean = arr.map(val => ((val - mean) ** 2));
  const itemMinusMeanTotal = sumArray({ arr: itemMinusMean });

  const standartDeviation = Math.sqrt(itemMinusMeanTotal / arr.length);
  return standartDeviation;
  
};

export type StandardDeviationArrayPropsType = {
  arr:Array<number>,
};

export type StandardDeviationArrayType = (props:StandardDeviationArrayPropsType) => number;