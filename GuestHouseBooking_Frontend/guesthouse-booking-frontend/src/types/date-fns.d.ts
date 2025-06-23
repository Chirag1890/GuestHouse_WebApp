declare module 'date-fns' {
  export function format(date: Date | number, formatStr: string): string;
  export function parse(date: string, formatStr: string, referenceDate?: Date): Date;
  export function isValid(date: any): boolean;
  export function addDays(date: Date | number, amount: number): Date;
  export function subDays(date: Date | number, amount: number): Date;
  export function isBefore(date: Date | number, dateToCompare: Date | number): boolean;
  export function isAfter(date: Date | number, dateToCompare: Date | number): boolean;
  export function isEqual(date: Date | number, dateToCompare: Date | number): boolean;
  export function startOfDay(date: Date | number): Date;
  export function endOfDay(date: Date | number): Date;
  export function differenceInDays(dateLeft: Date | number, dateRight: Date | number): number;
} 