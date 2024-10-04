import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges tailwind css class names using tailwind-merge and clsx
 * @param {ClassValue[]} inputs - Class names to merge
 * @returns {string} - Merged class names
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
