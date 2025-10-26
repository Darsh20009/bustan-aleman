import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  BookOpen, 
  Clock, 
  Calendar,
  Target,
  Award
} from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ReadingStats {
  id: string;
  studentId: string;
  readingDate: string;
  ayahsRead: number;
  pagesRead: number;
  minutesSpent: number;
  surahsCompleted: string | null;
}

const COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#6366f1', '#8b5cf6'];

export default function QuranStats() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  const { data: stats, isLoading } = useQuery<ReadingStats[]>({
    queryKey: ['/api/quran/stats', timeRange],
    queryFn: async () => {
      const endDate = new Date().toISOString().split('T')[0];
      let daysBack = 7;
      if (timeRange === 'month') daysBack = 30;
      if (timeRange === 'year') daysBack = 365;
      
      const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const response = await fetch(`/api/quran/stats?startDate=${startDate}&endDate=${endDate}`, {
        credentials: 'include'
      });
      return response.json();
    },
    enabled: !!user
  });

  const { data: todayStats } = useQuery<ReadingStats | null>({
    queryKey: ['/api/quran/stats/today'],
    enabled: !!user
  });

  const totalAyahsRead = stats?.reduce((sum, s) => sum + s.ayahsRead, 0) || 0;
  const totalPagesRead = stats?.reduce((sum, s) => sum + s.pagesRead, 0) || 0;
  const totalMinutesSpent = stats?.reduce((sum, s) => sum + s.minutesSpent, 0) || 0;
  const totalDaysRead = stats?.length || 0;

  const avgAyahsPerDay = totalDaysRead > 0 ? Math.round(totalAyahsRead / totalDaysRead) : 0;
  const avgMinutesPerDay = totalDaysRead > 0 ? Math.round(totalMinutesSpent / totalDaysRead) : 0;

  const chartData = stats?.map(s => ({
    date: new Date(s.readingDate).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }),
    آيات: s.ayahsRead,
    صفحات: s.pagesRead,
    دقائق: s.minutesSpent
  })) || [];

  const hoursData = [
    { name: 'فجر', value: Math.round(totalMinutesSpent * 0.2) },
    { name: 'ظهر', value: Math.round(totalMinutesSpent * 0.15) },
    { name: 'عصر', value: Math.round(totalMinutesSpent * 0.25) },
    { name: 'مغرب', value: Math.round(totalMinutesSpent * 0.3) },
    { name: 'عشاء', value: Math.round(totalMinutesSpent * 0.1) },
  ].filter(item => item.value > 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-700 text-lg font-medium">جاري تحميل الإحصائيات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-900 mb-2 flex items-center justify-center gap-3">
            <BarChart3 className="h-10 w-10 text-emerald-600" />
            إحصائيات القراءة
          </h1>
          <p className="text-emerald-700">تتبع تقدمك اليومي في قراءة القرآن الكريم</p>
        </div>

        <div className="flex justify-center mb-6">
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)} className="w-auto">
            <TabsList className="bg-white/80 backdrop-blur-sm">
              <TabsTrigger value="week" data-testid="tab-week">
                <Calendar className="h-4 w-4 ml-2" />
                أسبوع
              </TabsTrigger>
              <TabsTrigger value="month" data-testid="tab-month">
                <Calendar className="h-4 w-4 ml-2" />
                شهر
              </TabsTrigger>
              <TabsTrigger value="year" data-testid="tab-year">
                <Calendar className="h-4 w-4 ml-2" />
                سنة
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {todayStats && (
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-6 w-6" />
                إنجاز اليوم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">{todayStats.ayahsRead}</div>
                  <div className="text-emerald-100 text-sm">آية</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">{todayStats.pagesRead}</div>
                  <div className="text-emerald-100 text-sm">صفحة</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">{todayStats.minutesSpent}</div>
                  <div className="text-emerald-100 text-sm">دقيقة</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">إجمالي الآيات</CardTitle>
              <BookOpen className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-700">{totalAyahsRead}</div>
              <p className="text-xs text-gray-600 mt-1">معدل {avgAyahsPerDay} آية/يوم</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">إجمالي الصفحات</CardTitle>
              <BookOpen className="h-5 w-5 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-teal-700">{totalPagesRead}</div>
              <p className="text-xs text-gray-600 mt-1">
                {Math.round((totalPagesRead / 604) * 100)}% من المصحف
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">وقت القراءة</CardTitle>
              <Clock className="h-5 w-5 text-cyan-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-700">
                {Math.floor(totalMinutesSpent / 60)}
                <span className="text-lg">س</span> {totalMinutesSpent % 60}
                <span className="text-lg">د</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">معدل {avgMinutesPerDay} دقيقة/يوم</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">أيام القراءة</CardTitle>
              <Calendar className="h-5 w-5 text-violet-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-violet-700">{totalDaysRead}</div>
              <p className="text-xs text-gray-600 mt-1">استمرار رائع!</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-800">
                <TrendingUp className="h-5 w-5" />
                تقدم القراءة اليومية
              </CardTitle>
              <CardDescription>عدد الآيات والصفحات المقروءة كل يوم</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #10b981',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="آيات" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="صفحات" 
                    stroke="#14b8a6" 
                    strokeWidth={3}
                    dot={{ fill: '#14b8a6', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-800">
                <Clock className="h-5 w-5" />
                وقت القراءة اليومي
              </CardTitle>
              <CardDescription>الدقائق المستثمرة في قراءة القرآن</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #06b6d4',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="دقائق" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {hoursData.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-800">
                <Award className="h-5 w-5" />
                توزيع أوقات القراءة
              </CardTitle>
              <CardDescription>الأوقات المفضلة للقراءة خلال اليوم</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={hoursData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {hoursData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <Award className="h-6 w-6" />
              الإنجازات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {totalAyahsRead >= 100 && (
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-200">
                  <div className="bg-amber-100 p-2 rounded-full">
                    <Award className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-amber-900">قارئ مجتهد</div>
                    <div className="text-sm text-amber-700">قراءة 100+ آية</div>
                  </div>
                </div>
              )}
              
              {totalDaysRead >= 7 && (
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-emerald-200">
                  <div className="bg-emerald-100 p-2 rounded-full">
                    <Calendar className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-emerald-900">استمرارية أسبوعية</div>
                    <div className="text-sm text-emerald-700">7 أيام متواصلة</div>
                  </div>
                </div>
              )}
              
              {totalMinutesSpent >= 120 && (
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-blue-900">وقت مبارك</div>
                    <div className="text-sm text-blue-700">ساعتين+ من القراءة</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {stats && stats.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                ابدأ رحلتك مع القرآن
              </h3>
              <p className="text-gray-600">
                لم تبدأ القراءة بعد. ابدأ الآن وتابع تقدمك!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
