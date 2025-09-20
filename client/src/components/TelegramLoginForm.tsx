import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MessageCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TelegramLoginFormProps {
  onSuccess: (user: any) => void;
  onCancel: () => void;
}

export function TelegramLoginForm({ onSuccess, onCancel }: TelegramLoginFormProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('يرجى إدخال كود تسجيل الدخول');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/telegram/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل في تسجيل الدخول');
      }

      toast({
        title: "نجح تسجيل الدخول!",
        description: `مرحباً ${data.user.firstName} ${data.user.lastName}`,
      });

      onSuccess(data.user);
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      setError(error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  const openTelegramBot = () => {
    // الرابط الصحيح للبوت الذي يعمل في النظام
    window.open('https://t.me/BustanAlImanEducationBot', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            تسجيل الدخول عبر التليجرام
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">
            استخدم بوت التليجرام للحصول على كود تسجيل الدخول الآمن
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* التعليمات */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
              <CheckCircle2 className="w-5 h-5 ml-2" />
              خطوات تسجيل الدخول:
            </h3>
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex items-start">
                <span className="font-bold ml-2">1.</span>
                <span>افتح بوت التليجرام من الرابط أدناه</span>
              </div>
              <div className="flex items-start">
                <span className="font-bold ml-2">2.</span>
                <span>أرسل الأمر /start للبوت</span>
              </div>
              <div className="flex items-start">
                <span className="font-bold ml-2">3.</span>
                <span>احصل على كود تسجيل الدخول (6 أحرف)</span>
              </div>
              <div className="flex items-start">
                <span className="font-bold ml-2">4.</span>
                <span>أدخل الكود في الحقل أدناه</span>
              </div>
            </div>
          </div>

          {/* زر فتح بوت التليجرام */}
          <Button
            type="button"
            onClick={openTelegramBot}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 text-lg font-semibold"
            data-testid="button-telegram-bot"
          >
            <ExternalLink className="w-5 h-5 ml-2" />
            فتح بوت بستان الإيمان
          </Button>

          {/* نموذج إدخال الكود */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-code" className="block text-sm font-medium text-gray-700 mb-2">
                كود تسجيل الدخول (6 أحرف)
              </label>
              <Input
                id="login-code"
                type="text"
                placeholder="مثال: ABC123"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-lg font-mono tracking-widest uppercase"
                data-testid="input-login-code"
              />
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700 text-right">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                disabled={isLoading || !code.trim()}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 text-lg font-semibold disabled:opacity-50"
                data-testid="button-submit-login"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    جاري التحقق من الكود...
                  </>
                ) : (
                  'تسجيل الدخول'
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="w-full"
                data-testid="button-cancel"
              >
                العودة
              </Button>
            </div>
          </form>

          {/* معلومات إضافية */}
          <div className="text-center text-sm text-gray-500 border-t pt-4">
            <p>🔒 تسجيل الدخول آمن ومشفر</p>
            <p>⏱️ الكود صالح لمدة 5 دقائق فقط</p>
            <p>📱 للدعم: +966532441566</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}