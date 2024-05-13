export default function percentEncode(text:string) {
  return text.replaceAll('%', '[percent]');
}

export function percentDecode(text:string) {
  return text.replaceAll('[percent]', '%');
}