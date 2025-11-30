import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  
  // Format: "Nov 30, 2024 at 2:45 PM"
  const dateStr = d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  
  const timeStr = d.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  return `${dateStr} at ${timeStr}`;
}

export function formatCurrency(amount: number, currency: string = "SAT"): string {
  return `${amount.toFixed(2)} ${currency}`;
}

