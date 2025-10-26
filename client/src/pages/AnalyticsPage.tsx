import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { EnhancedWorkspaceLayout } from '@/components/EnhancedWorkspaceLayout';

export default function AnalyticsPage() {
  return (
    <EnhancedWorkspaceLayout>
      <div className="container max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-700 dark:text-emerald-300 mb-2">
            لوحة التحليلات والإحصائيات
          </h1>
          <p className="text-muted-foreground">
            تابع تقدمك في حفظ ومراجعة القرآن الكريم
          </p>
        </div>
        <AnalyticsDashboard />
      </div>
    </EnhancedWorkspaceLayout>
  );
}
