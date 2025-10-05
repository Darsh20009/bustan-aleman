import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

interface ClientConnection {
  ws: WebSocket;
  userId: string;
  role: 'student' | 'supervisor' | 'admin';
  studentId?: string;
}

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, ClientConnection> = new Map();

  initialize(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req) => {
      console.log('New WebSocket connection');

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleMessage(ws, data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });

    console.log('✅ WebSocket server initialized on /ws');
  }

  private handleMessage(ws: WebSocket, data: any) {
    const { type, payload } = data;

    switch (type) {
      case 'auth':
        this.handleAuth(ws, payload);
        break;
      case 'student_update':
        this.broadcastToSupervisors(payload);
        break;
      case 'supervisor_update':
        this.sendToStudent(payload.studentId, payload);
        break;
      case 'session_control':
        this.handleSessionControl(payload);
        break;
      case 'error_notification':
        this.broadcastToSupervisors(payload);
        break;
      default:
        console.log('Unknown message type:', type);
    }
  }

  private handleAuth(ws: WebSocket, payload: any) {
    const { userId, role, studentId } = payload;
    
    this.clients.set(userId, {
      ws,
      userId,
      role,
      studentId,
    });

    console.log(`User ${userId} authenticated as ${role}`);
    
    ws.send(JSON.stringify({
      type: 'auth_success',
      payload: { userId, role }
    }));
  }

  private handleDisconnect(ws: WebSocket) {
    this.clients.forEach((client, userId) => {
      if (client.ws === ws) {
        this.clients.delete(userId);
        console.log(`User ${userId} disconnected`);
      }
    });
  }

  private broadcastToSupervisors(payload: any) {
    this.clients.forEach((client, userId) => {
      if (client.role === 'supervisor' || client.role === 'admin') {
        client.ws.send(JSON.stringify({
          type: 'student_notification',
          payload
        }));
      }
    });
  }

  private sendToStudent(studentId: string, payload: any) {
    this.clients.forEach((client, userId) => {
      if (client.studentId === studentId) {
        client.ws.send(JSON.stringify({
          type: 'supervisor_notification',
          payload
        }));
      }
    });
  }

  private handleSessionControl(payload: any) {
    const { studentId, action, data } = payload;
    this.sendToStudent(studentId, {
      type: 'session_control',
      action,
      data
    });
  }

  public notifySheikhOfNewStudent(studentData: any) {
    this.broadcastToSupervisors({
      type: 'new_student',
      student: studentData
    });
  }

  public notifyStudentOfUpdate(studentId: string, updateData: any) {
    this.sendToStudent(studentId, {
      type: 'profile_update',
      data: updateData
    });
  }

  public enableSessionAccess(studentId: string, sessionData: any) {
    this.sendToStudent(studentId, {
      type: 'session_enabled',
      data: sessionData
    });
  }
}

export const wsService = new WebSocketService();
