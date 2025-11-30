# بستان الإيمان (Bustan Al-Iman) - Islamic Education Platform

## Overview
بستان الإيمان (Bustan Al-Iman) is a comprehensive Islamic education platform designed to provide Quran memorization courses, facilitate teacher-student interaction, and manage educational content. Built with Express.js, React, TypeScript, and MongoDB (Mongoose), the platform aims to offer a rich, secure, and user-friendly learning experience. It features full Quran integration with translations, tafsir, and audio recitations, along with advanced tracking for memorization and reading statistics. The platform prioritizes a unified Islamic-themed design and robust security measures.

## User Preferences
- Communication: Simple, everyday language in Arabic
- Pre-registered users only (no public registration feature)
- Phone numbers as primary authentication method

## System Architecture

### UI/UX Decisions
The platform features a unified design system with a core color palette of Green (#10B981), White (#FFFFFF), and Orange (#F97316). All UI elements, including headers, content sections, and interactive components, are centered and adhere to this palette for a consistent, Islamic aesthetic. 

**Major Redesign (October 2025):**
- Full dark mode support via ThemeProvider (SSR-safe) across all components
- Mushaf-style Quran reader with 604-page layout (canonical Quran pagination)
- Single-page workspace architecture with persistent navigation and collapsible panels
- Per-ayah state tracking (markers, notes, memorization, recitation attempts)
- Enhanced database schema with quranAyahMarkers and quranRecitationAttempts tables
- Secure authenticated API routes for Quran stats, markers, and page data

Typography predominantly uses emerald and orange shades, eliminating gray text for brand consistency. The design supports RTL for Arabic language.

### Technical Implementations
-   **Frontend**: React 18 with TypeScript, Vite for fast development, shadcn/ui and Radix UI for accessible components, TanStack Query for server state, Wouter for routing, and Tailwind CSS for styling.
-   **Backend**: Express.js for RESTful APIs, MongoDB with Mongoose ODM for document-based database operations, and a custom phone-based authentication system with bcrypt for secure password hashing.
-   **Real-time Communication**: WebSocket server (`ws`) is implemented on `/ws` for teacher-student chat, with messages stored in a dedicated database collection.
-   **Authentication**: Custom phone-based authentication system with pre-registered users and secure bcrypt hashing. Sessions are managed using in-memory Express sessions with a 7-day TTL and role-based authorization (teacher/student/admin). Features include password recovery with email and phone verification.
-   **Quran Integration**: Comprehensive integration with AlQuran.Cloud API for 114 surahs, Arabic text (Uthmani), English translations (Sahih International), Arabic Tafsir, and audio recitations from 8 renowned reciters. Features dynamic audio loading, auto-play, repeat, and continuous playback.
-   **Database**: MongoDB Atlas with Mongoose ODM. Uses the `MONGODB_URI` environment variable for connection. Collections include users, students, courses, sessions, quran progress, payments, live rooms, and notifications. Supports automatic bcrypt password hashing for security.
-   **SEO & Performance**: Enhanced meta tags for search engines and social media (Open Graph, Twitter cards), dns-prefetch for fonts, optimized font loading with media="print" technique, and PWA-ready meta tags for mobile app experience.

### Feature Specifications
-   **Quran Reader**: Displays Quran text, translations, tafsir, and allows selection of various reciters with audio playback. Includes features for word-level highlights and notes, memorization progress tracking (range-based, mastery levels, review scheduling), and daily reading statistics.
-   **Student Dashboard**: Personalised welcome, profile information, stats cards (enrolled courses, certificates, memorized surahs), news/announcements, and quick action buttons.
-   **Splash Screen**: Animated Quran book opening sequence with a green/orange theme and loading progress.
-   **Course Management**: Sheikh can create customizable courses with colors, videos, files, and content. Supports both auto and manual grading for exams, certificate customization (upload templates or auto-generate), and expert reviews for courses.
-   **Live Sessions**: Integrated with **BigBlueButton** for unlimited video conferencing. Sessions support **2+ hours duration** without interruption, using room names formatted as `bustan_${sessionId}`. Both sheikhs and students join BigBlueButton meetings with instant joining. Features include microphone, camera, screen sharing, chat, and settings. Migrated from Jitsi Meet (5-minute demo limitation) to BigBlueButton (unlimited free).
    - **Video Conference Backend**: Currently configured to use `demo.bigbluebutton.org` for testing. Can be deployed to custom BigBlueButton servers using `VITE_BBB_SERVER` environment variable for production use.
    - **Session Management UI**: Teachers can manage live sessions from the "الحصص" (Sessions) tab in SheikhDashboard with enable/disable/cancel controls for each session.
    - **Real-time Session Status**: Shows session date, time, and current status (مفعلة/معطلة - enabled/disabled, نشطة/مجدولة - active/scheduled)
    - **Student Session Access**: Students can view and join enabled sessions from StudentSessions page with real-time availability updates
-   **Password Recovery**: "Forgot Password" feature allowing users to recover access by verifying their email and phone number. Users can view their current password and set a new one with validation.

### System Design Choices
-   **Type Safety**: Achieved across the stack using TypeScript and Drizzle ORM.
-   **Performance**: Utilizes `React.useMemo` for frontend optimization and enhanced API logging with performance monitoring on the backend.
-   **Security**: Bcrypt password hashing, automatic password upgrades, detailed logging for security operations, and secure session management.
-   **Scalability**: Designed for stateless web app deployment, targeting autoscale environments.

## External Dependencies

### Core Framework
-   `mongoose`: MongoDB ODM for document database operations
-   `express`: Web server
-   `express-session`: Session management for Express
-   `memorystore`: In-memory session storage with TTL support
-   `react`: Frontend framework
-   `@tanstack/react-query`: Server state management for React

### Authentication & Security
-   `bcrypt`: Password hashing library
-   `ws`: WebSocket server implementation

### UI & Styling
-   `@radix-ui/*`: Accessible UI primitives
-   `tailwindcss`: Utility-first CSS framework
-   `lucide-react`: Icon library
-   `framer-motion`: Animation library

### Forms & Validation
-   `react-hook-form`: Form management library
-   `@hookform/resolvers`: Validation resolvers for React Hook Form
-   `zod`: Schema declaration and validation library

### Development Tools
-   `vite`: Next-generation frontend tooling
-   `typescript`: Superset of JavaScript for type safety
-   `tsx`: TypeScript execution environment

## Recent Changes (November 2025)

### Storage System & Login Redirect Fix (November 30, 2025)
- **Issue 1**: Authentication system was using DatabaseStorage (Drizzle ORM) instead of MongoDBStorage
  - **Root Cause**: storage.ts was exporting DatabaseStorage instance, not mongoStorage
  - **Solution**: Updated storage.ts to use MongoDBStorage as primary, DatabaseStorage with JSON fallback as secondary
  
- **Issue 2**: User lookup failing after login - `getUser()` didn't have JSON fallback
  - **Root Cause**: `DatabaseStorage.getUser()` returned `undefined` when DB unavailable instead of searching JSON storage
  - **Solution**: Added JSON storage fallback to `getUser()` method to search users.json when DB unavailable
  
- **Results**:
  - All 4 pre-registered users now load successfully on server startup
  - System works seamlessly with or without MongoDB connection
  - Users can now login and access their dashboards correctly
  - Session persistence working properly with JSON storage fallback

### Authentication Redirect Fix (November 30, 2025)
- **Issue**: Login succeeded but users weren't redirected to student/sheikh dashboard
- **Root Cause**: Missing callback handler when `onLoginSuccess` wasn't defined in AuthPage
- **Solution**: 
  - Added `onLoginSuccess` callback prop to AuthPage component
  - Updated App.tsx to pass callback that sets `appState` to 'dashboard'
  - Login now properly triggers state change for dashboard redirect

### UI Redesign with Islamic Theme (November 30, 2025)
- Integrated assignment display in Mushaf with visual highlighting
  - Emerald green for memorization verses
  - Blue for review verses
- Updated color scheme across entire platform
  - Primary: Deep Emerald (#10B981) for Islamic aesthetic
  - Secondary: Golden Orange (#F97316) for warmth
- Applied theme to MainHomepage and StudentDashboard
- Full dark mode support maintained

### Database Migration: PostgreSQL to MongoDB
- **Migration Date**: November 26, 2025
- **Previous Database**: PostgreSQL with Drizzle ORM (AWS RDS)
- **Current Database**: MongoDB Atlas with Mongoose ODM
- **Key Changes**:
  - Replaced Drizzle ORM with Mongoose for MongoDB support
  - Created 35+ Mongoose models for all entities (users, students, courses, sessions, Quran progress, payments, etc.)
  - Implemented MongoDBStorage class following the existing IStorage interface
  - Updated session management to use in-memory storage (memorystore) instead of PostgreSQL-backed sessions
  - Maintained full API compatibility - no frontend changes required