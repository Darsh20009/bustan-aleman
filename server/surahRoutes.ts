import type { Express } from "express";
import fs from 'fs';
import path from 'path';

export function setupSurahRoutes(app: Express) {
  // Get surah list
  app.get('/api/surahs', async (_req, res) => {
    try {
      const surahPath = path.join(process.cwd(), 'client/src/assets/surah-list.json');
      
      if (fs.existsSync(surahPath)) {
        const surahData = JSON.parse(fs.readFileSync(surahPath, 'utf8'));
        res.json(surahData);
      } else {
        // Return minimal fallback data if file doesn't exist
        res.json({
          code: 200,
          status: "OK",
          data: generateFallbackSurahs()
        });
      }
    } catch (error) {
      console.error("Error fetching surahs:", error);
      res.status(500).json({ message: "خطأ في جلب قائمة السور" });
    }
  });
}

function generateFallbackSurahs() {
  const surahs = [
    { number: 1, name: "سُورَةُ ٱلْفَاتِحَةِ", englishName: "Al-Faatiha", englishNameTranslation: "The Opening", numberOfAyahs: 7, revelationType: "Meccan" },
    { number: 2, name: "سُورَةُ ٱلْبَقَرَةِ", englishName: "Al-Baqara", englishNameTranslation: "The Cow", numberOfAyahs: 286, revelationType: "Medinan" },
    { number: 3, name: "سُورَةُ آلِ عِمْرَانَ", englishName: "Aal-i-Imraan", englishNameTranslation: "The Family of Imraan", numberOfAyahs: 200, revelationType: "Medinan" },
    { number: 4, name: "سُورَةُ ٱلنِّسَاءِ", englishName: "An-Nisaa", englishNameTranslation: "The Women", numberOfAyahs: 176, revelationType: "Medinan" },
    { number: 5, name: "سُورَةُ ٱلْمَائِدَةِ", englishName: "Al-Maaida", englishNameTranslation: "The Table", numberOfAyahs: 120, revelationType: "Medinan" },
    { number: 6, name: "سُورَةُ ٱلْأَنْعَامِ", englishName: "Al-An'aam", englishNameTranslation: "The Cattle", numberOfAyahs: 165, revelationType: "Meccan" },
    // Add more surahs as needed...
  ];
  
  return surahs;
}
