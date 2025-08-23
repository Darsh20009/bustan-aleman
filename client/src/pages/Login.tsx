import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { BookOpen, LogIn } from "lucide-react";

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-islamic-green mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحقق من حالة تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="islamic-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-islamic-green rounded-full flex items-center justify-center">
                <BookOpen className="text-white" size={32} />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold font-arabic-serif text-islamic-green">
              تسجيل الدخول
            </CardTitle>
            <p className="text-gray-600 mt-2">
              مرحبًا بك في بستان الإيمان
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-700 mb-6 arabic-text">
                سجل دخولك للوصول إلى دوراتك وتتبع تقدمك في حفظ القرآن الكريم
              </p>
              
              <Button 
                onClick={() => window.location.href = "/api/login"}
                className="btn-islamic-primary w-full py-3 text-lg font-semibold"
                data-testid="button-login"
              >
                <LogIn className="ml-2" size={20} />
                تسجيل الدخول
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                ليس لديك حساب؟{" "}
                <button 
                  onClick={() => setLocation("/register")}
                  className="text-islamic-green hover:underline font-semibold"
                  data-testid="link-register"
                >
                  أنشئ حسابًا جديدًا
                </button>
              </p>
            </div>

            <div className="border-t pt-6">
              <div className="text-center">
                <button 
                  onClick={() => setLocation("/")}
                  className="text-gray-500 hover:text-islamic-green transition-colors"
                  data-testid="link-back-home"
                >
                  العودة للصفحة الرئيسية
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="mt-8 grid grid-cols-1 gap-4">
          <Card className="islamic-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-reverse space-x-3">
                <BookOpen className="text-islamic-green" size={24} />
                <div>
                  <h3 className="font-semibold">حفظ القرآن الكريم</h3>
                  <p className="text-sm text-gray-600">تتبع تقدمك في الحفظ</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="islamic-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-reverse space-x-3">
                <LogIn className="text-warm-gold" size={24} />
                <div>
                  <h3 className="font-semibold">الدورات التعليمية</h3>
                  <p className="text-sm text-gray-600">التسجيل في الدورات الإسلامية</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
