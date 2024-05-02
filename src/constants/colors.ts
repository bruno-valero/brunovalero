

const colors = {
  valero: (op?:number) => `rgba(14, 38, 57, ${op??1})`,
  excel: (op?:number) => `rgba(2, 114, 59, ${op??1})`,
  pdf: (op?:number) => `rgba(209, 53, 50, ${op??1})`,
  pink_lace: (op?:number) => `rgba(255, 213, 255, ${op??1})`,
  pale_lavender: (op?:number) => `rgba(234, 206, 247, ${op??1})`,
};

export default colors;