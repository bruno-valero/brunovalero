export default function moneyMask(num:number):string {
  return 'R$' + num.toFixed(2).split('.').map(n => !n ? '00' : n).join(',');
}