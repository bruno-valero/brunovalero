export default function relativeProfitMargin({ incomes, expenses }:RelativeProfitMarginPropsType):Array<number> {
  return incomes.map((val, i) => (val - expenses[i]) / val)
};

export type RelativeProfitMarginPropsType = {
  incomes:Array<number>,
  expenses:Array<number>,
};

export type RelativeProfitMarginType = (props:RelativeProfitMarginPropsType) => number;