# بستان الإيمان (Bustan Al-Iman) - Islamic Education Platform

## Overview
بستان الإيمان (Bustan Al-Iman) is a comprehensive Islamic education platform for Quran memorization, teacher-student interaction, and content management. It offers full Quran integration with translations, tafsir, and audio, advanced memorization tracking, and a unified Islamic-themed design. The platform aims to provide a secure and user-friendly learning experience.

## User Preferences
- Communication: Simple, everyday language in Arabic
- Pre-registered users only (no public registration feature)
- Phone numbers as primary authentication method

## System Architecture

### UI/UX Decisions
The platform uses a unified design with a core palette of Green (#10B981), White (#FFFFFF), and Orange (#F97316). All UI elements are centered, adhering to an Islamic aesthetic. It features full dark mode support, a Mushaf-style Quran reader with 604-page layout, and a single-page workspace with persistent navigation. Typography uses emerald and orange shades, supporting RTL for Arabic.

### Technical Implementations
-   **Frontend**: React 18 (TypeScript, Vite), shadcn/ui, Radix UI, TanStack Query, Wouter, Tailwind CSS.
-   **Backend**: Express.js for RESTful APIs, MongoDB with Mongoose ODM.
-   **Real-time Communication**: WebSocket server (`ws`) for teacher-student chat.
-   **Authentication**: Custom phone-based system with pre-registered users, bcrypt hashing, and in-memory Express sessions with role-based authorization (teacher/student/admin). Includes password recovery.
-   **Quran Integration**: Comprehensive integration with AlQuran.Cloud API for Arabic text, English translations, Arabic Tafsir, and audio recitations. Features dynamic audio loading and playback controls.
-   **Database**: MongoDB Atlas (primary) with Mongoose ODM via `MONGODB_URI`, PostgreSQL (fallback). Dynamic proxy switches storage automatically based on connection state.
-   **SEO & Performance**: Enhanced meta tags, dns-prefetch, optimized font loading, and PWA-ready meta tags.

### Frontend Architecture (December 2024 Restructure)
The frontend has been completely restructured with a modern, role-based dashboard system:

-   **DashboardLayout**: Base layout component with sidebar navigation, user info display, and theme toggle. Supports three roles: student, supervisor (teacher), admin.
-   **Shared UI Components** (in `client/src/components/shared/`):
    - `StatsCard`: Statistics display with icon, value, subtitle, and optional trend
    - `DataTable`: Reusable table with loading states and empty messages
    - `PageHeader`: Page title with description and action buttons
    - `EmptyState`: Empty data placeholder with icon and optional action
    - `LoadingState`: Loading skeletons for cards and pages
-   **Student Dashboard** (6 pages in `client/src/pages/student/`):
    - Dashboard, Homework, Memorization progress, Attendance, Subscription, Contact teacher
-   **Teacher Dashboard** (5 pages in `client/src/pages/teacher/`):
    - Students list, Attendance recording, Memorization evaluation, Homework assignment, Reports
-   **Admin Dashboard** (5 pages in `client/src/pages/admin/`):
    - Statistics, Teachers management, Halaqas creation, Subscriptions control, Messages
-   **Registration Page**: Multi-step form with document upload capability

### Feature Specifications
-   **Quran Reader**: Displays Quran text, translations, tafsir, and offers reciter selection with audio. Includes word-level highlights, notes, memorization progress tracking (range-based, mastery levels, review scheduling), and daily reading statistics.
-   **Student Dashboard**: Role-based dashboard with stats cards, upcoming sessions, homework tracking, memorization progress, attendance records, subscription management with sheikh selection, cart integration for subscription plans, and teacher contact.
-   **Teacher Dashboard**: Student management, attendance recording, memorization evaluation with grading, homework creation and tracking, detailed student reports.
-   **Teacher Quran Tracking**: Dedicated page for teachers to manage student Quran progress. Features include student selection with search, daily assignment management (memorization and review sections with surah/ayah selection), error recording with severity levels and categories (tajweed, pronunciation, memorization), error resolution workflow, and memorization progress visualization. Includes upsert logic to prevent duplicate assignments. Route: `/teacher/quran-tracking`. API routes: `/api/teacher/students`, `/api/teacher/student-assignment`, `/api/teacher/student-errors`, `/api/teacher/student-memorization`.
-   **Admin Dashboard**: Platform statistics, teacher management (CRUD), halaqa creation, subscription approval/rejection, message management.
-   **Splash Screen**: Animated Quran book opening sequence.
-   **Course Management**: Sheikhs can create customizable courses with content (videos, files), auto/manual grading, certificate customization, and expert reviews.
-   **Live Sessions**: Integrated with **BigBlueButton** for unlimited video conferencing with features like microphone, camera, screen sharing, and chat. Teachers manage sessions, and students can join from their dashboards.
-   **Password Recovery**: Allows users to recover access via email and phone verification.
-   **Quran Self-Test Page**: Students can test their Quran memorization with voice input, smart grading (ignoring diacritics and extra spaces), error feedback, and a hint feature.
-   **Homework System**: Complete homework management with teacher creation (memorization, review, recitation, written, quiz types), student submission tracking, grading with points system, due date management, and late submission detection. Backend includes 15+ API endpoints in `server/homeworkRoutes.ts` with schema defined in `shared/schema.ts` (homeworks, homeworkSubmissions tables).
-   **Student Evaluations**: Teachers can create evaluations with ratings for memorization, tajweed, concentration, and behavior. Stored in `studentEvaluations` table.
-   **Parent Reports**: Weekly automated reports for parents with student progress, attendance, and teacher comments. Stored in `parentReports` table.
-   **Voice Self-Recitation**: Free browser-based Quran recitation feature using Web Speech API. Hook: `client/src/hooks/useSpeechRecognition.ts`. Supports Arabic speech recognition, text comparison with normalization (removes diacritics), and similarity scoring.
-   **Subscription Plans**: Three tiers (Basic, Premium, VIP) defined in `data/subscriptionPlans.json`. Schema supports billing cycles (monthly/quarterly/yearly) and special features per plan.

### Role Hierarchy & Pre-registered Users
-   **Roles**: student < teacher < supervisor < admin < owner
-   **Owner Account**: Phone 0500000000, Password admin123456 - Full platform access, can manage academies and all users
-   **Pre-registered Users**: Defined in `server/preregistered-users.json`, auto-initialized on server start

### Recent Changes (March 2026 - Major Overhaul)
-   **4-Role System**: Implemented student, sheikh (teacher/supervisor), director (مدير), admin roles. Updated authMiddleware.ts with role-based middleware exports. Updated App.tsx ProtectedRoute handling for all roles.
-   **AI Integration (OpenAI)**: Created `server/aiService.ts` with GPT-4o-mini for student evaluation, recitation assessment, level testing, sheikh assistant, and memorization plan generation. Added `server/aiRoutes.ts` with endpoints for all AI features.
-   **AI Level Test** (`/level-test`): 7-question questionnaire about Quran memorization experience. AI analyzes answers and assigns level (مبتدئ to حافظ), with rule-based fallback when AI unavailable.
-   **Post-Session Workflow** (`/teacher/post-session/:studentId`): 4-step wizard for teachers after sessions - attendance/rating, error recording, new assignment (new memorization + near/far review), AI evaluation + email notification. Creates homework, attendance records, and sends notifications via WebSocket.
-   **SMTP2Go Email Service**: Created `server/emailService.ts` with templates for welcome, session summary, subscription, and password reset emails. Placeholder until SMTP2Go credentials configured.
-   **Kirox Video Sessions**: Created `server/kiroxService.ts` for Kirox QMeet API integration (create/list/delete meetings). Replaces ZegoCloud for video conferencing.
-   **System Settings Page** (`/admin/settings`): Full admin settings with tabs for general, timezone (Saudi default), payment (bank transfer + gateway), sessions (Kirox/Zego), AI toggles, and email settings. Status indicators for all services.
-   **Student Certificates** (`/student/certificates`): Page for viewing earned certificates (memorization, course, attendance, achievement types).
-   **Student Notes** (`/student/notes`): Quran notes page with surah/ayah-based note management.
-   **Bank Transfer Admin**: Admin page for reviewing/approving/rejecting bank transfer payment requests.
-   **Navigation Updates**: Added certificates, notes to student nav. Added settings, bank transfers to admin nav. Added post-session to teacher workflow.
-   **Light Mode Default**: Set light mode as default theme (removed dark mode OS detection).
-   **Quran RTL Fix**: Fixed page flip direction for RTL reading (swipe right = next page).
-   **Saudi Timezone**: Default timezone set to Asia/Riyadh in system settings.

### Recent Changes (February 2026 - Session 2)
-   **Admin Users Page** (`/admin/users`): Created full CRUD user management page for admins. Features: user list with search/filter by role & status, role change dialog (student/supervisor/teacher/admin), toggle activate/deactivate with confirmation dialog. Route added to AdminLayout nav and App.tsx.
-   **Teacher Dashboard** (`/teacher/dashboard`): Created comprehensive teacher dashboard page with Islamic greeting, motivational Quran verse, 4 stats cards (students, sessions, homework, attendance rate), upcoming sessions list, recent students list, and quick action buttons.
-   **Teacher Navigation**: Added "لوحة التحكم" as first nav item in TeacherLayout leading to `/teacher/dashboard`.
-   **Profile Link in Sidebar**: Added "الملف الشخصي" link to DashboardLayout sidebar footer for all roles.
-   **Profile Route**: Added `/profile` route to App.tsx accessible by all roles (student/supervisor/admin/owner/teacher).
-   **Storage Interface Updates**: Updated `IStorage.getAllUsers` to accept optional filters `{ role, isActive, page, limit }`. Added `getStudentByUserId` and `getStudentByPhone` to IStorage interface. Updated `DatabaseStorage.getAllUsers` to properly filter results using Drizzle ORM conditions.
-   **TypeScript Fix**: Exported `storage` as `IStorage` type to fix `adminDashboardRoutes.ts` TypeScript errors. All admin dashboard route errors resolved.

### Recent Changes (February 2026 - Session 1)
-   **Quran Recitation Page** (`/quran/recitation`): Created comprehensive `QuranRecitationPage.tsx` with surah/reciter selection, audio playback, Web Speech API recitation practice (Arabic `ar-SA`), word-by-word comparison with green/red highlighting, scoring, and session results
-   **Quran Reader Recitation Button**: Added "تسميع" button to both desktop and mobile QuranPageReader toolbars linking to the recitation page
-   **Student Navigation**: Added "تسميع القرآن" entry to student dashboard navigation
-   **apiRequest Fix**: Updated `client/src/lib/queryClient.ts` to support all 3 calling conventions: `apiRequest('METHOD', url, data)`, `apiRequest(url, 'METHOD', data)`, `apiRequest(url, { method, body })`
-   **Admin Statistics Endpoint**: Fixed `/api/admin/statistics` → `/api/admin/stats` mismatch
-   **Type Safety**: Fixed all frontend TypeScript errors — added `owner` and `teacher` to User role type in `useAuth.ts`, updated roleTitle objects in navigation components, fixed Set iteration issues, fixed type assertions
-   **WebSocket**: Made `sendToStudent` method public in WebSocket service
-   **Bug Fixes**: Fixed `AnnouncementsPage` unknown type, missing `StudentDashboardPage` export, created shared `WeeklyReminders` component

### Recent Changes (December 2024)
-   Fixed Quran data sync: Routes now correctly map `userId` to `studentId` for memorization, reading stats, and reviews
-   Added `/api/quran/reviews/due` and `/api/quran/reading-stats` endpoints for student Quran tracking
-   Implemented `useSpeechRecognition` hook for free voice-based Quran recitation using Web Speech API
-   Added subscription plans (Basic, Premium, VIP) to `data/subscriptionPlans.json`
-   Created owner account with full platform management capabilities
-   **Critical Fix**: Race condition for student-user linking - added unique partial index on `students.user_id` (PostgreSQL constraint) plus application-level mutex to prevent duplicate student records during concurrent logins
-   Added efficient lookup methods `getStudentByUserId()` and `getStudentByPhone()` to replace O(n) table scans
-   Session security: Removed trust in session.studentId; all lookups validate against authenticated userId
-   Session timing for live classes: 5-minute early entry window, 10-minute late auto-absence threshold (implemented in `sheikhRoutes.ts`)

### System Design Choices
-   **Type Safety**: Achieved with TypeScript.
-   **Performance**: `React.useMemo` for frontend, enhanced API logging on backend.
-   **Security**: Bcrypt password hashing, automatic password upgrades, detailed security logging, secure session management.
-   **Scalability**: Designed for stateless web app deployment and autoscale environments.

## External Dependencies

-   `mongoose`: MongoDB ODM
-   `express`: Web server
-   `express-session`: Session management
-   `memorystore`: In-memory session storage
-   `react`: Frontend framework
-   `@tanstack/react-query`: Server state management
-   `bcrypt`: Password hashing
-   `ws`: WebSocket server
-   `@radix-ui/*`: Accessible UI primitives
-   `tailwindcss`: CSS framework
-   `lucide-react`: Icon library
-   `framer-motion`: Animation library
-   `react-hook-form`: Form management
-   `@hookform/resolvers`: Validation resolvers
-   `zod`: Schema validation
-   `vite`: Frontend tooling
-   `typescript`: Type safety
-   `tsx`: TypeScript execution