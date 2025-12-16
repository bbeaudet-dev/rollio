/**
 * Format numbers with commas for thousands, millions, billions
 * For trillions and above, use "1.000 Trillion" notation
 */
export function formatNumber(num: number): string {
  // Handle Infinity
  if (!isFinite(num)) {
    if (num === Infinity) {
      return 'Infinity';
    }
    if (num === -Infinity) {
      return '-Infinity';
    }
    return 'NaN';
  }
  
  if (num < 0) {
    return '-' + formatNumber(-num);
  }
  
  if (num < 1000) {
    return num.toString();
  }
  
  if (num < 1000000) {
    // Thousands: 5,345
    return num.toLocaleString('en-US');
  }
  
  if (num < 1000000000) {
    // Millions: 1,234,567
    return num.toLocaleString('en-US');
  }
  
  if (num < 1000000000000) {
    // Billions: 1,234,567,890
    return num.toLocaleString('en-US');
  }
  
  // Trillions and above: 1.000 Trillion, 2.500 Quadrillion, etc.
  const trillion = 1000000000000;
  const quadrillion = 1000000000000000;
  const quintillion = 1000000000000000000;
  
  if (num < quadrillion) {
    const trillions = num / trillion;
    return `${trillions.toFixed(3)} Trillion`;
  }
  
  if (num < quintillion) {
    const quadrillions = num / quadrillion;
    return `${quadrillions.toFixed(3)} Quadrillion`;
  }
  
  // For numbers >= quintillion, use e notation
  // Calculate how many times we need to divide by 1e100
  let eCount = 0;
  let remaining = num;
  const e100 = 1e100;
  
  while (remaining >= e100) {
    remaining = remaining / e100;
    eCount++;
  }
  
  if (eCount === 0) {
    // Just one e100 division needed
    const value = num / e100;
    return `${value.toFixed(3)} e100`;
  } else {
    // Multiple e100 divisions - use ee notation
    const value = remaining;
    return `${value.toFixed(3)} e100${' e100'.repeat(eCount)}`;
  }
}

