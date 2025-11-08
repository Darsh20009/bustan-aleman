import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, Database, FileJson, Trash2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DataStats {
  students: number;
  courses: number;
  sessions: number;
  payments: number;
}

export default function DataManagement() {
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);

  // Fetch data statistics
  const { data: stats, isLoading: statsLoading } = useQuery<DataStats>({
    queryKey: ['/api/data/stats'],
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/data/export');
      if (!response.ok) {
        throw new Error('Failed to export data');
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Download the JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bustan-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "تم التصدير بنجاح",
        description: "تم تنزيل البيانات في ملف JSON",
      });
    },
    onError: () => {
      toast({
        title: "فشل التصدير",
        description: "حدث خطأ أثناء تصدير البيانات",
        variant: "destructive",
      });
    },
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/data/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to import data');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الاستيراد بنجاح",
        description: "تم استيراد البيانات بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/data/stats'] });
      setImporting(false);
    },
    onError: () => {
      toast({
        title: "فشل الاستيراد",
        description: "حدث خطأ أثناء استيراد البيانات",
        variant: "destructive",
      });
      setImporting(false);
    },
  });

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setImporting(true);
        importMutation.mutate(data);
      } catch (error) {
        toast({
          title: "خطأ في الملف",
          description: "الملف غير صالح أو تالف",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-primary">
              <Database className="w-6 h-6" />
              <h1 className="text-3xl font-bold">إدارة البيانات</h1>
            </div>
            <p className="text-muted-foreground">
              استيراد وتصدير بيانات المنصة
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الطلاب</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : stats?.students || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الدورات</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : stats?.courses || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الحصص</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : stats?.sessions || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المدفوعات</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : stats?.payments || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                <CardTitle>تصدير البيانات</CardTitle>
              </div>
              <CardDescription>
                تنزيل جميع بيانات المنصة في ملف JSON
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Alert>
                <FileJson className="h-4 w-4" />
                <AlertDescription>
                  سيتم تصدير جميع البيانات بما في ذلك الطلاب، الدورات، الحصص، والمدفوعات
                </AlertDescription>
              </Alert>
              <Button
                onClick={() => exportMutation.mutate()}
                disabled={exportMutation.isPending}
                data-testid="button-export-data"
              >
                {exportMutation.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    جاري التصدير...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    تصدير البيانات
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Import Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                <CardTitle>استيراد البيانات</CardTitle>
              </div>
              <CardDescription>
                رفع ملف JSON لاستيراد البيانات
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Alert>
                <Trash2 className="h-4 w-4" />
                <AlertDescription className="text-destructive">
                  تحذير: سيتم استبدال جميع البيانات الحالية بالبيانات الموجودة في الملف
                </AlertDescription>
              </Alert>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  disabled={importing || importMutation.isPending}
                  className="hidden"
                  id="file-upload"
                  data-testid="input-import-file"
                />
                <label htmlFor="file-upload">
                  <Button
                    asChild
                    disabled={importing || importMutation.isPending}
                    data-testid="button-import-data"
                  >
                    <span>
                      {importing || importMutation.isPending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          جاري الاستيراد...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          اختيار ملف للاستيراد
                        </>
                      )}
                    </span>
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
