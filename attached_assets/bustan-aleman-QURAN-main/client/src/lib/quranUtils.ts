// Convert number to Arabic numeral
export const toArabicNumeral = (num: number): string => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)]).join('');
};

// Get next surah number
export const getNextSurah = (currentSurah: number): number | null => {
  return currentSurah < 114 ? currentSurah + 1 : null;
};

// Get previous surah number
export const getPreviousSurah = (currentSurah: number): number | null => {
  return currentSurah > 1 ? currentSurah - 1 : null;
};

// Get page by surah and ayah
export const getPageBySurahAndAyah = (surah: number, ayah: number): number => {
  // This is a simplified mapping. In a real app, you would have a more accurate mapping
  // This is just an estimation for demo purposes
  if (surah === 1) return 1;
  if (surah === 2) {
    if (ayah <= 74) return 2;
    if (ayah <= 141) return 3;
    if (ayah <= 252) return 4;
    return 5;
  }
  
  // For simplicity, estimate page number based on surah number
  // In a real app, you would have a proper mapping of surah and ayah to page
  return Math.min(Math.ceil(surah * 5.3), 604);
};

// Format surah data for display
export interface FormattedSurah {
  number: number;
  name: string;
  arabicName: string;
  ayahCount: number;
  revelationType: string;
}

// Determine if URL is an ayah
export const isAyahUrl = (url: string): boolean => {
  return /\/surah\/\d+\/\d+/.test(url);
};
