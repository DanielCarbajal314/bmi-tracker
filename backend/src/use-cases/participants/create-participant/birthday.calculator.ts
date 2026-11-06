// Approximate: the same calendar day, `age` years back, at midnight UTC.
export function birthdayFromAge(age: number, today: Date): Date {
  return new Date(Date.UTC(today.getUTCFullYear() - age, today.getUTCMonth(), today.getUTCDate()));
}
