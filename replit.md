# بستان الإيمان (Bustan Al-Iman) - Islamic Education Platform

## Overview
A comprehensive Islamic education platform built with Express.js, React, TypeScript, and PostgreSQL. The platform provides Quran memorization courses, teacher-student interaction, and educational content management.

## Project Status (October 6, 2025)
- **Platform**: بستان الإيمان (Garden of Faith)
- **Status**: Phone-based authentication system implemented ✅
- **Development Server**: Running successfully on port 5000
- **Database**: PostgreSQL with Drizzle ORM (production-ready)
- **Authentication**: Custom phone-based auth with pre-registered users

## Recent Changes (October 6, 2025)

### Authentication System Migration ✅
- **Replaced** Replit Auth with custom phone-based authentication
- **Implemented** secure password hashing using bcrypt
- **Created** pre-registered user system (no public registration)
- **Session management** working with PostgreSQL-backed sessions

### Database & Users ✅
- **Pre-registered Users**:
  - **Teacher**: Ahmed Abu Mazen (0549947386) - role: teacher
  - **Students**:
    - Yousef (0532441566) - role: student
    - Ahmed (0532449303) - role: student  
    - Mahmoud (0598765966) - role: student
- **Password**: Phone number is used as initial password
- **Database Connection**: Fixed SSL certificate issues with Neon serverless

### Real-time Communication ✅
- **WebSocket server** initialized on `/ws` for teacher-student chat
- **Messages table** added to schema for real-time messaging
- **Database errors resolved** by accepting self-signed certificates in development

### Known Issues 🔍
- **Splash screen disabled temporarily** (TODO: debug animation timing issue)
- **WebSocket HMR warning** (Vite dev server - doesn't affect functionality)

## User Preferences
- Communication: Simple, everyday language in Arabic
- Pre-registered users only (no public registration feature)
- Phone numbers as primary authentication method

## System Architecture

### Frontend Stack
- **React 18 + TypeScript**: Type-safe component development
- **Vite**: Fast dev server with HMR
- **shadcn/ui + Radix UI**: Accessible component library
- **TanStack Query v5**: Server state management
- **Wouter**: Lightweight routing
- **Tailwind CSS**: Islamic-themed design (green, gold, white palette)
- **RTL Support**: Full Arabic language support

### Backend Stack  
- **Express.js**: RESTful API server
- **PostgreSQL + Drizzle ORM**: Type-safe database operations
- **Custom Phone Auth**: Session-based authentication with bcrypt
- **WebSocket**: Real-time teacher-student communication
- **Neon Serverless**: Cloud PostgreSQL driver

### Database Schema (PostgreSQL)
```typescript
// Core tables:
- users: Pre-registered users with phone authentication
- messages: Real-time chat between teachers and students
- courses: Islamic education courses
- instructors: Teacher profiles and qualifications
- enrollments: Student course registrations
- sessions: Express session storage
```

### Authentication Flow
1. **Login**: Phone number + password (initially same as phone)
2. **Session**: PostgreSQL-backed Express sessions (7-day TTL)
3. **Authorization**: Role-based access (teacher/student/admin)
4. **Password Security**: bcrypt hashing (10 rounds)

### API Endpoints
```
POST /api/auth/login         - Phone-based login
GET  /api/auth/user          - Get current user
POST /api/auth/logout        - Logout and destroy session
POST /api/init-data          - Initialize default data
```

## Development Guidelines

### Database Changes
- Never change primary key types (serial ↔ varchar breaks existing data)
- Use `npm run db:push --force` to sync schema safely
- Check existing schema before making changes

### Code Conventions
- Phone numbers: 10 digits starting with '05' (Palestinian format)
- All UI text: Arabic (RTL)
- Password hashing: Always use bcrypt
- Session secrets: Store in environment variables

### Testing Credentials
```
Teacher Login:
Phone: 0549947386
Password: 0549947386

Student Login (Yousef):
Phone: 0532441566  
Password: 0532441566
```

## External Dependencies

### Core Framework
- `@neondatabase/serverless` - PostgreSQL driver
- `drizzle-orm` - Type-safe ORM
- `express` + `express-session` - Web server and sessions
- `react` + `@tanstack/react-query` - Frontend framework

### Authentication & Security
- `bcrypt` - Password hashing
- `connect-pg-simple` - PostgreSQL session store
- `ws` - WebSocket server for real-time features

### UI & Styling
- `@radix-ui/*` - Accessible UI primitives
- `tailwindcss` - Utility CSS framework
- `lucide-react` - Icon library
- `framer-motion` - Animations

### Forms & Validation
- `react-hook-form` + `@hookform/resolvers`
- `zod` + `drizzle-zod` - Schema validation

### Development Tools
- `vite` - Build tool
- `typescript` - Type safety
- `drizzle-kit` - Database migrations
- `tsx` - TypeScript execution

## File Structure
```
client/                    # React frontend
  src/
    components/           # UI components
    hooks/               # React hooks (useAuth, etc.)
    lib/                 # Utilities (queryClient)
    pages/               # Page components
server/                   # Express backend
  db.ts                  # Database connection
  phoneAuth.ts           # Phone authentication logic
  routes.ts              # API routes
  storage.ts             # Database operations
  index.ts               # Server entry point
shared/
  schema.ts              # Shared database schema
```

## Next Steps (TODO)
1. ✅ Fix database SSL certificate issues
2. ✅ Implement phone-based authentication
3. ✅ Create pre-registered users
4. 🔄 Debug splash screen animation issue
5. 📋 Implement teacher dashboard
6. 📋 Implement student portal
7. 📋 Build course management system
8. 📋 Add exam system with anti-cheat
9. 📋 Implement certificate generation
10. 📋 Integrate Quran reader with recitations
11. 📋 Add session access control

## Deployment Configuration
- **Target**: Autoscale (stateless web app)
- **Port**: 5000 (frontend + backend on same port)
- **Database**: PostgreSQL (Neon serverless)
- **Environment**: Production-ready with secure sessions

---
**Last Updated**: October 6, 2025
**Platform**: بستان الإيمان - منصة تعليمية إسلامية متطورة
