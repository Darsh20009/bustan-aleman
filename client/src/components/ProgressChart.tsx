import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export interface ProgressData {
  week: string[];
  daily: { date: string; ayahs: number; time: number }[];
  memorized: number;
  inReview: number;
  notStarted: number;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export function ProgressChart({ data }: { data: ProgressData }) {
  const weeklyStats = data.week.map((day, idx) => ({
    day,
    ayahs: Math.floor(Math.random() * 30) + 10,
    review: Math.floor(Math.random() * 10) + 5,
  }));

  const total = data.memorized + data.inReview + data.notStarted;

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">الإحصائيات العامة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data.memorized}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">آية محفوظة</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{data.inReview}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">قيد المراجعة</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{data.notStarted}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">لم تبدأ</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">نشاط هذا الأسبوع</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="ayahs" fill="#10b981" name="الآيات المحفوظة" />
              <Bar dataKey="review" fill="#f59e0b" name="المراجعات" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Progress Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">توزيع التقدم</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <ResponsiveContainer width="100%" height={300} minWidth={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'محفوظ', value: data.memorized },
                    { name: 'مراجعة', value: data.inReview },
                    { name: 'لم يبدأ', value: data.notStarted }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                  dataKey="value"
                >
                  {COLORS.map((color) => (
                    <Cell key={`cell`} fill={color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-3 md:w-48">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-600" />
                <div>
                  <p className="text-sm font-medium">محفوظ</p>
                  <p className="text-xs text-gray-600">{Math.round((data.memorized / total) * 100)}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-600" />
                <div>
                  <p className="text-sm font-medium">مراجعة</p>
                  <p className="text-xs text-gray-600">{Math.round((data.inReview / total) * 100)}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600" />
                <div>
                  <p className="text-sm font-medium">لم يبدأ</p>
                  <p className="text-xs text-gray-600">{Math.round((data.notStarted / total) * 100)}%</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">أهداف هذا الأسبوع</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium">حفظ 5 آيات جديدة</p>
              <span className="text-xs text-gray-600">3/5</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium">مراجعة 10 آيات</p>
              <span className="text-xs text-gray-600">7/10</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-amber-600 h-2 rounded-full" style={{ width: '70%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium">الدراسة 5 أيام</p>
              <span className="text-xs text-gray-600">4/5</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}