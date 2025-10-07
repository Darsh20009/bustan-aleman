import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Calendar, User, ArrowRight, Megaphone } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'news' | 'announcement' | 'event' | 'important';
  authorId: string;
  authorName: string;
  createdAt: string;
  isRead: boolean;
}

export function AnnouncementsPage() {
  const [selectedType, setSelectedType] = useState<string>('all');

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['/api/announcements'],
  });

  const typeColors = {
    news: 'from-blue-500 to-cyan-500',
    announcement: 'from-purple-500 to-pink-500',
    event: 'from-amber-500 to-orange-500',
    important: 'from-rose-500 to-red-500',
  };

  const typeIcons = {
    news: Bell,
    announcement: Megaphone,
    event: Calendar,
    important: Bell,
  };

  const filteredAnnouncements = selectedType === 'all' 
    ? announcements 
    : announcements.filter((a: Announcement) => a.type === selectedType);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">جاري تحميل الإعلانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/home'}
                className="ml-4"
                data-testid="button-back"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  الإعلانات والأخبار
                </h1>
                <p className="text-gray-600 mt-1">آخر الأخبار والتحديثات من المشرفين</p>
              </div>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Bell className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-8 flex flex-wrap gap-3">
          {[
            { value: 'all', label: 'الكل', count: announcements.length },
            { value: 'important', label: 'مهم', count: announcements.filter((a: Announcement) => a.type === 'important').length },
            { value: 'news', label: 'أخبار', count: announcements.filter((a: Announcement) => a.type === 'news').length },
            { value: 'announcement', label: 'إعلانات', count: announcements.filter((a: Announcement) => a.type === 'announcement').length },
            { value: 'event', label: 'فعاليات', count: announcements.filter((a: Announcement) => a.type === 'event').length },
          ].map((tab) => (
            <Button
              key={tab.value}
              onClick={() => setSelectedType(tab.value)}
              variant={selectedType === tab.value ? 'default' : 'outline'}
              className={selectedType === tab.value 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}
              data-testid={`filter-${tab.value}`}
            >
              {tab.label} ({tab.count})
            </Button>
          ))}
        </div>

        {/* Announcements List */}
        {filteredAnnouncements.length === 0 ? (
          <Card className="text-center py-16 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent>
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد إعلانات</h3>
              <p className="text-gray-500">لم يتم نشر أي إعلانات بعد</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement: Announcement) => {
              const Icon = typeIcons[announcement.type as keyof typeof typeIcons];
              const gradient = typeColors[announcement.type as keyof typeof typeColors];
              
              return (
                <Card 
                  key={announcement.id} 
                  className={`group relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 ${!announcement.isRead ? 'border-l-4 border-emerald-500' : ''}`}
                  data-testid={`announcement-${announcement.id}`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 rounded-full -mr-16 -mt-16`}></div>
                  
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center shadow-md`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl text-gray-800">
                              {announcement.title}
                            </CardTitle>
                            {!announcement.isRead && (
                              <span className="inline-block px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-full mt-1">
                                جديد
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">
                      {announcement.content}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{announcement.authorName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(announcement.createdAt), 'PPP', { locale: ar })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
