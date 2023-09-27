export function shortenHexStr(str: string) {
  return `${str.slice(0, 4)}...${str.slice(-4)}`;
}

export function shortenStr(str: string, length: number) {
  if (str.length <= length) {
    return str;
  }
  return `${str.slice(0, length)}...`;
}
