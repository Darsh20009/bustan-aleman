import fs from 'fs/promises';
import path from 'path';

// JSON data directory
const DATA_DIR = path.join(process.cwd(), 'data');

interface Student {
  id: string;
  studentName: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth: string;
  age: number;
  grade?: string;
  memorizedSurahs: string[];
  errors: StudentError[];
  sessions: StudentSession[];
  payments: StudentPayment[];
  schedules: ClassSchedule[];
  currentLevel: string;
  notes: string;
  zoomLink: string;
  createdAt: string;
  isActive: boolean;
}

interface StudentError {
  id: string;
  surah: string;
  ayahNumber: number;
  errorType: string;
  errorDescription: string;
  isResolved: boolean;
  createdAt: string;
}

interface StudentSession {
  id: string;
  sessionNumber: number;
  sessionDate: string;
  sessionTime: string;
  evaluationGrade: string;
  nextSessionDate: string;
  newMaterial: string;
  reviewMaterial: string;
  notes: string;
  attended: boolean;
  createdAt: string;
}

interface StudentPayment {
  id: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  subscriptionPeriod: string;
  sessionsIncluded: number;
  sessionsRemaining: number;
  expiryDate: string;
  status: string;
  notes: string;
  createdAt: string;
}

interface ClassSchedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  zoomLink: string;
  isActive: boolean;
}

class JSONStorage {
  constructor() {
    this.ensureDataDirectory();
  }

  private async ensureDataDirectory() {
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private async readFile<T>(filename: string): Promise<T[]> {
    try {
      const filepath = path.join(DATA_DIR, filename);
      const data = await fs.readFile(filepath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private async writeFile<T>(filename: string, data: T[]): Promise<void> {
    const filepath = path.join(DATA_DIR, filename);
    await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
  }

  // Student operations
  async createStudent(studentData: Omit<Student, 'id' | 'createdAt'>): Promise<Student> {
    const students = await this.readFile<Student>('students.json');
    const student: Student = {
      ...studentData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    
    students.push(student);
    await this.writeFile('students.json', students);
    return student;
  }

  async getStudent(id: string): Promise<Student | null> {
    const students = await this.readFile<Student>('students.json');
    return students.find(s => s.id === id) || null;
  }

  async getAllStudents(): Promise<Student[]> {
    return this.readFile<Student>('students.json');
  }

  async authenticateStudent(email: string, password: string): Promise<Student | null> {
    const students = await this.readFile<Student>('students.json');
    return students.find(s => s.email === email && s.password === password && s.isActive) || null;
  }

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student | null> {
    const students = await this.readFile<Student>('students.json');
    const index = students.findIndex(s => s.id === id);
    
    if (index === -1) return null;
    
    students[index] = { ...students[index], ...updates };
    await this.writeFile('students.json', students);
    return students[index];
  }

  // Student errors
  async addStudentError(studentId: string, error: Omit<StudentError, 'id' | 'createdAt'>): Promise<StudentError> {
    const students = await this.readFile<Student>('students.json');
    const studentIndex = students.findIndex(s => s.id === studentId);
    
    if (studentIndex === -1) throw new Error('Student not found');
    
    const newError: StudentError = {
      ...error,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    
    students[studentIndex].errors.push(newError);
    await this.writeFile('students.json', students);
    return newError;
  }

  // Student sessions
  async addStudentSession(studentId: string, session: Omit<StudentSession, 'id' | 'createdAt'>): Promise<StudentSession> {
    const students = await this.readFile<Student>('students.json');
    const studentIndex = students.findIndex(s => s.id === studentId);
    
    if (studentIndex === -1) throw new Error('Student not found');
    
    const newSession: StudentSession = {
      ...session,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    
    students[studentIndex].sessions.push(newSession);
    await this.writeFile('students.json', students);
    return newSession;
  }

  // WhatsApp integration helper
  async sendToWhatsApp(phoneNumber: string, message: string): Promise<boolean> {
    // This is a placeholder for WhatsApp API integration
    // In a real implementation, you would use WhatsApp Business API
    console.log(`Sending to ${phoneNumber}: ${message}`);
    
    // For now, we'll just log the registration data
    const registrations = await this.readFile<any>('whatsapp_registrations.json');
    registrations.push({
      phone: phoneNumber,
      message,
      timestamp: new Date().toISOString(),
    });
    await this.writeFile('whatsapp_registrations.json', registrations);
    
    return true;
  }

  // Initialize with default students (Yousef and Mohamed)
  async initializeDefaultStudents(): Promise<void> {
    const students = await this.readFile<Student>('students.json');
    
    if (students.length > 0) return; // Already initialized
    
    // Create Yousef Darwish
    const yousefStudent: Student = {
      id: 'yousef_darwish_001',
      studentName: 'يوسف درويش',
      email: 'yousef.darwish@example.com',
      password: '182009',
      phone: '+966532441566',
      dateOfBirth: '2009-08-18',
      age: 16,
      grade: 'الثاني الثانوي',
      memorizedSurahs: ['البقرة', 'آل عمران'],
      errors: [
        {
          id: 'err_001',
          surah: 'البقرة',
          ayahNumber: 285,
          errorType: 'recitation',
          errorDescription: 'خطأ في التلاوة - البقرة آية 285',
          isResolved: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'err_002',
          surah: 'البقرة',
          ayahNumber: 217,
          errorType: 'recitation',
          errorDescription: 'خطأ في التلاوة - البقرة آية 217',
          isResolved: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'err_003',
          surah: 'البقرة',
          ayahNumber: 15,
          errorType: 'recitation',
          errorDescription: 'خطأ في التلاوة - البقرة آية 15',
          isResolved: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'err_004',
          surah: 'آل عمران',
          ayahNumber: 1,
          errorType: 'recitation',
          errorDescription: 'خطأ في التلاوة - آل عمران آية 1',
          isResolved: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'err_005',
          surah: 'آل عمران',
          ayahNumber: 5,
          errorType: 'recitation',
          errorDescription: 'خطأ في التلاوة - آل عمران آية 5',
          isResolved: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'err_006',
          surah: 'آل عمران',
          ayahNumber: 6,
          errorType: 'recitation',
          errorDescription: 'خطأ في التلاوة - آل عمران آية 6',
          isResolved: false,
          createdAt: new Date().toISOString(),
        },
      ],
      sessions: [
        {
          id: 'session_001',
          sessionNumber: 3,
          sessionDate: '2025-08-23',
          sessionTime: '4:00 PM',
          evaluationGrade: 'جيد',
          nextSessionDate: '2025-08-24',
          newMaterial: 'يوم الأحد سورة آل عمران إلى الآية (180) فلما أحس',
          reviewMaterial: 'يوم الأربعاء أربع أرباع من قوله تعالى (ليس عليك هداهم...) البقرة',
          notes: 'مستوى الحفظ اليوم ممتاز ولكن يريد التميز أكثر',
          attended: true,
          createdAt: new Date().toISOString(),
        },
      ],
      payments: [
        {
          id: 'payment_001',
          amount: '60.00',
          currency: 'SAR',
          paymentMethod: 'whatsapp',
          subscriptionPeriod: 'monthly',
          sessionsIncluded: 16,
          sessionsRemaining: 13,
          expiryDate: '2025-09-23',
          status: 'active',
          notes: 'مدفوع عن طريق الواتساب',
          createdAt: new Date().toISOString(),
        },
      ],
      schedules: [
        {
          id: 'schedule_001',
          dayOfWeek: 6, // Saturday
          startTime: '16:00',
          endTime: '17:00',
          zoomLink: 'https://us05web.zoom.us/j/2150630036?pwd=lQD4VAFswkSMSIb5PqbkgxpR1waZVg.1&omn=81643358315#success',
          isActive: true,
        },
        {
          id: 'schedule_002',
          dayOfWeek: 2, // Tuesday
          startTime: '16:00',
          endTime: '17:00',
          zoomLink: 'https://us05web.zoom.us/j/2150630036?pwd=lQD4VAFswkSMSIb5PqbkgxpR1waZVg.1&omn=81643358315#success',
          isActive: true,
        },
        {
          id: 'schedule_003',
          dayOfWeek: 3, // Wednesday
          startTime: '16:00',
          endTime: '17:00',
          zoomLink: 'https://us05web.zoom.us/j/2150630036?pwd=lQD4VAFswkSMSIb5PqbkgxpR1waZVg.1&omn=81643358315#success',
          isActive: true,
        },
        {
          id: 'schedule_004',
          dayOfWeek: 4, // Thursday
          startTime: '16:00',
          endTime: '17:00',
          zoomLink: 'https://us05web.zoom.us/j/2150630036?pwd=lQD4VAFswkSMSIb5PqbkgxpR1waZVg.1&omn=81643358315#success',
          isActive: true,
        },
      ],
      currentLevel: 'advanced',
      notes: 'طالب متميز، حافظ سورة البقرة وآل عمران. مستوى الحفظ ممتاز لكن يريد التميز أكثر',
      zoomLink: 'https://us05web.zoom.us/j/2150630036?pwd=lQD4VAFswkSMSIb5PqbkgxpR1waZVg.1&omn=81643358315#success',
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    // Create Mohamed Ahmed
    const mohamedStudent: Student = {
      id: 'mohamed_ahmed_001',
      studentName: 'محمد أحمد',
      email: 'mohamed.ahmed@example.com',
      password: '123789',
      phone: '+966532441566',
      dateOfBirth: '2010-01-01',
      age: 15,
      grade: 'غير محدد',
      memorizedSurahs: [],
      errors: [],
      sessions: [],
      payments: [
        {
          id: 'payment_002',
          amount: '30.00',
          currency: 'SAR',
          paymentMethod: 'whatsapp',
          subscriptionPeriod: 'monthly',
          sessionsIncluded: 8,
          sessionsRemaining: 8,
          expiryDate: '2025-09-23',
          status: 'active',
          notes: 'مدفوع عن طريق الواتساب',
          createdAt: new Date().toISOString(),
        },
      ],
      schedules: [
        {
          id: 'schedule_005',
          dayOfWeek: 0, // Sunday
          startTime: '18:00',
          endTime: '19:00',
          zoomLink: 'https://us05web.zoom.us/j/2150630036?pwd=lQD4VAFswkSMSIb5PqbkgxpR1waZVg.1&omn=81643358315#success',
          isActive: true,
        },
        {
          id: 'schedule_006',
          dayOfWeek: 6, // Saturday
          startTime: '18:00',
          endTime: '19:00',
          zoomLink: 'https://us05web.zoom.us/j/2150630036?pwd=lQD4VAFswkSMSIb5PqbkgxpR1waZVg.1&omn=81643358315#success',
          isActive: true,
        },
      ],
      currentLevel: 'beginner',
      notes: 'طالب جديد، لم يكمل أي حصة بعد. سيبدأ من سورة الناس، الفلق، الإخلاص',
      zoomLink: 'https://us05web.zoom.us/j/2150630036?pwd=lQD4VAFswkSMSIb5PqbkgxpR1waZVg.1&omn=81643358315#success',
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    const allStudents = [yousefStudent, mohamedStudent];
    await this.writeFile('students.json', allStudents);
  }
}

export const jsonStorage = new JSONStorage();