import { users, type User, type InsertUser, type Surah, type QuranPage, type SearchResult, type Reciter } from "@shared/schema";
import { loadCompleteQuran, loadSurahList, loadReciters } from "./quranDataLoader";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Quran specific methods
  getAllSurahs(): Promise<any[]>;
  getSurahInfo(surahNumber: number): Promise<any>;
  getSurah(surahNumber: number): Promise<Surah | undefined>;
  getPage(pageNumber: number): Promise<QuranPage | undefined>;
  searchQuran(query: string): Promise<SearchResult[]>;
  
  // المقرئين والتفسير
  getReciters(): Promise<Reciter[]>;
  getReciter(id: number): Promise<Reciter | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private quran: Surah[];
  private surahs: any[];
  private reciters: Reciter[];
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    this.quran = loadCompleteQuran();
    this.surahs = loadSurahList();
    this.reciters = loadReciters();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllSurahs(): Promise<any[]> {
    return this.surahs;
  }

  async getSurahInfo(surahNumber: number): Promise<any> {
    return this.surahs.find(surah => surah.number === surahNumber);
  }

  async getSurah(surahNumber: number): Promise<Surah | undefined> {
    return this.quran.find(surah => surah.number === surahNumber);
  }

  async getPage(pageNumber: number): Promise<QuranPage | undefined> {
    // Organize ayahs by page number
    const result: QuranPage = {
      page: pageNumber,
      surahs: {}
    };

    for (const surah of this.quran) {
      const ayahsOnPage = surah.ayahs.filter(ayah => ayah.page === pageNumber);
      
      if (ayahsOnPage.length > 0) {
        result.surahs[surah.number] = {
          name: surah.name,
          ayahs: ayahsOnPage
        };
      }
    }

    // If no ayahs found on this page, return undefined
    if (Object.keys(result.surahs).length === 0) {
      return undefined;
    }

    return result;
  }

  async searchQuran(query: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const normalizedQuery = query.trim().toLowerCase();

    for (const surah of this.quran) {
      for (const ayah of surah.ayahs) {
        if (ayah.text.toLowerCase().includes(normalizedQuery)) {
          results.push({
            surah: surah.number,
            surahName: surah.name,
            ayah: ayah.number,
            text: ayah.text,
            tafsir: ayah.tafsir
          });
        }
      }
    }

    // Limit results to 10 for performance
    return results.slice(0, 10);
  }
  
  // طرق الوصول للمقرئين
  async getReciters(): Promise<Reciter[]> {
    return this.reciters;
  }
  
  async getReciter(id: number): Promise<Reciter | undefined> {
    return this.reciters.find(reciter => reciter.id === id);
  }
}

export const storage = new MemStorage();
