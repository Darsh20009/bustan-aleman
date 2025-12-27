import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowPrompt(false);
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-80 z-40 animate-in slide-in-from-bottom-5">
      <div className="bg-white dark:bg-[#2A2A2A] rounded-xl shadow-2xl border border-[#D4AF37]/20 p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-bold text-[#2D5A3D] dark:text-[#D4AF37] text-sm">
              ثبت تطبيق بستان الإيمان
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              ثبت التطبيق على جهازك للوصول السريع والاستخدام دون انترنت
            </p>
          </div>
          <Button
            onClick={handleDismiss}
            size="icon"
            variant="ghost"
            className="h-8 w-8 flex-shrink-0"
            data-testid="button-dismiss-install"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleInstall}
            className="flex-1 bg-[#2D5A3D] hover:bg-[#3D7A4D] text-white text-sm h-9"
            data-testid="button-install-app"
          >
            <Download className="w-4 h-4 ml-2" />
            تثبيت الآن
          </Button>
          <Button
            onClick={handleDismiss}
            variant="outline"
            className="flex-1 text-sm h-9"
            data-testid="button-dismiss-install-later"
          >
            لاحقاً
          </Button>
        </div>
      </div>
    </div>
  );
}