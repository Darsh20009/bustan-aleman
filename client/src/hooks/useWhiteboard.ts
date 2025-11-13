import { useEffect, useRef, useState, useCallback } from 'react';

export interface DrawCommand {
  type: 'start' | 'draw' | 'end' | 'clear' | 'erase' | 'shape' | 'text';
  x: number;
  y: number;
  x2?: number;
  y2?: number;
  color?: string;
  lineWidth?: number;
  id?: string;
  userId?: string;
  shape?: 'rectangle' | 'circle' | 'line' | 'arrow';
  text?: string;
  filled?: boolean;
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
  const [tool, setTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'text'>('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [filled, setFilled] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

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

    if (tool === 'text') {
      const text = prompt('أدخل النص:');
      if (text) {
        context.font = `${lineWidth * 5}px Arial`;
        context.fillStyle = color;
        context.fillText(text, x, y);

        const command: DrawCommand = {
          type: 'text',
          x,
          y,
          color,
          lineWidth,
          text,
          id: `${Date.now()}-${Math.random()}`,
          userId
        };
        onSendCommand?.(command);
      }
      setIsDrawing(false);
      return;
    }

    if (['rectangle', 'circle', 'line', 'arrow'].includes(tool)) {
      setStartPoint({ x, y });
      return;
    }

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
    
    if (['rectangle', 'circle', 'line', 'arrow', 'text'].includes(tool)) {
      return;
    }

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
  }, [isDrawing, isEnabled, tool, userId, onSendCommand]);

  const stopDrawing = useCallback((x?: number, y?: number) => {
    if (!isEnabled || !contextRef.current) return;

    if (['rectangle', 'circle', 'line', 'arrow'].includes(tool) && startPoint && x !== undefined && y !== undefined) {
      const context = contextRef.current;
      const command: DrawCommand = {
        type: 'shape',
        x: startPoint.x,
        y: startPoint.y,
        x2: x,
        y2: y,
        color,
        lineWidth,
        filled,
        shape: tool as 'rectangle' | 'circle' | 'line' | 'arrow',
        id: `${Date.now()}-${Math.random()}`,
        userId
      };

      drawShape(context, command);
      onSendCommand?.(command);
      setStartPoint(null);
    }

    setIsDrawing(false);
    if (tool === 'pen' || tool === 'eraser') {
      contextRef.current.closePath();
      const command: DrawCommand = {
        type: 'end',
        x: 0,
        y: 0,
        userId
      };
      onSendCommand?.(command);
    }
  }, [isEnabled, tool, startPoint, color, lineWidth, filled, userId, onSendCommand]);

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

  const drawShape = (context: CanvasRenderingContext2D, command: DrawCommand) => {
    if (command.x2 === undefined || command.y2 === undefined) return;

    context.globalCompositeOperation = 'source-over';
    context.strokeStyle = command.color || '#000000';
    context.fillStyle = command.color || '#000000';
    context.lineWidth = command.lineWidth || 3;

    switch (command.shape) {
      case 'rectangle':
        if (command.filled) {
          context.fillRect(command.x, command.y, command.x2 - command.x, command.y2 - command.y);
        } else {
          context.strokeRect(command.x, command.y, command.x2 - command.x, command.y2 - command.y);
        }
        break;

      case 'circle':
        const radius = Math.sqrt(Math.pow(command.x2 - command.x, 2) + Math.pow(command.y2 - command.y, 2));
        context.beginPath();
        context.arc(command.x, command.y, radius, 0, 2 * Math.PI);
        if (command.filled) {
          context.fill();
        } else {
          context.stroke();
        }
        break;

      case 'line':
        context.beginPath();
        context.moveTo(command.x, command.y);
        context.lineTo(command.x2, command.y2);
        context.stroke();
        break;

      case 'arrow':
        const headlen = 15;
        const dx = command.x2 - command.x;
        const dy = command.y2 - command.y;
        const angle = Math.atan2(dy, dx);

        context.beginPath();
        context.moveTo(command.x, command.y);
        context.lineTo(command.x2, command.y2);
        context.lineTo(command.x2 - headlen * Math.cos(angle - Math.PI / 6), command.y2 - headlen * Math.sin(angle - Math.PI / 6));
        context.moveTo(command.x2, command.y2);
        context.lineTo(command.x2 - headlen * Math.cos(angle + Math.PI / 6), command.y2 - headlen * Math.sin(angle + Math.PI / 6));
        context.stroke();
        break;
    }
  };

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

      case 'shape':
        drawShape(context, command);
        break;

      case 'text':
        if (command.text) {
          context.globalCompositeOperation = 'source-over';
          context.font = `${(command.lineWidth || 3) * 5}px Arial`;
          context.fillStyle = command.color || '#000000';
          context.fillText(command.text, command.x, command.y);
        }
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
    filled,
    setFilled,
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas,
    executeRemoteCommand
  };
}
