# Overview

This is an Islamic education platform called "Bustan Al-Iman" (بستان الإيمان) built as a full-stack web application. The platform provides Quran memorization courses, Islamic jurisprudence (fiqh) education, and Ramadan educational programs. It features user authentication, course enrollment, instructor profiles, and progress tracking for Islamic studies.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Modern SPA built with React 18 and TypeScript for type safety
- **Vite Build System**: Fast development server and optimized production builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom Islamic-themed color palette (green, gold, warm whites)
- **RTL Support**: Built-in Arabic language support with right-to-left text direction

## Backend Architecture
- **Express.js Server**: RESTful API server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth integration with OpenID Connect (OIDC)
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **Database Driver**: Neon serverless PostgreSQL for cloud deployment

## Data Storage Solutions
- **Primary Database**: PostgreSQL with the following schema:
  - Users table with authentication and profile data
  - Courses table with Arabic/English titles and metadata
  - Instructors table with qualifications and specializations
  - Course enrollments for tracking user progress
  - Contact messages for user inquiries
  - Sessions table for authentication state
- **ORM**: Drizzle with automatic schema validation using Zod
- **Migrations**: Drizzle Kit for database schema management

## Authentication and Authorization
- **Identity Provider**: Replit Auth with OIDC protocol
- **Session Storage**: PostgreSQL-backed sessions with 7-day TTL
- **User Management**: Automatic user creation/updates on authentication
- **Protected Routes**: Middleware-based route protection for authenticated endpoints
- **Profile Management**: User profile completion tracking and updates

## Development and Deployment
- **Monorepo Structure**: Client, server, and shared code in single repository
- **Build Process**: Vite for frontend, esbuild for backend bundling
- **Development**: Hot module replacement and runtime error overlay
- **Environment**: Node.js with ES modules throughout the stack

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database driver
- **drizzle-orm**: Type-safe ORM for database operations
- **express**: Web application framework for the API server
- **react**: Frontend UI library with hooks and modern patterns
- **@tanstack/react-query**: Server state management and caching

## Authentication Services
- **openid-client**: OpenID Connect client for Replit Auth integration
- **passport**: Authentication middleware (used with OIDC strategy)
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## UI and Styling
- **@radix-ui/***: Headless UI components for accessibility
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant styling
- **lucide-react**: Icon library for consistent iconography

## Development Tools
- **vite**: Build tool and development server
- **typescript**: Type safety across the application
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **drizzle-kit**: Database migration and schema management tool

## Form and Validation
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Schema validation (integrated with Drizzle)

## Utilities
- **date-fns**: Date manipulation and formatting
- **wouter**: Lightweight routing for React
- **clsx**: Conditional CSS class composition