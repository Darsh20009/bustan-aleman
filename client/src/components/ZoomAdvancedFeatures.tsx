import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Users,
  Circle as CircleIcon,
  Video as VideoIcon,
  MessageSquare,
  File,
  BarChart3,
  Share2,
  Download,
  Upload,
  Clock,
  Settings,
  UserPlus,
  Grid3x3,
  Play,
  Pause,
  Square,
  Eye,
  EyeOff
} from 'lucide-react';

interface ZoomAdvancedFeaturesProps {
  isHost: boolean;
  roomToken: string;
  participants: Array<{ userId: string; role: string; userName?: string }>;
}

interface Breakout {
  id: string;
  name: string;
  participants: string[];
}

interface Poll {
  id: string;
  question: string;
  options: string[];
  responses: Record<string, number>;
}

export default function ZoomAdvancedFeatures({ 
  isHost, 
  roomToken, 
  participants 
}: ZoomAdvancedFeaturesProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [breakoutRooms, setBreakoutRooms] = useState<Breakout[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [newBreakoutName, setNewBreakoutName] = useState('');
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['', '', '', '']);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  // Recording controls - captures canvas (whiteboard) directly
  const startRecording = async () => {
    try {
      const canvas = document.querySelector('canvas[data-testid="canvas-whiteboard"]') as HTMLCanvasElement;
      if (!canvas) {
        alert('لم يتم العثور على السبورة');
        return;
      }

      // Capture canvas stream at 30 FPS
      const canvasStream = (canvas as any).captureStream(30);
      const mediaRecorder = new MediaRecorder(canvasStream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000
      });
      
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        console.log('✅ Recording saved:', blob.size, 'bytes');
      };

      mediaRecorder.onerror = (error: any) => {
        console.error('❌ Recording error:', error);
      };

      mediaRecorder.start(1000); // Collect data every 1 second
      setMediaRecorder(mediaRecorder);
      setIsRecording(true);

      const interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      (window as any).recordingInterval = interval;
    } catch (error) {
      console.error('❌ Recording error:', error);
      alert('خطأ في بدء التسجيل: ' + (error as any).message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    setIsRecording(false);
    if ((window as any).recordingInterval) {
      clearInterval((window as any).recordingInterval);
    }
    setRecordingDuration(0);
  };

  const downloadRecording = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const shareRecordingUrl = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const shareUrl = `${window.location.origin}?recording=${encodeURIComponent(url)}`;
      navigator.clipboard.writeText(shareUrl);
      alert('تم نسخ رابط التسجيل');
    }
  };

  // Breakout rooms
  const createBreakoutRoom = () => {
    if (!newBreakoutName.trim()) return;
    const newBreakout: Breakout = {
      id: Date.now().toString(),
      name: newBreakoutName,
      participants: []
    };
    setBreakoutRooms([...breakoutRooms, newBreakout]);
    setNewBreakoutName('');
  };

  const deleteBreakoutRoom = (id: string) => {
    setBreakoutRooms(breakoutRooms.filter(room => room.id !== id));
  };

  const assignToBreakout = (roomId: string, userId: string) => {
    setBreakoutRooms(breakoutRooms.map(room => {
      if (room.id === roomId) {
        if (room.participants.includes(userId)) {
          return {
            ...room,
            participants: room.participants.filter(p => p !== userId)
          };
        } else {
          return {
            ...room,
            participants: [...room.participants, userId]
          };
        }
      }
      return room;
    }));
  };

  // Polls
  const createPoll = () => {
    if (!newPollQuestion.trim()) return;
    const filteredOptions = newPollOptions.filter(opt => opt.trim());
    if (filteredOptions.length < 2) return;

    const newPoll: Poll = {
      id: Date.now().toString(),
      question: newPollQuestion,
      options: filteredOptions,
      responses: filteredOptions.reduce((acc, opt) => ({ ...acc, [opt]: 0 }), {})
    };
    setPolls([...polls, newPoll]);
    setNewPollQuestion('');
    setNewPollOptions(['', '', '', '']);
  };

  const deletePoll = (id: string) => {
    setPolls(polls.filter(poll => poll.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      {isHost && (
        <Card className="bg-black/40 border-emerald-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <VideoIcon className="w-5 h-5" />
              التسجيل
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {isRecording ? (
                  <>
                    <Badge variant="destructive" className="animate-pulse">
                      <CircleIcon className="w-3 h-3 ml-1 fill-current" />
                      جاري التسجيل
                    </Badge>
                    <span className="text-white font-mono">
                      {formatDuration(recordingDuration)}
                    </span>
                  </>
                ) : recordedBlob ? (
                  <Badge variant="secondary" className="bg-green-600/20">
                    ✅ تم الحفظ بنجاح
                  </Badge>
                ) : (
                  <span className="text-white/60">لم يتم البدء</span>
                )}
              </div>
              <div className="flex gap-2">
                {!isRecording ? (
                  <Button
                    size="sm"
                    onClick={startRecording}
                    className="bg-red-600 hover:bg-red-700"
                    data-testid="button-start-recording"
                  >
                    <Play className="w-4 h-4 ml-2" />
                    بدء التسجيل
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={stopRecording}
                    data-testid="button-stop-recording"
                  >
                    <Square className="w-4 h-4 ml-2" />
                    إيقاف التسجيل
                  </Button>
                )}
              </div>
            </div>

            {/* Download and Share Controls */}
            {recordedBlob && !isRecording && (
              <div className="flex gap-2 pt-3 border-t border-white/10">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadRecording}
                  className="flex-1 bg-white/10 border-white/20 hover:bg-white/20"
                  data-testid="button-download-recording"
                >
                  <Download className="w-4 h-4 ml-2" />
                  تحميل التسجيل
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={shareRecordingUrl}
                  className="flex-1 bg-white/10 border-white/20 hover:bg-white/20"
                  data-testid="button-share-recording"
                >
                  <Share2 className="w-4 h-4 ml-2" />
                  مشاركة مع الطلاب
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Advanced Features Tabs */}
      <Card className="bg-black/40 border-emerald-500/30">
        <CardContent className="p-4">
          <Tabs defaultValue="breakout" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="breakout" data-testid="tab-breakout">
                <Grid3x3 className="w-4 h-4 ml-2" />
                غرف فرعية
              </TabsTrigger>
              <TabsTrigger value="polls" data-testid="tab-polls">
                <BarChart3 className="w-4 h-4 ml-2" />
                استطلاعات
              </TabsTrigger>
              <TabsTrigger value="files" data-testid="tab-files">
                <File className="w-4 h-4 ml-2" />
                الملفات
              </TabsTrigger>
            </TabsList>

            {/* Breakout Rooms */}
            <TabsContent value="breakout">
              <div className="space-y-4">
                {isHost && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="اسم الغرفة الفرعية"
                      value={newBreakoutName}
                      onChange={(e) => setNewBreakoutName(e.target.value)}
                      className="bg-white/10 text-white border-white/20"
                      data-testid="input-breakout-name"
                    />
                    <Button 
                      onClick={createBreakoutRoom}
                      data-testid="button-create-breakout"
                    >
                      <UserPlus className="w-4 h-4 ml-2" />
                      إنشاء
                    </Button>
                  </div>
                )}

                <div className="space-y-3">
                  {breakoutRooms.length === 0 ? (
                    <div className="text-center py-8 text-white/60">
                      <Grid3x3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>لا توجد غرف فرعية</p>
                      {isHost && <p className="text-sm">قم بإنشاء غرف لتقسيم المشاركين</p>}
                    </div>
                  ) : (
                    breakoutRooms.map((room) => (
                      <Card key={room.id} className="bg-white/5 border-white/10">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-white text-sm">
                              {room.name}
                            </CardTitle>
                            {isHost && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteBreakoutRoom(room.id)}
                                data-testid={`button-delete-breakout-${room.id}`}
                              >
                                حذف
                              </Button>
                            )}
                          </div>
                          <Badge variant="secondary" className="w-fit text-xs">
                            {room.participants.length} مشارك
                          </Badge>
                        </CardHeader>
                        {isHost && (
                          <CardContent className="pt-0">
                            <div className="space-y-2">
                              {participants.map(p => (
                                <div
                                  key={p.userId}
                                  className="flex items-center justify-between p-2 bg-white/5 rounded"
                                >
                                  <span className="text-white text-sm">
                                    {p.userName || p.userId}
                                  </span>
                                  <Switch
                                    checked={room.participants.includes(p.userId)}
                                    onCheckedChange={() => assignToBreakout(room.id, p.userId)}
                                    data-testid={`switch-assign-${p.userId}-${room.id}`}
                                  />
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Polls */}
            <TabsContent value="polls">
              <div className="space-y-4">
                {isHost && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full"
                        data-testid="button-new-poll"
                      >
                        <BarChart3 className="w-4 h-4 ml-2" />
                        إنشاء استطلاع جديد
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>إنشاء استطلاع</DialogTitle>
                        <DialogDescription>
                          أضف سؤال استطلاع مع الخيارات
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>السؤال</Label>
                          <Textarea
                            placeholder="اكتب سؤال الاستطلاع..."
                            value={newPollQuestion}
                            onChange={(e) => setNewPollQuestion(e.target.value)}
                            data-testid="input-poll-question"
                          />
                        </div>
                        <div>
                          <Label>الخيارات</Label>
                          <div className="space-y-2">
                            {newPollOptions.map((option, index) => (
                              <Input
                                key={index}
                                placeholder={`الخيار ${index + 1}`}
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...newPollOptions];
                                  newOptions[index] = e.target.value;
                                  setNewPollOptions(newOptions);
                                }}
                                data-testid={`input-poll-option-${index}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={createPoll} data-testid="button-create-poll">
                          إنشاء الاستطلاع
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                <div className="space-y-3">
                  {polls.length === 0 ? (
                    <div className="text-center py-8 text-white/60">
                      <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>لا توجد استطلاعات</p>
                      {isHost && <p className="text-sm">قم بإنشاء استطلاع لجمع الآراء</p>}
                    </div>
                  ) : (
                    polls.map((poll) => (
                      <Card key={poll.id} className="bg-white/5 border-white/10">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-white text-sm">
                              {poll.question}
                            </CardTitle>
                            {isHost && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deletePoll(poll.id)}
                                data-testid={`button-delete-poll-${poll.id}`}
                              >
                                حذف
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {poll.options.map((option, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-white/5 rounded"
                              >
                                <span className="text-white text-sm">{option}</span>
                                <Badge variant="secondary">
                                  {poll.responses[option] || 0} صوت
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            {/* File Sharing */}
            <TabsContent value="files">
              <div className="space-y-4">
                {isHost && (
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      data-testid="button-upload-file"
                    >
                      <Upload className="w-4 h-4 ml-2" />
                      رفع ملف
                    </Button>
                    <Button 
                      variant="outline"
                      data-testid="button-share-screen"
                    >
                      <Share2 className="w-4 h-4 ml-2" />
                      مشاركة
                    </Button>
                  </div>
                )}

                <div className="text-center py-8 text-white/60">
                  <File className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>لا توجد ملفات مشاركة</p>
                  {isHost && <p className="text-sm">قم برفع الملفات لمشاركتها مع الطلاب</p>}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Subtitles/Captions */}
      <Card className="bg-black/40 border-emerald-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showSubtitles ? (
                <Eye className="w-5 h-5 text-white" />
              ) : (
                <EyeOff className="w-5 h-5 text-white/60" />
              )}
              <div>
                <p className="text-white font-medium">الترجمة التلقائية</p>
                <p className="text-white/60 text-sm">عرض النصوص المباشرة</p>
              </div>
            </div>
            <Switch
              checked={showSubtitles}
              onCheckedChange={setShowSubtitles}
              data-testid="switch-subtitles"
            />
          </div>
          {showSubtitles && (
            <div className="mt-4 p-3 bg-black/60 rounded-lg">
              <p className="text-white/80 text-sm text-center">
                الترجمة التلقائية قيد التطوير...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
