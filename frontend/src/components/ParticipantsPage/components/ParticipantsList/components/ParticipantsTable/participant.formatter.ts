export function formatMeasure(value: number): string {
  return value.toFixed(2);
}

export function formatBmi(bmi: number): string {
  return bmi.toFixed(1);
}

// Date and time in the viewer's own timezone, e.g. "8/24/2025, 3:16:40 PM".
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString('en-US');
}
