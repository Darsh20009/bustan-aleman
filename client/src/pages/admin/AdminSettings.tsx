import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { AdminLayout } from './AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Settings, Globe, CreditCard, Video, Brain, Mail, Clock, Building2, Save, CheckCircle2, XCircle } from 'lucide-react';

export function AdminSettingsPage() {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/settings'],
  });

  const { data: servicesStatus } = useQuery({
    queryKey: ['/api/settings/services-status'],
  });

  const [formData, setFormData] = useState<Record<string, any>>({});

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await apiRequest('PUT', '/api/settings', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({ title: 'تم الحفظ', description: 'تم تحديث الإعدادات بنجاح' });
    },
    onError: () => {
      toast({ title: 'خطأ', description: 'فشل في تحديث الإعدادات', variant: 'destructive' });
    },
  });

  const currentSettings = { ...settings, ...formData };

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
    setFormData({});
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6" dir="rtl" data-testid="admin-settings-page">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-7 h-7 text-[#2D5A3D]" />
            <h1 className="text-2xl font-bold text-[#2D5A3D] dark:text-[#D4AF37]">إعدادات النظام</h1>
          </div>
          {Object.keys(formData).length > 0 && (
            <Button onClick={handleSave} disabled={updateMutation.isPending} className="bg-[#2D5A3D] hover:bg-[#3D7A4D]" data-testid="button-save-settings">
              <Save className="w-4 h-4 ml-2" />
              {updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          )}
        </div>

        {servicesStatus && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-3 flex items-center gap-2">
              {servicesStatus.email ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-400" />}
              <span className="text-sm">البريد الإلكتروني</span>
            </Card>
            <Card className="p-3 flex items-center gap-2">
              {servicesStatus.ai ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-400" />}
              <span className="text-sm">الذكاء الاصطناعي</span>
            </Card>
            <Card className="p-3 flex items-center gap-2">
              {servicesStatus.kirox ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-400" />}
              <span className="text-sm">نظام الحصص (كيروكس)</span>
            </Card>
            <Card className="p-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" />
              <span className="text-sm">{servicesStatus.timezone}</span>
            </Card>
          </div>
        )}

        <Tabs defaultValue="general" dir="rtl">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto">
            <TabsTrigger value="general" className="text-xs md:text-sm"><Building2 className="w-3 h-3 ml-1" />عام</TabsTrigger>
            <TabsTrigger value="time" className="text-xs md:text-sm"><Clock className="w-3 h-3 ml-1" />الوقت</TabsTrigger>
            <TabsTrigger value="payment" className="text-xs md:text-sm"><CreditCard className="w-3 h-3 ml-1" />الدفع</TabsTrigger>
            <TabsTrigger value="sessions" className="text-xs md:text-sm"><Video className="w-3 h-3 ml-1" />الحصص</TabsTrigger>
            <TabsTrigger value="ai" className="text-xs md:text-sm"><Brain className="w-3 h-3 ml-1" />الذكاء</TabsTrigger>
            <TabsTrigger value="email" className="text-xs md:text-sm"><Mail className="w-3 h-3 ml-1" />البريد</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <Card className="p-5 space-y-4">
              <h3 className="font-semibold text-[#2D5A3D]">معلومات الأكاديمية</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>اسم الأكاديمية</Label>
                  <Input value={currentSettings.academyName || ''} onChange={e => handleChange('academyName', e.target.value)} data-testid="input-academy-name" />
                </div>
                <div>
                  <Label>اسم الأكاديمية (إنجليزي)</Label>
                  <Input value={currentSettings.academyNameEn || ''} onChange={e => handleChange('academyNameEn', e.target.value)} data-testid="input-academy-name-en" />
                </div>
                <div className="md:col-span-2">
                  <Label>وصف الأكاديمية</Label>
                  <Input value={currentSettings.academyDescription || ''} onChange={e => handleChange('academyDescription', e.target.value)} data-testid="input-academy-desc" />
                </div>
                <div>
                  <Label>بريد التواصل</Label>
                  <Input value={currentSettings.contactEmail || ''} onChange={e => handleChange('contactEmail', e.target.value)} data-testid="input-contact-email" />
                </div>
                <div>
                  <Label>رقم الهاتف</Label>
                  <Input value={currentSettings.contactPhone || ''} onChange={e => handleChange('contactPhone', e.target.value)} data-testid="input-contact-phone" />
                </div>
                <div>
                  <Label>واتساب</Label>
                  <Input value={currentSettings.contactWhatsapp || ''} onChange={e => handleChange('contactWhatsapp', e.target.value)} data-testid="input-contact-whatsapp" />
                </div>
                <div>
                  <Label>أقصى عدد طلاب لكل شيخ</Label>
                  <Input type="number" value={currentSettings.maxStudentsPerSheikh || 20} onChange={e => handleChange('maxStudentsPerSheikh', parseInt(e.target.value))} data-testid="input-max-students" />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="time" className="space-y-4 mt-4">
            <Card className="p-5 space-y-4">
              <h3 className="font-semibold text-[#2D5A3D]">إعدادات التوقيت</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>المنطقة الزمنية</Label>
                  <Select value={currentSettings.timezone || 'Asia/Riyadh'} onValueChange={v => handleChange('timezone', v)}>
                    <SelectTrigger data-testid="select-timezone"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Riyadh">الرياض (توقيت السعودية)</SelectItem>
                      <SelectItem value="Asia/Dubai">دبي (توقيت الإمارات)</SelectItem>
                      <SelectItem value="Africa/Cairo">القاهرة (توقيت مصر)</SelectItem>
                      <SelectItem value="Asia/Amman">عمّان (توقيت الأردن)</SelectItem>
                      <SelectItem value="Asia/Kuwait">الكويت</SelectItem>
                      <SelectItem value="Asia/Qatar">قطر</SelectItem>
                      <SelectItem value="Asia/Bahrain">البحرين</SelectItem>
                      <SelectItem value="Europe/Istanbul">إسطنبول (توقيت تركيا)</SelectItem>
                      <SelectItem value="Asia/Kuala_Lumpur">كوالالمبور (توقيت ماليزيا)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>دقائق الغياب التلقائي</Label>
                  <Input type="number" value={currentSettings.autoAbsentMinutes || 15} onChange={e => handleChange('autoAbsentMinutes', parseInt(e.target.value))} data-testid="input-auto-absent" />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4 mt-4">
            <Card className="p-5 space-y-4">
              <h3 className="font-semibold text-[#2D5A3D]">إعدادات الدفع</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>طريقة الدفع</Label>
                  <Select value={currentSettings.paymentMethod || 'bank_transfer'} onValueChange={v => handleChange('paymentMethod', v)}>
                    <SelectTrigger data-testid="select-payment-method"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                      <SelectItem value="payment_gateway">بوابة دفع إلكتروني</SelectItem>
                      <SelectItem value="both">كلاهما</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>العملة</Label>
                  <Select value={currentSettings.currency || 'SAR'} onValueChange={v => handleChange('currency', v)}>
                    <SelectTrigger data-testid="select-currency"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAR">ريال سعودي (ر.س)</SelectItem>
                      <SelectItem value="AED">درهم إماراتي (د.إ)</SelectItem>
                      <SelectItem value="EGP">جنيه مصري (ج.م)</SelectItem>
                      <SelectItem value="USD">دولار أمريكي ($)</SelectItem>
                      <SelectItem value="KWD">دينار كويتي (د.ك)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {(currentSettings.paymentMethod === 'bank_transfer' || currentSettings.paymentMethod === 'both') && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium text-[#2D5A3D]">بيانات التحويل البنكي</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>اسم البنك</Label>
                      <Input value={currentSettings.bankName || ''} onChange={e => handleChange('bankName', e.target.value)} data-testid="input-bank-name" />
                    </div>
                    <div>
                      <Label>اسم صاحب الحساب</Label>
                      <Input value={currentSettings.bankAccountName || ''} onChange={e => handleChange('bankAccountName', e.target.value)} data-testid="input-bank-account-name" />
                    </div>
                    <div>
                      <Label>رقم الحساب</Label>
                      <Input value={currentSettings.bankAccountNumber || ''} onChange={e => handleChange('bankAccountNumber', e.target.value)} data-testid="input-bank-account" />
                    </div>
                    <div>
                      <Label>IBAN</Label>
                      <Input value={currentSettings.bankIBAN || ''} onChange={e => handleChange('bankIBAN', e.target.value)} data-testid="input-bank-iban" />
                    </div>
                    <div>
                      <Label>رابط شعار البنك (URL)</Label>
                      <Input value={currentSettings.bankLogo || ''} onChange={e => handleChange('bankLogo', e.target.value)} placeholder="https://..." data-testid="input-bank-logo" />
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4 mt-4">
            <Card className="p-5 space-y-4">
              <h3 className="font-semibold text-[#2D5A3D]">إعدادات الحصص</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>مزود الحصص المرئية</Label>
                  <Select value={currentSettings.sessionProvider || 'kirox'} onValueChange={v => handleChange('sessionProvider', v)}>
                    <SelectTrigger data-testid="select-session-provider"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kirox">كيروكس (Kirox QMeet)</SelectItem>
                      <SelectItem value="zego">ZegoCloud</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>مدة الحصة الافتراضية (دقيقة)</Label>
                  <Input type="number" value={currentSettings.sessionDuration || 30} onChange={e => handleChange('sessionDuration', parseInt(e.target.value))} data-testid="input-session-duration" />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 mt-4">
            <Card className="p-5 space-y-4">
              <h3 className="font-semibold text-[#2D5A3D]">إعدادات الذكاء الاصطناعي</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>تفعيل الذكاء الاصطناعي</Label>
                  <Switch checked={currentSettings.enableAI ?? true} onCheckedChange={v => handleChange('enableAI', v)} data-testid="switch-enable-ai" />
                </div>
                <div className="flex items-center justify-between">
                  <Label>تفعيل التسميع بالذكاء الاصطناعي</Label>
                  <Switch checked={currentSettings.enableRecitationAI ?? true} onCheckedChange={v => handleChange('enableRecitationAI', v)} data-testid="switch-enable-recitation-ai" />
                </div>
                <div className="flex items-center justify-between">
                  <Label>تفعيل اختبار تحديد المستوى</Label>
                  <Switch checked={currentSettings.enableLevelTest ?? true} onCheckedChange={v => handleChange('enableLevelTest', v)} data-testid="switch-enable-level-test" />
                </div>
                <div>
                  <Label>نوع الحفظ الافتراضي</Label>
                  <Select value={currentSettings.defaultMemorizationType || 'half_page'} onValueChange={v => handleChange('defaultMemorizationType', v)}>
                    <SelectTrigger data-testid="select-memorization-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="half_page">نصف وجه</SelectItem>
                      <SelectItem value="full_page">وجه كامل</SelectItem>
                      <SelectItem value="custom">مخصص</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>أيام المراجعة القريبة</Label>
                    <Input type="number" value={currentSettings.nearReviewDays || 3} onChange={e => handleChange('nearReviewDays', parseInt(e.target.value))} data-testid="input-near-review-days" />
                  </div>
                  <div>
                    <Label>أيام المراجعة البعيدة</Label>
                    <Input type="number" value={currentSettings.farReviewDays || 14} onChange={e => handleChange('farReviewDays', parseInt(e.target.value))} data-testid="input-far-review-days" />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-4 mt-4">
            <Card className="p-5 space-y-4">
              <h3 className="font-semibold text-[#2D5A3D]">إعدادات الإشعارات البريدية</h3>
              <div className="flex items-center justify-between">
                <Label>تفعيل الإشعارات البريدية</Label>
                <Switch checked={currentSettings.enableEmailNotifications ?? true} onCheckedChange={v => handleChange('enableEmailNotifications', v)} data-testid="switch-enable-email" />
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  لتفعيل البريد الإلكتروني، يجب إضافة مفتاح SMTP2Go في إعدادات البيئة:
                </p>
                <ul className="text-sm text-amber-600 dark:text-amber-400 mt-2 space-y-1 list-disc list-inside">
                  <li>SMTP2GO_API_KEY</li>
                  <li>SMTP2GO_FROM_EMAIL</li>
                  <li>SMTP2GO_FROM_NAME</li>
                </ul>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
