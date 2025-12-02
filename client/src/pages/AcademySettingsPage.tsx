import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { 
  Settings, 
  Palette, 
  Globe, 
  Bell, 
  Building, 
  Clock,
  Save,
  Upload,
  RefreshCw
} from 'lucide-react';

interface AcademySettings {
  id: string;
  academyName: string;
  academyNameEn: string;
  logoUrl: string;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headerText: string | null;
  footerText: string | null;
  aboutUs: string | null;
  aboutUsEn: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  address: string | null;
  socialFacebook: string | null;
  socialTwitter: string | null;
  socialInstagram: string | null;
  socialYoutube: string | null;
  socialTelegram: string | null;
  defaultLanguage: string;
  enableEnglish: boolean;
  enableNotifications: boolean;
  enableEmailNotifications: boolean;
  enableSmsNotifications: boolean;
  enableWhatsappNotifications: boolean;
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: string[];
  currency: string;
  currencySymbol: string;
  timezone: string;
}

const defaultSettings: AcademySettings = {
  id: '',
  academyName: 'بستان الإيمان',
  academyNameEn: 'Bustan Al-Iman',
  logoUrl: '/logo.png',
  faviconUrl: null,
  primaryColor: '#10b981',
  secondaryColor: '#f97316',
  accentColor: '#083530',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  headerText: null,
  footerText: null,
  aboutUs: null,
  aboutUsEn: null,
  contactEmail: null,
  contactPhone: null,
  contactWhatsapp: null,
  address: null,
  socialFacebook: null,
  socialTwitter: null,
  socialInstagram: null,
  socialYoutube: null,
  socialTelegram: null,
  defaultLanguage: 'ar',
  enableEnglish: true,
  enableNotifications: true,
  enableEmailNotifications: false,
  enableSmsNotifications: false,
  enableWhatsappNotifications: false,
  workingHoursStart: '08:00',
  workingHoursEnd: '22:00',
  workingDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
  currency: 'SAR',
  currencySymbol: 'ريال',
  timezone: 'Asia/Riyadh',
};

export default function AcademySettingsPage() {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  const { data: settings, isLoading } = useQuery<AcademySettings>({
    queryKey: ['/api/academy-settings'],
  });

  const [formData, setFormData] = useState<AcademySettings>(settings || defaultSettings);

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<AcademySettings>) => {
      return await apiRequest('PUT', '/api/academy-settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/academy-settings'] });
      toast({
        title: isRTL ? 'تم الحفظ' : 'Saved',
        description: isRTL ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully',
      });
    },
    onError: () => {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في حفظ الإعدادات' : 'Failed to save settings',
        variant: 'destructive',
      });
    },
  });

  const handleChange = (field: keyof AcademySettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleDayToggle = (day: string) => {
    const currentDays = formData.workingDays || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    handleChange('workingDays', newDays);
  };

  const days = [
    { key: 'sunday', ar: 'الأحد', en: 'Sunday' },
    { key: 'monday', ar: 'الإثنين', en: 'Monday' },
    { key: 'tuesday', ar: 'الثلاثاء', en: 'Tuesday' },
    { key: 'wednesday', ar: 'الأربعاء', en: 'Wednesday' },
    { key: 'thursday', ar: 'الخميس', en: 'Thursday' },
    { key: 'friday', ar: 'الجمعة', en: 'Friday' },
    { key: 'saturday', ar: 'السبت', en: 'Saturday' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-emerald-800 flex items-center gap-3">
              <Settings className="w-8 h-8" />
              {isRTL ? 'إعدادات الأكاديمية' : 'Academy Settings'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isRTL ? 'تخصيص هوية الأكاديمية والإعدادات العامة' : 'Customize academy branding and general settings'}
            </p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={updateMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700"
            data-testid="button-save-settings"
          >
            <Save className="w-4 h-4 me-2" />
            {updateMutation.isPending 
              ? (isRTL ? 'جاري الحفظ...' : 'Saving...') 
              : (isRTL ? 'حفظ الإعدادات' : 'Save Settings')}
          </Button>
        </div>

        <Tabs defaultValue="branding" className="space-y-6">
          <TabsList className="grid grid-cols-5 gap-2 bg-white/50 p-1 rounded-lg">
            <TabsTrigger value="branding" className="flex items-center gap-2" data-testid="tab-branding">
              <Building className="w-4 h-4" />
              {isRTL ? 'الهوية' : 'Branding'}
            </TabsTrigger>
            <TabsTrigger value="colors" className="flex items-center gap-2" data-testid="tab-colors">
              <Palette className="w-4 h-4" />
              {isRTL ? 'الألوان' : 'Colors'}
            </TabsTrigger>
            <TabsTrigger value="language" className="flex items-center gap-2" data-testid="tab-language">
              <Globe className="w-4 h-4" />
              {isRTL ? 'اللغة' : 'Language'}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2" data-testid="tab-notifications">
              <Bell className="w-4 h-4" />
              {isRTL ? 'الإشعارات' : 'Notifications'}
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2" data-testid="tab-schedule">
              <Clock className="w-4 h-4" />
              {isRTL ? 'الجدول' : 'Schedule'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  {isRTL ? 'هوية الأكاديمية' : 'Academy Branding'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'تخصيص اسم وشعار الأكاديمية' : 'Customize academy name and logo'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>{isRTL ? 'اسم الأكاديمية (عربي)' : 'Academy Name (Arabic)'}</Label>
                    <Input 
                      value={formData.academyName} 
                      onChange={(e) => handleChange('academyName', e.target.value)}
                      placeholder="بستان الإيمان"
                      data-testid="input-academy-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'اسم الأكاديمية (إنجليزي)' : 'Academy Name (English)'}</Label>
                    <Input 
                      value={formData.academyNameEn} 
                      onChange={(e) => handleChange('academyNameEn', e.target.value)}
                      placeholder="Bustan Al-Iman"
                      data-testid="input-academy-name-en"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{isRTL ? 'رابط الشعار' : 'Logo URL'}</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={formData.logoUrl} 
                      onChange={(e) => handleChange('logoUrl', e.target.value)}
                      placeholder="/logo.png"
                      data-testid="input-logo-url"
                    />
                    <Button variant="outline" size="icon">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.logoUrl && (
                    <div className="mt-4 p-4 bg-gray-100 rounded-lg flex items-center justify-center">
                      <img 
                        src={formData.logoUrl} 
                        alt="Logo Preview" 
                        className="max-h-24 object-contain"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>{isRTL ? 'البريد الإلكتروني للتواصل' : 'Contact Email'}</Label>
                    <Input 
                      type="email"
                      value={formData.contactEmail || ''} 
                      onChange={(e) => handleChange('contactEmail', e.target.value)}
                      placeholder="info@academy.com"
                      data-testid="input-contact-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'رقم الهاتف' : 'Contact Phone'}</Label>
                    <Input 
                      value={formData.contactPhone || ''} 
                      onChange={(e) => handleChange('contactPhone', e.target.value)}
                      placeholder="+966xxxxxxxxx"
                      data-testid="input-contact-phone"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{isRTL ? 'رقم الواتساب' : 'WhatsApp Number'}</Label>
                  <Input 
                    value={formData.contactWhatsapp || ''} 
                    onChange={(e) => handleChange('contactWhatsapp', e.target.value)}
                    placeholder="+966xxxxxxxxx"
                    data-testid="input-contact-whatsapp"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{isRTL ? 'العنوان' : 'Address'}</Label>
                  <Textarea 
                    value={formData.address || ''} 
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder={isRTL ? 'أدخل عنوان الأكاديمية' : 'Enter academy address'}
                    data-testid="input-address"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{isRTL ? 'نبذة عن الأكاديمية (عربي)' : 'About Us (Arabic)'}</Label>
                  <Textarea 
                    value={formData.aboutUs || ''} 
                    onChange={(e) => handleChange('aboutUs', e.target.value)}
                    placeholder={isRTL ? 'نبذة مختصرة عن الأكاديمية' : 'Brief description about the academy'}
                    rows={4}
                    data-testid="input-about-us"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{isRTL ? 'نبذة عن الأكاديمية (إنجليزي)' : 'About Us (English)'}</Label>
                  <Textarea 
                    value={formData.aboutUsEn || ''} 
                    onChange={(e) => handleChange('aboutUsEn', e.target.value)}
                    placeholder="Brief description about the academy"
                    rows={4}
                    data-testid="input-about-us-en"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label>Facebook</Label>
                    <Input 
                      value={formData.socialFacebook || ''} 
                      onChange={(e) => handleChange('socialFacebook', e.target.value)}
                      placeholder="URL"
                      data-testid="input-social-facebook"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Twitter</Label>
                    <Input 
                      value={formData.socialTwitter || ''} 
                      onChange={(e) => handleChange('socialTwitter', e.target.value)}
                      placeholder="URL"
                      data-testid="input-social-twitter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Instagram</Label>
                    <Input 
                      value={formData.socialInstagram || ''} 
                      onChange={(e) => handleChange('socialInstagram', e.target.value)}
                      placeholder="URL"
                      data-testid="input-social-instagram"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>YouTube</Label>
                    <Input 
                      value={formData.socialYoutube || ''} 
                      onChange={(e) => handleChange('socialYoutube', e.target.value)}
                      placeholder="URL"
                      data-testid="input-social-youtube"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telegram</Label>
                    <Input 
                      value={formData.socialTelegram || ''} 
                      onChange={(e) => handleChange('socialTelegram', e.target.value)}
                      placeholder="URL"
                      data-testid="input-social-telegram"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="colors">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  {isRTL ? 'ألوان الأكاديمية' : 'Academy Colors'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'تخصيص ألوان الموقع والهوية البصرية' : 'Customize website colors and visual identity'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>{isRTL ? 'اللون الأساسي' : 'Primary Color'}</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color"
                        value={formData.primaryColor} 
                        onChange={(e) => handleChange('primaryColor', e.target.value)}
                        className="w-16 h-10 p-1"
                        data-testid="input-primary-color"
                      />
                      <Input 
                        value={formData.primaryColor} 
                        onChange={(e) => handleChange('primaryColor', e.target.value)}
                        placeholder="#10b981"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'اللون الثانوي' : 'Secondary Color'}</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color"
                        value={formData.secondaryColor} 
                        onChange={(e) => handleChange('secondaryColor', e.target.value)}
                        className="w-16 h-10 p-1"
                        data-testid="input-secondary-color"
                      />
                      <Input 
                        value={formData.secondaryColor} 
                        onChange={(e) => handleChange('secondaryColor', e.target.value)}
                        placeholder="#f97316"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'لون التمييز' : 'Accent Color'}</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color"
                        value={formData.accentColor} 
                        onChange={(e) => handleChange('accentColor', e.target.value)}
                        className="w-16 h-10 p-1"
                        data-testid="input-accent-color"
                      />
                      <Input 
                        value={formData.accentColor} 
                        onChange={(e) => handleChange('accentColor', e.target.value)}
                        placeholder="#083530"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'لون الخلفية' : 'Background Color'}</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color"
                        value={formData.backgroundColor} 
                        onChange={(e) => handleChange('backgroundColor', e.target.value)}
                        className="w-16 h-10 p-1"
                        data-testid="input-background-color"
                      />
                      <Input 
                        value={formData.backgroundColor} 
                        onChange={(e) => handleChange('backgroundColor', e.target.value)}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'لون النص' : 'Text Color'}</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color"
                        value={formData.textColor} 
                        onChange={(e) => handleChange('textColor', e.target.value)}
                        className="w-16 h-10 p-1"
                        data-testid="input-text-color"
                      />
                      <Input 
                        value={formData.textColor} 
                        onChange={(e) => handleChange('textColor', e.target.value)}
                        placeholder="#1f2937"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-6 rounded-lg border" style={{ 
                  backgroundColor: formData.backgroundColor,
                  color: formData.textColor 
                }}>
                  <h3 className="text-lg font-bold mb-4">{isRTL ? 'معاينة الألوان' : 'Color Preview'}</h3>
                  <div className="flex gap-4 flex-wrap">
                    <Button style={{ backgroundColor: formData.primaryColor, color: '#fff' }}>
                      {isRTL ? 'زر أساسي' : 'Primary Button'}
                    </Button>
                    <Button style={{ backgroundColor: formData.secondaryColor, color: '#fff' }}>
                      {isRTL ? 'زر ثانوي' : 'Secondary Button'}
                    </Button>
                    <Button style={{ backgroundColor: formData.accentColor, color: '#fff' }}>
                      {isRTL ? 'زر مميز' : 'Accent Button'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="language">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  {isRTL ? 'إعدادات اللغة' : 'Language Settings'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'تخصيص اللغات المتاحة في الموقع' : 'Customize available languages on the website'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-base">{isRTL ? 'تفعيل اللغة الإنجليزية' : 'Enable English Language'}</Label>
                    <p className="text-sm text-gray-500">
                      {isRTL ? 'السماح للمستخدمين بتبديل اللغة إلى الإنجليزية' : 'Allow users to switch to English language'}
                    </p>
                  </div>
                  <Switch 
                    checked={formData.enableEnglish}
                    onCheckedChange={(checked) => handleChange('enableEnglish', checked)}
                    data-testid="switch-enable-english"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{isRTL ? 'اللغة الافتراضية' : 'Default Language'}</Label>
                  <div className="flex gap-4">
                    <Button
                      variant={formData.defaultLanguage === 'ar' ? 'default' : 'outline'}
                      onClick={() => handleChange('defaultLanguage', 'ar')}
                      data-testid="button-default-arabic"
                    >
                      العربية
                    </Button>
                    <Button
                      variant={formData.defaultLanguage === 'en' ? 'default' : 'outline'}
                      onClick={() => handleChange('defaultLanguage', 'en')}
                      disabled={!formData.enableEnglish}
                      data-testid="button-default-english"
                    >
                      English
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>{isRTL ? 'العملة' : 'Currency'}</Label>
                    <Input 
                      value={formData.currency} 
                      onChange={(e) => handleChange('currency', e.target.value)}
                      placeholder="SAR"
                      data-testid="input-currency"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'رمز العملة' : 'Currency Symbol'}</Label>
                    <Input 
                      value={formData.currencySymbol} 
                      onChange={(e) => handleChange('currencySymbol', e.target.value)}
                      placeholder="ريال"
                      data-testid="input-currency-symbol"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{isRTL ? 'المنطقة الزمنية' : 'Timezone'}</Label>
                  <Input 
                    value={formData.timezone} 
                    onChange={(e) => handleChange('timezone', e.target.value)}
                    placeholder="Asia/Riyadh"
                    data-testid="input-timezone"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  {isRTL ? 'إعدادات الإشعارات' : 'Notification Settings'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'تخصيص طرق إرسال الإشعارات للمستخدمين' : 'Customize notification delivery methods'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-base">{isRTL ? 'تفعيل الإشعارات' : 'Enable Notifications'}</Label>
                    <p className="text-sm text-gray-500">
                      {isRTL ? 'إرسال إشعارات داخل الموقع' : 'Send in-app notifications'}
                    </p>
                  </div>
                  <Switch 
                    checked={formData.enableNotifications}
                    onCheckedChange={(checked) => handleChange('enableNotifications', checked)}
                    data-testid="switch-enable-notifications"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-base">{isRTL ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}</Label>
                    <p className="text-sm text-gray-500">
                      {isRTL ? 'إرسال إشعارات عبر البريد الإلكتروني' : 'Send notifications via email'}
                    </p>
                  </div>
                  <Switch 
                    checked={formData.enableEmailNotifications}
                    onCheckedChange={(checked) => handleChange('enableEmailNotifications', checked)}
                    data-testid="switch-enable-email-notifications"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-base">{isRTL ? 'إشعارات SMS' : 'SMS Notifications'}</Label>
                    <p className="text-sm text-gray-500">
                      {isRTL ? 'إرسال إشعارات عبر الرسائل النصية' : 'Send notifications via SMS'}
                    </p>
                  </div>
                  <Switch 
                    checked={formData.enableSmsNotifications}
                    onCheckedChange={(checked) => handleChange('enableSmsNotifications', checked)}
                    data-testid="switch-enable-sms-notifications"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-base">{isRTL ? 'إشعارات الواتساب' : 'WhatsApp Notifications'}</Label>
                    <p className="text-sm text-gray-500">
                      {isRTL ? 'إرسال إشعارات عبر الواتساب' : 'Send notifications via WhatsApp'}
                    </p>
                  </div>
                  <Switch 
                    checked={formData.enableWhatsappNotifications}
                    onCheckedChange={(checked) => handleChange('enableWhatsappNotifications', checked)}
                    data-testid="switch-enable-whatsapp-notifications"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {isRTL ? 'ساعات العمل' : 'Working Hours'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'تحديد أوقات العمل وأيام الدوام' : 'Set working hours and business days'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>{isRTL ? 'بداية الدوام' : 'Working Hours Start'}</Label>
                    <Input 
                      type="time"
                      value={formData.workingHoursStart} 
                      onChange={(e) => handleChange('workingHoursStart', e.target.value)}
                      data-testid="input-working-hours-start"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'نهاية الدوام' : 'Working Hours End'}</Label>
                    <Input 
                      type="time"
                      value={formData.workingHoursEnd} 
                      onChange={(e) => handleChange('workingHoursEnd', e.target.value)}
                      data-testid="input-working-hours-end"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>{isRTL ? 'أيام العمل' : 'Working Days'}</Label>
                  <div className="grid grid-cols-7 gap-2">
                    {days.map((day) => (
                      <Button
                        key={day.key}
                        variant={(formData.workingDays || []).includes(day.key) ? 'default' : 'outline'}
                        onClick={() => handleDayToggle(day.key)}
                        className="text-sm"
                        data-testid={`button-day-${day.key}`}
                      >
                        {isRTL ? day.ar : day.en}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
