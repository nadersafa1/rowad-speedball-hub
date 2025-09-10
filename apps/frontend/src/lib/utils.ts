import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export const getAgeGroup = (dateOfBirth: string): string => {
  const age = calculateAge(dateOfBirth);
  
  if (age < 10) return 'U10';
  if (age < 12) return 'U12';
  if (age < 14) return 'U14';
  if (age < 16) return 'U16';
  if (age < 18) return 'U18';
  if (age < 21) return 'U21';
  return 'Senior';
};

export const getTestTypeLabel = (testType: string): string => {
  switch (testType) {
    case '60_30':
      return 'Super Solo (60s/30s)';
    case '30_30':
      return 'Juniors Solo (30s/30s)';
    case '30_60':
      return 'Speed Solo (30s/60s)';
    default:
      return testType;
  }
};

