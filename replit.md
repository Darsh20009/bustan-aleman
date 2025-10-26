# بستان الإيمان (Bustan Al-Iman) - Islamic Education Platform

## Overview
بستان الإيمان (Bustan Al-Iman) is a comprehensive Islamic education platform designed to provide Quran memorization courses, facilitate teacher-student interaction, and manage educational content. Built with Express.js, React, TypeScript, and PostgreSQL, the platform aims to offer a rich, secure, and user-friendly learning experience. It features full Quran integration with translations, tafsir, and audio recitations, along with advanced tracking for memorization and reading statistics. The platform prioritizes a unified Islamic-themed design and robust security measures.

## User Preferences
- Communication: Simple, everyday language in Arabic
- Pre-registered users only (no public registration feature)
- Phone numbers as primary authentication method

## System Architecture

### UI/UX Decisions
The platform features a unified design system with a core color palette of Green (#10B981), White (#FFFFFF), and Orange (#F97316). All UI elements, including headers, content sections, and interactive components, are centered and adhere to this palette for a consistent, Islamic aesthetic. The Quran reader includes an enhanced dark mode with a green/black theme for improved readability. Typography predominantly uses emerald and orange shades, eliminating gray text for brand consistency. The design supports RTL for Arabic language.

### Technical Implementations
-   **Frontend**: React 18 with TypeScript, Vite for fast development, shadcn/ui and Radix UI for accessible components, TanStack Query for server state, Wouter for routing, and Tailwind CSS for styling.
-   **Backend**: Express.js for RESTful APIs, PostgreSQL with Drizzle ORM for type-safe database operations, and a custom phone-based authentication system with bcrypt for secure password hashing.
-   **Real-time Communication**: WebSocket server (`ws`) is implemented on `/ws` for teacher-student chat, with messages stored in a dedicated database table.
-   **Authentication**: Custom phone-based authentication system with pre-registered users and secure bcrypt hashing. Sessions are managed using PostgreSQL-backed Express sessions with a 7-day TTL and role-based authorization (teacher/student/admin).
-   **Quran Integration**: Comprehensive integration with AlQuran.Cloud API for 114 surahs, Arabic text (Uthmani), English translations (Sahih International), Arabic Tafsir, and audio recitations from 8 renowned reciters. Features dynamic audio loading, auto-play, repeat, and continuous playback.
-   **Database**: PostgreSQL is used with Drizzle ORM. Local development uses a local PostgreSQL instance (Helium), while production targets Neon Serverless. Supports automatic bcrypt password upgrades for legacy accounts.

### Feature Specifications
-   **Quran Reader**: Displays Quran text, translations, tafsir, and allows selection of various reciters with audio playback. Includes features for word-level highlights and notes, memorization progress tracking (range-based, mastery levels, review scheduling), and daily reading statistics.
-   **Student Dashboard**: Personalised welcome, profile information, stats cards (enrolled courses, certificates, memorized surahs), news/announcements, and quick action buttons.
-   **Splash Screen**: Animated Quran book opening sequence with a green/orange theme and loading progress.

### System Design Choices
-   **Type Safety**: Achieved across the stack using TypeScript and Drizzle ORM.
-   **Performance**: Utilizes `React.useMemo` for frontend optimization and enhanced API logging with performance monitoring on the backend.
-   **Security**: Bcrypt password hashing, automatic password upgrades, detailed logging for security operations, and secure session management.
-   **Scalability**: Designed for stateless web app deployment, targeting autoscale environments.

## External Dependencies

### Core Framework
-   `@neondatabase/serverless`: PostgreSQL driver
-   `drizzle-orm`: Type-safe ORM
-   `express`: Web server
-   `express-session`: Session management for Express
-   `react`: Frontend framework
-   `@tanstack/react-query`: Server state management for React

### Authentication & Security
-   `bcrypt`: Password hashing library
-   `connect-pg-simple`: PostgreSQL store for Express sessions
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
-   `drizzle-zod`: Zod integration for Drizzle ORM schemas

### Development Tools
-   `vite`: Next-generation frontend tooling
-   `typescript`: Superset of JavaScript for type safety
-   `drizzle-kit`: Database migration and schema management for Drizzle ORM
-   `tsx`: TypeScript execution environment