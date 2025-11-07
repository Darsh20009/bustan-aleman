
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
      console.log('🔌 New WebSocket connection');

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleMessage(ws, data);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });

      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
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
      case 'new_student_registration':
        this.notifySheikhOfNewStudent(payload);
        break;
      case 'assignment_update':
        this.sendToStudent(payload.studentId, {
          type: 'assignment_updated',
          data: payload
        });
        break;
      case 'session_enable':
        this.handleSessionEnable(payload);
        break;
      case 'error_notification':
        this.broadcastToSupervisors({
          type: 'student_error',
          data: payload
        });
        break;
      default:
        console.log('⚠️ Unknown message type:', type);
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

    console.log(`✅ User ${userId} authenticated as ${role}`);
    
    ws.send(JSON.stringify({
      type: 'auth_success',
      payload: { userId, role }
    }));
  }

  private handleDisconnect(ws: WebSocket) {
    this.clients.forEach((client, userId) => {
      if (client.ws === ws) {
        this.clients.delete(userId);
        console.log(`👋 User ${userId} disconnected`);
      }
    });
  }

  private broadcastToSupervisors(payload: any) {
    this.clients.forEach((client) => {
      if (client.role === 'supervisor' || client.role === 'admin') {
        client.ws.send(JSON.stringify({
          type: 'student_notification',
          payload
        }));
      }
    });
  }

  private sendToStudent(studentId: string, payload: any) {
    this.clients.forEach((client) => {
      if (client.studentId === studentId) {
        client.ws.send(JSON.stringify(payload));
      }
    });
  }

  private handleSessionEnable(payload: any) {
    const { studentId, sessionData } = payload;
    this.sendToStudent(studentId, {
      type: 'session_enabled',
      data: sessionData
    });
  }

  // Public methods for external use
  public notifySheikhOfNewStudent(studentData: any) {
    this.broadcastToSupervisors({
      type: 'new_student',
      student: studentData,
      timestamp: new Date().toISOString()
    });
  }

  public notifyStudentOfAssignment(studentId: string, assignment: any) {
    this.sendToStudent(studentId, {
      type: 'new_assignment',
      data: assignment
    });
  }

  public enableSessionAccess(studentId: string, sessionData: any) {
    this.sendToStudent(studentId, {
      type: 'session_enabled',
      data: sessionData
    });
  }

  public notifyStudentOfCertificate(studentId: string, certificate: any) {
    this.sendToStudent(studentId, {
      type: 'certificate_issued',
      data: certificate
    });
  }

  public notifyStudentOfPayment(studentId: string, payment: any) {
    this.sendToStudent(studentId, {
      type: 'payment_received',
      data: payment
    });
  }

  public notifyStudentOfMeeting(studentId: string, meeting: any) {
    this.sendToStudent(studentId, {
      type: 'meeting_scheduled',
      data: meeting
    });
  }
}

export const wsService = new WebSocketService();
