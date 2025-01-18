import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type BusinessHours = string[];

export const isBusinessOpen = (hours: BusinessHours): boolean => {
  const now = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayHours = hours?.find(h => h.startsWith(dayNames[now.getDay()]));

  if (!todayHours || todayHours.includes('Closed')) {
    return false;
  }

  const timeMatch = todayHours.match(/(\d{1,2}:\d{2}\s*[AP]M)\s*[–-]\s*(\d{1,2}:\d{2}\s*[AP]M)/i);
  if (!timeMatch) {
    return false;
  }

  const [_, openTimeStr, closeTimeStr] = timeMatch;
  const openTime = parseTimeString(openTimeStr);
  const closeTime = parseTimeString(closeTimeStr);

  // Handle cases where closing time is after midnight
  if (closeTime < openTime) {
    closeTime.setDate(closeTime.getDate() + 1);
  }

  const currentTime = getCurrentTime();
  return currentTime >= openTime && currentTime <= closeTime;
};

const parseTimeString = (timeStr: string): Date => {
  const [time, period] = timeStr.trim().split(/\s+/);
  const [hours, minutes] = time.split(':').map(Number);
  
  let adjustedHours = hours;
  
  // Convert to 24-hour format
  if (period.toUpperCase() === 'PM' && hours !== 12) {
    adjustedHours += 12;
  } else if (period.toUpperCase() === 'AM' && hours === 12) {
    adjustedHours = 0;
  }
  
  const today = new Date();
  return new Date(
    today.getFullYear(),
    today.getMonth(), 
    today.getDate(),
    adjustedHours,
    minutes
  );
};

const getCurrentTime = (): Date => {
  const now = new Date();
  now.setSeconds(0);
  now.setMilliseconds(0);
  return now;
};