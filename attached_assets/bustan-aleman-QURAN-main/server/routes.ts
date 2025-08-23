import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to get all surahs info
  app.get("/api/surahs", async (req, res) => {
    try {
      const surahs = await storage.getAllSurahs();
      res.json(surahs);
    } catch (error) {
      res.status(500).json({ message: "Error fetching surahs", error });
    }
  });

  // API endpoint to get specific surah info
  app.get("/api/surahs/:surahNumber", async (req, res) => {
    try {
      const surahNumber = parseInt(req.params.surahNumber);
      const surah = await storage.getSurahInfo(surahNumber);
      
      if (!surah) {
        return res.status(404).json({ message: "Surah not found" });
      }
      
      res.json(surah);
    } catch (error) {
      res.status(500).json({ message: "Error fetching surah info", error });
    }
  });

  // API endpoint to get complete surah with all ayahs
  app.get("/api/quran/surah/:surahNumber", async (req, res) => {
    try {
      const surahNumber = parseInt(req.params.surahNumber);
      const surah = await storage.getSurah(surahNumber);
      
      if (!surah) {
        return res.status(404).json({ message: "Surah not found" });
      }
      
      res.json(surah);
    } catch (error) {
      res.status(500).json({ message: "Error fetching surah", error });
    }
  });

  // API endpoint to get page of the Quran
  app.get("/api/quran/page/:pageNumber", async (req, res) => {
    try {
      const pageNumber = parseInt(req.params.pageNumber);
      const page = await storage.getPage(pageNumber);
      
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      
      res.json(page);
    } catch (error) {
      res.status(500).json({ message: "Error fetching page", error });
    }
  });

  // API endpoint to search the Quran
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const results = await storage.searchQuran(query);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Error searching Quran", error });
    }
  });
  
  // API endpoint to get all reciters
  app.get("/api/reciters", async (req, res) => {
    try {
      const reciters = await storage.getReciters();
      res.json(reciters);
    } catch (error) {
      res.status(500).json({ message: "Error fetching reciters", error });
    }
  });
  
  // API endpoint to get specific reciter
  app.get("/api/reciters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reciter = await storage.getReciter(id);
      
      if (!reciter) {
        return res.status(404).json({ message: "Reciter not found" });
      }
      
      res.json(reciter);
    } catch (error) {
      res.status(500).json({ message: "Error fetching reciter", error });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
