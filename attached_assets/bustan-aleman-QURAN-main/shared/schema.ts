import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema if authentication is needed
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Since we're using in-memory storage, we'll define types for our Quran data
export interface Ayah {
  number: number;
  text: string;
  surah: number;
  page: number;
  juz: number;
  hizbQuarter: number;
  tafsir?: string; // إضافة التفسير
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
}

export interface QuranPage {
  page: number;
  surahs: {
    [surahNumber: string]: {
      name: string;
      ayahs: Ayah[];
    }
  };
}

export interface SearchResult {
  surah: number;
  surahName: string;
  ayah: number;
  text: string;
  tafsir?: string;
}

export interface Reciter {
  id: number;
  name: string;
  englishName: string;
  style: string;
  audioUrl: string;
}

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
