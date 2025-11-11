import { useEffect, useRef, useState, useCallback } from 'react';

export interface DrawCommand {
  type: 'start' | 'draw' | 'end' | 'clear' | 'erase';
  x: number;
  y: number;
  color?: string;
  lineWidth?: number;
  id?: string;
  userId?: string;
}

interface UseWhiteboardProps {
  roomToken: string;
  userId: string;
  isEnabled: boolean;
  onSendCommand?: (command: DrawCommand) => void;
}

export function useWhiteboard({ roomToken, userId, isEnabled, onSendCommand }: UseWhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.lineCap = 'round';
    context.lineJoin = 'round';
    contextRef.current = context;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;

      const tempCanvas = document.createElement('canvas');
      const tempContext = tempCanvas.getContext('2d');
      if (!tempContext) return;

      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      tempContext.drawImage(canvas, 0, 0);

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      if (contextRef.current) {
        contextRef.current.drawImage(tempCanvas, 0, 0);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const startDrawing = useCallback((x: number, y: number) => {
    if (!isEnabled || !contextRef.current) return;

    setIsDrawing(true);
    const context = contextRef.current;

    context.strokeStyle = tool === 'pen' ? color : '#FFFFFF';
    context.lineWidth = tool === 'pen' ? lineWidth : lineWidth * 3;
    context.globalCompositeOperation = tool === 'pen' ? 'source-over' : 'destination-out';

    context.beginPath();
    context.moveTo(x, y);

    const command: DrawCommand = {
      type: 'start',
      x,
      y,
      color: tool === 'pen' ? color : '#FFFFFF',
      lineWidth: tool === 'pen' ? lineWidth : lineWidth * 3,
      userId
    };

    onSendCommand?.(command);
  }, [isEnabled, tool, color, lineWidth, userId, onSendCommand]);

  const draw = useCallback((x: number, y: number) => {
    if (!isDrawing || !isEnabled || !contextRef.current) return;

    const context = contextRef.current;
    context.lineTo(x, y);
    context.stroke();

    const command: DrawCommand = {
      type: 'draw',
      x,
      y,
      userId
    };

    onSendCommand?.(command);
  }, [isDrawing, isEnabled, userId, onSendCommand]);

  const stopDrawing = useCallback(() => {
    if (!isEnabled || !contextRef.current) return;

    setIsDrawing(false);
    contextRef.current.closePath();

    const command: DrawCommand = {
      type: 'end',
      x: 0,
      y: 0,
      userId
    };

    onSendCommand?.(command);
  }, [isEnabled, userId, onSendCommand]);

  const clearCanvas = useCallback(() => {
    if (!contextRef.current || !canvasRef.current) return;

    const context = contextRef.current;
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const command: DrawCommand = {
      type: 'clear',
      x: 0,
      y: 0,
      userId
    };

    onSendCommand?.(command);
  }, [userId, onSendCommand]);

  const executeRemoteCommand = useCallback((command: DrawCommand) => {
    if (!contextRef.current || !canvasRef.current) return;

    const context = contextRef.current;

    switch (command.type) {
      case 'start':
        context.strokeStyle = command.color || '#000000';
        context.lineWidth = command.lineWidth || 3;
        context.globalCompositeOperation = command.color === '#FFFFFF' ? 'destination-out' : 'source-over';
        context.beginPath();
        context.moveTo(command.x, command.y);
        break;

      case 'draw':
        context.lineTo(command.x, command.y);
        context.stroke();
        break;

      case 'end':
        context.closePath();
        break;

      case 'clear':
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        break;

      case 'erase':
        context.globalCompositeOperation = 'destination-out';
        context.beginPath();
        context.arc(command.x, command.y, command.lineWidth || 10, 0, Math.PI * 2);
        context.fill();
        context.globalCompositeOperation = 'source-over';
        break;
    }
  }, []);

  return {
    canvasRef,
    isDrawing,
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
  };
}
