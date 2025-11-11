import { useWhiteboard, type DrawCommand } from '@/hooks/useWhiteboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Pencil, 
  Eraser, 
  Trash2, 
  Palette,
  Minus,
  Plus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useEffect, useImperativeHandle, forwardRef } from 'react';

interface LiveWhiteboardProps {
  roomToken: string;
  userId: string;
  isEnabled: boolean;
  onSendCommand: (command: DrawCommand) => void;
  onExecuteCommand: (executeFunc: (command: DrawCommand) => void) => void;
}

export const LiveWhiteboard = forwardRef<any, LiveWhiteboardProps>(({ 
  roomToken, 
  userId, 
  isEnabled, 
  onSendCommand,
  onExecuteCommand 
}, ref) => {
  const {
    canvasRef,
    tool,
    setTool,
    color,
    setColor,
    lineWidth,
    setLineWidth,
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas,
    executeRemoteCommand
  } = useWhiteboard({ 
    roomToken, 
    userId, 
    isEnabled, 
    onSendCommand 
  });

  useEffect(() => {
    onExecuteCommand(executeRemoteCommand);
  }, [executeRemoteCommand, onExecuteCommand]);

  useImperativeHandle(ref, () => ({
    executeRemoteCommand
  }));

  const colors = [
    { value: '#000000', name: 'أسود' },
    { value: '#FF0000', name: 'أحمر' },
    { value: '#0000FF', name: 'أزرق' },
    { value: '#00FF00', name: 'أخضر' },
    { value: '#FFFF00', name: 'أصفر' },
    { value: '#FF00FF', name: 'بنفسجي' },
    { value: '#FFA500', name: 'برتقالي' },
    { value: '#FFFFFF', name: 'أبيض' }
  ];

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    startDrawing(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    draw(x, y);
  };

  const handleMouseUp = () => {
    if (!isEnabled) return;
    stopDrawing();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isEnabled) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    startDrawing(x, y);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isEnabled) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    draw(x, y);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isEnabled) return;
    e.preventDefault();
    stopDrawing();
  };

  return (
    <Card className="bg-black/40 border-emerald-500/30 h-full flex flex-col">
      <CardContent className="p-4 flex-1 flex flex-col gap-3">
        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tool Selection */}
          <div className="flex gap-2">
            <Button
              size="icon"
              variant={tool === 'pen' ? 'default' : 'outline'}
              onClick={() => setTool('pen')}
              disabled={!isEnabled}
              className="bg-emerald-600 hover:bg-emerald-700"
              data-testid="button-whiteboard-pen"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant={tool === 'eraser' ? 'default' : 'outline'}
              onClick={() => setTool('eraser')}
              disabled={!isEnabled}
              className="bg-emerald-600 hover:bg-emerald-700"
              data-testid="button-whiteboard-eraser"
            >
              <Eraser className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="destructive"
              onClick={clearCanvas}
              disabled={!isEnabled}
              data-testid="button-whiteboard-clear"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Line Width */}
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setLineWidth(Math.max(1, lineWidth - 1))}
              disabled={!isEnabled}
              className="h-8 w-8"
              data-testid="button-whiteboard-decrease-width"
            >
              <Minus className="w-4 h-4 text-white" />
            </Button>
            <Badge className="bg-white/20 text-white min-w-[40px] justify-center">
              {lineWidth}
            </Badge>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setLineWidth(Math.min(20, lineWidth + 1))}
              disabled={!isEnabled}
              className="h-8 w-8"
              data-testid="button-whiteboard-increase-width"
            >
              <Plus className="w-4 h-4 text-white" />
            </Button>
          </div>

          {/* Color Palette */}
          {tool === 'pen' && (
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1">
              <Palette className="w-4 h-4 text-white" />
              <div className="flex gap-1">
                {colors.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setColor(c.value)}
                    disabled={!isEnabled}
                    className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                      color === c.value ? 'border-white ring-2 ring-white/50' : 'border-white/30'
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                    data-testid={`button-color-${c.value}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Status Badge */}
          {!isEnabled && (
            <Badge variant="destructive" className="mr-auto">
              غير مفعّل - الشيخ فقط يمكنه الرسم
            </Badge>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-white rounded-lg overflow-hidden relative">
          <canvas
            ref={canvasRef}
            className={`w-full h-full ${isEnabled ? 'cursor-crosshair' : 'cursor-not-allowed'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            data-testid="canvas-whiteboard"
          />
          {!isEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-white text-center">
                <Pencil className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold">السبورة غير مفعّلة</p>
                <p className="text-sm opacity-80">الشيخ فقط يمكنه الكتابة على السبورة</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

LiveWhiteboard.displayName = 'LiveWhiteboard';
