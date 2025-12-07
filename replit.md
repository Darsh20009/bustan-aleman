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
-   **Database**: MongoDB Atlas with Mongoose ODM, utilizing `MONGODB_URI`.
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
-   **Teacher Quran Tracking**: Dedicated page for teachers to manage student Quran progress. Features include student selection with search, daily assignment management (memorization and review sections with surah/ayah selection), error recording with severity levels and categories (tajweed, pronunciation, memorization), error resolution workflow, and memorization progress visualization. Includes upsert logic to prevent duplicate assignments. Route: `/teacher/quran-tracking`.
-   **Admin Dashboard**: Platform statistics, teacher management (CRUD), halaqa creation, subscription approval/rejection, message management.
-   **Splash Screen**: Animated Quran book opening sequence.
-   **Course Management**: Sheikhs can create customizable courses with content (videos, files), auto/manual grading, certificate customization, and expert reviews.
-   **Live Sessions**: Integrated with **BigBlueButton** for unlimited video conferencing with features like microphone, camera, screen sharing, and chat. Teachers manage sessions, and students can join from their dashboards.
-   **Password Recovery**: Allows users to recover access via email and phone verification.
-   **Quran Self-Test Page**: Students can test their Quran memorization with voice input, smart grading (ignoring diacritics and extra spaces), error feedback, and a hint feature.
-   **Homework System**: Complete homework management with teacher creation (memorization, review, recitation, written, quiz types), student submission tracking, grading with points system, due date management, and late submission detection. Backend includes 15+ API endpoints in `server/homeworkRoutes.ts` with schema defined in `shared/schema.ts` (homeworks, homeworkSubmissions tables).
-   **Student Evaluations**: Teachers can create evaluations with ratings for memorization, tajweed, concentration, and behavior. Stored in `studentEvaluations` table.
-   **Parent Reports**: Weekly automated reports for parents with student progress, attendance, and teacher comments. Stored in `parentReports` table.

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