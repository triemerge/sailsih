/** Format number with Indian comma placement (e.g., 12,34,567). */
export function formatIndianNumber(num) {
  if (num === null || num === undefined) return '0';

  const numStr = Math.abs(num).toString();
  const [intPart, decPart] = numStr.split('.');

  if (intPart.length <= 3) {
    return (num < 0 ? '-' : '') + intPart + (decPart ? '.' + decPart : '');
  }

  let result = intPart.slice(-3);
  let remaining = intPart.slice(0, -3);

  while (remaining.length > 0) {
    result = remaining.slice(-2) + ',' + result;
    remaining = remaining.slice(0, -2);
  }

  if (decPart) result += '.' + decPart;

  return num < 0 ? '-' + result : result;
}
