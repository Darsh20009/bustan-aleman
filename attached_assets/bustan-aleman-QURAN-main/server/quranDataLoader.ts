import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Surah, Ayah } from '@shared/schema';

// في وضع ESM، نحتاج لاستخدام هذه الطريقة بدلاً من __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// حمل بيانات القرآن الكامل من الملف JSON
export function loadCompleteQuran(): Surah[] {
  try {
    const quranDataPath = path.join(__dirname, '../client/src/assets/quran-data.json');
    const quranDataRaw = fs.readFileSync(quranDataPath, 'utf8');
    const quranData = JSON.parse(quranDataRaw);
    
    // تحميل بيانات التفسير
    const tafsirData = loadTafsirData();
    
    // تحويل البيانات إلى صيغة التطبيق
    if (quranData && quranData.data && quranData.data.surahs) {
      return quranData.data.surahs.map((surah: any) => {
        return {
          number: surah.number,
          name: surah.name,
          englishName: surah.englishName,
          englishNameTranslation: surah.englishNameTranslation,
          revelationType: surah.revelationType,
          numberOfAyahs: surah.ayahs.length,
          ayahs: surah.ayahs.map((ayah: any, index: number) => {
            // البحث عن التفسير المناسب لهذه الآية
            const tafsir = findTafsir(tafsirData, surah.number, index + 1);
            
            return {
              number: index + 1,
              text: ayah.text,
              surah: surah.number,
              page: ayah.page || Math.ceil(surah.number * 5.3), // تقدير تقريبي للصفحة إذا لم تكن موجودة
              juz: ayah.juz || Math.ceil(surah.number / 4), // تقدير تقريبي للجزء إذا لم يكن موجود
              hizbQuarter: ayah.hizbQuarter || Math.ceil(surah.number / 2), // تقدير تقريبي لربع الحزب إذا لم يكن موجود
              tafsir: tafsir // إضافة التفسير للآية
            } as Ayah;
          })
        } as Surah;
      });
    } else {
      console.error('تنسيق بيانات القرآن غير صحيح');
      return [];
    }
  } catch (error) {
    console.error('خطأ في تحميل بيانات القرآن:', error);
    return [];
  }
}

// حمل بيانات التفسير
function loadTafsirData(): any {
  try {
    const tafsirPath = path.join(__dirname, '../client/src/assets/tafsir-data.json');
    const tafsirRaw = fs.readFileSync(tafsirPath, 'utf8');
    const tafsirData = JSON.parse(tafsirRaw);
    
    if (tafsirData && tafsirData.data && tafsirData.data.surahs) {
      return tafsirData.data.surahs;
    } else {
      console.error('تنسيق بيانات التفسير غير صحيح');
      return [];
    }
  } catch (error) {
    console.error('خطأ في تحميل بيانات التفسير:', error);
    return [];
  }
}

// البحث عن التفسير المناسب للآية
function findTafsir(tafsirData: any[], surahNumber: number, ayahNumber: number): string {
  // البحث عن السورة المطلوبة
  const surah = tafsirData.find(s => s.number === surahNumber);
  if (!surah || !surah.ayahs || !surah.ayahs[ayahNumber - 1]) {
    return '';
  }
  
  return surah.ayahs[ayahNumber - 1].text || '';
}

// حمل قائمة السور من الملف JSON
export function loadSurahList(): any[] {
  try {
    const surahListPath = path.join(__dirname, '../client/src/assets/surah-list.json');
    const surahListRaw = fs.readFileSync(surahListPath, 'utf8');
    const surahData = JSON.parse(surahListRaw);
    
    if (surahData && surahData.data) {
      return surahData.data;
    } else {
      console.error('تنسيق بيانات السور غير صحيح');
      return [];
    }
  } catch (error) {
    console.error('خطأ في تحميل قائمة السور:', error);
    return [];
  }
}

// حمل قائمة المقرئين
export function loadReciters(): any[] {
  try {
    const recitersPath = path.join(__dirname, '../client/src/assets/reciters.json');
    const recitersRaw = fs.readFileSync(recitersPath, 'utf8');
    const reciters = JSON.parse(recitersRaw);
    
    return reciters || [];
  } catch (error) {
    console.error('خطأ في تحميل قائمة المقرئين:', error);
    return [];
  }
}