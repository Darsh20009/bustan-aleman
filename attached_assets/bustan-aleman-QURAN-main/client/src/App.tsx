import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import QuranPage from "@/pages/QuranPage";
import SurahPage from "@/pages/SurahPage";
import { useState, useEffect } from "react";
import SplashScreen from "./components/SplashScreen";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/page/:pageNumber" component={QuranPage} />
      <Route path="/surah/:surahNumber" component={SurahPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Hide splash screen after 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <TooltipProvider>
      <Toaster />
      {showSplash ? <SplashScreen /> : <Router />}
    </TooltipProvider>
  );
}

export default App;
