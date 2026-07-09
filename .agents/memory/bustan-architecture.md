---
name: Bustan Al-Iman Platform Architecture
description: Core architectural decisions for the multi-tenant Quran memorization SaaS platform
---

# Bustan Al-Iman - Architecture Decisions

## Stack
- Backend: Express + TypeScript (existing, not NestJS — document says NestJS but codebase is Express)
- Frontend: React + Vite + Wouter (existing, not Flutter)
- Database: MongoDB Atlas (primary) + PostgreSQL fallback
- Domain: bustan.qiroxstudio.online

## Design System
- Font: Tajawal (Google Fonts) — replaced Noto Sans Arabic
- Colors (brand-exact):
  - `--bustan-dark`  #1E4D3A  hsl(156 44% 21%)
  - `--bustan-main`  #2E7D56  hsl(150 46% 34%)
  - `--bustan-light` #A7C48A  hsl(90  33% 66%)
  - `--bustan-beige` #F6E9C9  hsl(43  72% 88%)
  - `--bustan-gold`  #D4AF37  hsl(46  65% 52%)
  - `--bustan-text`  #1F2A23  hsl(141 16% 14%)

## User Roles (Phase 1)
New roles: `super_admin` | `tenant_admin` | `supervisor` | `sheikh` | `parent` | `student`
Legacy roles kept for compatibility: `admin` | `owner` | `director` | `teacher`

**Why:** Role enum updated in server/models/index.ts User schema; useAuth hook type updated to include all new roles.

## Role Redirects
- student → /student
- parent → /student (temporary until parent dashboard built)
- sheikh/supervisor/teacher → /teacher
- tenant_admin/admin/director/owner/super_admin → /admin

## Multi-Tenant Architecture
- Each tenant has a `slug` (e.g. `tuwaiq`, `alqalam`)
- URL pattern: bustan.qiroxstudio.online/:tenantSlug/*
- TenantContext (client/src/contexts/TenantContext.tsx) extracts slug from URL, fetches tenant data, applies custom colors via CSS vars
- Reserved paths (not tenant slugs): login, register, student, teacher, admin, quran, about, courses, etc.

## New Files (Phase 1)
- `server/models/tenantModel.ts` — Tenant collection
- `server/models/newSchemas.ts` — Teacher, Parent, Group, SessionV2, Attendance, QuranProgressV2, QuranMistake, Exam, Achievement, AIRequest
- `server/tenantRoutes.ts` — Tenant CRUD API
- `client/src/contexts/TenantContext.tsx` — Tenant React context

## Security Rule
In tenant invite endpoint: `tenant_admin` can ONLY invite to their own tenant (enforced by checking `user.tenantId === req.params.id`). `super_admin` can invite to any tenant.

**Why:** Cross-tenant broken access control was found in code review and fixed.
