import { hashPassword } from "./authUtils";
import { storage } from "./storage";

const preRegisteredUsers = [
  {
    id: "sheikh_ahmad_abu_mazen",
    name: "أحمد أبو مازن",
    phoneNumber: "0549947386",
    password: "0549947386",
    role: "supervisor" as const,
  },
  {
    id: "student_yousef",
    name: "يوسف",
    phoneNumber: "0532441566",
    password: "0532441566",
    role: "student" as const,
  },
  {
    id: "student_ahmad",
    name: "أحمد",
    phoneNumber: "0532449303",
    password: "0532449303",
    role: "student" as const,
  },
  {
    id: "student_mahmoud",
    name: "محمود",
    phoneNumber: "0598765966",
    password: "0598765966",
    role: "student" as const,
  },
];

export async function initializePreRegisteredUsers() {
  try {
    const allUsers = await storage.getAllUsers();
    
    for (const preUser of preRegisteredUsers) {
      const existingUser = allUsers.find(u => u.phoneNumber === preUser.phoneNumber);
      
      if (!existingUser) {
        const hashedPassword = await hashPassword(preUser.password);
        
        const userData = {
          email: `${preUser.phoneNumber}@bustan.local`,
          firstName: preUser.name.split(' ')[0],
          lastName: preUser.name.split(' ').slice(1).join(' ') || preUser.name,
          role: preUser.role,
          passwordHash: hashedPassword,
          phoneNumber: preUser.phoneNumber,
          isActive: true,
          registrationCompleted: true,
        };

        const user = await storage.upsertUser(userData);
        
        if (preUser.role === 'student') {
          await storage.createStudent({
            userId: user.id,
            studentName: preUser.name,
            passwordHash: hashedPassword,
            dateOfBirth: null,
            grade: null,
            monthlySessionsCount: 0,
            monthlyPrice: "0",
            isPaid: false,
            isActive: true,
            memorizedSurahs: "[]",
            currentLevel: "beginner",
            notes: "طالب مسجل مسبقاً",
            zoomLink: null,
            whatsappContact: preUser.phoneNumber,
          });
        } else if (preUser.role === 'supervisor') {
          await storage.createSupervisor({
            userId: user.id,
            name: preUser.name,
            whatsappNumber: preUser.phoneNumber,
            zoomLink: null,
            specialization: "القرآن الكريم",
            experience: "شيخ معتمد",
            qualifications: "إجازة في القرآن الكريم",
            isActive: true,
          });
        }
        
        console.log(`✅ Pre-registered user initialized: ${preUser.name} (${preUser.phoneNumber})`);
      }
    }
  } catch (error) {
    console.error("Error initializing pre-registered users:", error);
  }
}
