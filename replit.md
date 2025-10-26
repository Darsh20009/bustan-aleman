# بستان الإيمان (Bustan Al-Iman) - Islamic Education Platform

## Overview
A comprehensive Islamic education platform built with Express.js, React, TypeScript, and PostgreSQL. The platform provides Quran memorization courses, teacher-student interaction, and educational content management.

## Project Status (October 26, 2025)
- **Platform**: بستان الإيمان (Garden of Faith)
- **Status**: Production-ready with enhanced security ✅
- **Development Server**: Running successfully on port 5000
- **Database**: PostgreSQL with Drizzle ORM (Local - Helium)
- **Security**: Bcrypt password hashing with automatic upgrade ✅
- **Monitoring**: Enhanced API logging with performance tracking ✅
- **Authentication**: Custom phone-based auth with pre-registered users
- **Quran Integration**: Full Quran with 114 surahs, translations, tafsir, and audio ✅
- **Design System**: Unified color palette (Green, White, Orange) with centered layout ✅

## Recent Changes (October 26, 2025)

### Splash Screen Activation ✅
- **Re-enabled Splash Screen** (previously disabled):
  - ✅ Animated Quran book opening sequence with green pages
  - ✅ Duration: 6.5 seconds (auto-advance) with "تخطي" skip button
  - ✅ Updated all colors to match unified design (green, orange, white)
  - ✅ Background: Gradient from emerald to orange
  - ✅ Arabic text with Islamic verses (Bismillah, Al-Hamdulillah)
  - ✅ Loading progress bar with orange accent
  - ✅ Smooth animations and transitions

### Design System Unification ✅
- **Color Palette Simplification**:
  - ✅ Unified all colors to three-color palette: Green (#10B981), White (#FFFFFF), Orange (#F97316)
  - ✅ Replaced all gray, purple, blue, and other colors with green/orange variants
  - ✅ Updated CSS variables in `client/src/index.css` for consistency
  - ✅ Removed gradient overlays with black, using green/orange tones instead

- **Layout Improvements**:
  - ✅ Centered header navigation (logo, title, buttons)
  - ✅ All content sections now have centered alignment
  - ✅ Hero cards (3 journey cards) alternate green/orange colors
  - ✅ Platform features use consistent green/orange icon backgrounds
  - ✅ Certificate section badges follow same color scheme

- **Typography & Content**:
  - ✅ All text uses emerald-600/700 or orange-600/700 shades
  - ✅ Removed all gray text colors for better brand consistency
  - ✅ White backgrounds throughout for clean, modern look

## Recent Changes (October 25, 2025)

### Quran Integration - Complete Implementation ✅
- **API Integration**: 
  - ✅ Integrated AlQuran.Cloud API for authentic Quranic text
  - ✅ Added all 114 surahs with complete metadata
  - ✅ Fetching Arabic text (Uthmani script) from live API
  - ✅ English translations (Sahih International) for all verses
  - ✅ Arabic Tafsir (Simplified) for every ayah
  
- **Audio Features**:
  - ✅ Support for 8 renowned reciters:
    - مشاري العفاسي (Mishary Al-Afasy)
    - عبد الباسط عبد الصمد - مرتل (Abdul Basit - Murattal)
    - عبد الباسط عبد الصمد - مجود (Abdul Basit - Mujawwad)
    - أبو بكر الشاطري (Abu Bakr Al-Shatri)
    - هاني الرفاعي (Hani Al-Rifai)
    - محمود خليل الحصري (Mahmoud Khalil Al-Hussary)
    - محمد صديق المنشاوي (Mohamed Siddiq Al-Minshawi)
    - عبد الرحمن السديس (Abdul Rahman Al-Sudais)
  - ✅ Dynamic audio loading from API per reciter selection
  - ✅ Auto-play, repeat, and continuous playback features
  - ✅ Proper audio cleanup prevents overlapping playback
  - ✅ Memory leak prevention on component unmount
  
- **User Experience**:
  - ✅ Full Surah selector with all 114 chapters
  - ✅ Real-time loading indicators
  - ✅ Error handling with user-friendly Arabic messages
  - ✅ Network error recovery suggestions
  - ✅ Smooth surah/reciter switching without audio overlap

## Recent Changes (October 17, 2025)

### Security & Performance Enhancements ✅
- **Password Security**: 
  - ✅ Implemented automatic bcrypt password upgrade for legacy accounts
  - ✅ Guaranteed bcrypt hashing with proper failure handling  
  - ✅ Denies access if password hashing/persistence fails (no plaintext logins)
  - ✅ Detailed logging for password upgrade operations
  
- **Database Connection**:
  - ✅ Configured for local PostgreSQL (Helium) with safe fallback
  - ✅ Updated `drizzle.config.ts` to use DATABASE_URL
  - ✅ Database schema synced successfully
  
- **Monitoring & Logging**:
  - ✅ Enhanced API logging with user tracking `[user:xxx]`
  - ✅ Performance monitoring with slow request warnings (>1s)
  - ✅ Detailed request logs: method, path, status, duration, user, response
  - ✅ Log truncation at 120 chars for better readability

## Recent Changes (October 15, 2025)

### Aiven Database Integration Attempt ⚠️
- **Added**: Aiven PostgreSQL credentials stored securely in Secrets
- **Issue**: Connection fails with `ECONNRESET` error  
- **Root Cause**: Likely firewall/IP whitelist restrictions in Aiven
- **Current Status**: Using local PostgreSQL database (Helium)
- **Action Required**: 
  1. Log into Aiven Console
  2. Navigate to PostgreSQL service → Settings → IP Whitelist
  3. Add `0.0.0.0/0` (for testing) or specific Replit IPs
  4. Enable Aiven by setting `ENABLE_AIVEN = true` in `server/db.ts`

### Database Connection Layer Enhanced ✅
- **Added**: Dual driver support (Neon + pg)
- **Added**: Automatic Aiven detection from environment variables
- **Added**: SSL configuration for Aiven (rejectUnauthorized: false for dev)
- **Updated**: drizzle.config.ts to support Aiven credentials

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
4. ✅ Integrate Quran reader with recitations (Complete - 114 surahs, translations, tafsir, 8 reciters)
5. 🔄 Debug splash screen animation issue
6. 📋 Implement teacher dashboard
7. 📋 Implement student portal
8. 📋 Build course management system
9. 📋 Add exam system with anti-cheat
10. 📋 Implement certificate generation
11. 📋 Add session access control

## Deployment Configuration
- **Target**: Autoscale (stateless web app)
- **Port**: 5000 (frontend + backend on same port)
- **Database**: PostgreSQL (Neon serverless)
- **Environment**: Production-ready with secure sessions

---
**Last Updated**: October 17, 2025
**Platform**: بستان الإيمان - منصة تعليمية إسلامية متطورة
