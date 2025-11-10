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
    console.log("🔐 Initializing pre-registered users...");
    const allUsers = await storage.getAllUsers();

    // First pass: create all users
    for (const preUser of preRegisteredUsers) {
      try {
        const existingUser = allUsers.find(u => u.phoneNumber === preUser.phoneNumber);

        if (!existingUser) {
          // Hash password before storing
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

          // Create supervisor record for supervisor users
          if (preUser.role === 'supervisor') {
            await storage.createSupervisor({
              userId: user.id,
              name: preUser.name,
              whatsappNumber: preUser.phoneNumber,
              specialization: "القرآن الكريم",
              experience: "شيخ معتمد",
              qualifications: "إجازة في القرآن الكريم",
              isActive: true,
            });
          }

          console.log(`✅ Pre-registered user initialized: ${preUser.name} (${preUser.phoneNumber})`);
        } else {
          console.log(`ℹ️  User already exists: ${preUser.name} (${preUser.phoneNumber})`);
        }
      } catch (userError) {
        console.error(`Error initializing user ${preUser.name}:`, userError);
      }
    }

    // Second pass: create student records and assign to default sheikh
    const updatedAllUsers = await storage.getAllUsers();
    const defaultSheikh = updatedAllUsers.find(u => u.phoneNumber === "0549947386");

    if (!defaultSheikh) {
      console.warn("⚠️  Default sheikh not found, students will not be assigned");
    }

    for (const preUser of preRegisteredUsers) {
      if (preUser.role === 'student') {
        try {
          const user = updatedAllUsers.find(u => u.phoneNumber === preUser.phoneNumber);
          if (user) {
            // Check if student record already exists
            const existingStudents = await storage.getAllStudents();
            const existingStudent = existingStudents.find(s => s.userId === user.id);
            
            if (!existingStudent) {
              // Use the already-hashed password from user record
              await storage.createStudent({
                userId: user.id,
                sheikhId: defaultSheikh?.id || null, // Assign to default sheikh
                studentName: preUser.name,
                passwordHash: user.passwordHash || '',
                dateOfBirth: null,
                grade: null,
                monthlySessionsCount: 0,
                monthlyPrice: "0",
                isPaid: false,
                isActive: true,
                memorizedSurahs: "[]",
                currentLevel: "beginner",
                notes: "طالب مسجل مسبقاً",
                whatsappContact: preUser.phoneNumber,
              });
              console.log(`✅ Student record created for: ${preUser.name}`);
            } else {
              console.log(`ℹ️  Student record already exists for: ${preUser.name}`);
            }
          }
        } catch (studentError) {
          console.error(`Error creating student record for ${preUser.name}:`, studentError);
        }
      }
    }

    console.log("✅ Pre-registered users initialization completed");
  } catch (error) {
    console.error("Error initializing pre-registered users:", error);
    console.log("⚠️  Continuing without database initialization");
  }
}