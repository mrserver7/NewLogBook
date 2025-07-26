# CaseCurator - Anesthesiology Case Management System

## Overview

CaseCurator is a modern web application designed for anesthesiology professionals to manage surgical cases, patient data, and generate comprehensive logbooks. The system provides a complete solution for tracking anesthesia cases, managing patient information, and generating analytics for medical professionals.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom design system (light/dark themes)
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful endpoints with JSON responses

### Database Layer
- **Database**: PostgreSQL with Neon serverless connector
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Pooled connections with WebSocket support

## Key Components

### Authentication System
- **Provider**: Replit Auth integration with OpenID Connect
- **Session Storage**: PostgreSQL-backed session store
- **Security**: HTTP-only cookies with secure configuration
- **User Management**: Role-based access (user/admin roles)

### Data Models
- **Users**: Complete user profiles with medical credentials
- **Patients**: Patient demographics and medical history
- **Surgeons**: Surgeon database for case assignments
- **Procedures**: Medical procedure catalog
- **Cases**: Comprehensive anesthesia case records
- **Case Templates**: Reusable case configurations
- **User Preferences**: Personalized settings and themes

### UI Component System
- **Design System**: Custom theme with CSS variables
- **Components**: Comprehensive UI library using Radix primitives
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Accessibility**: ARIA-compliant components with keyboard navigation
- **Theme Support**: Dynamic light/dark mode switching

### Case Management Features
- **Case Creation**: Comprehensive case entry with patient linking
- **Real-time Tracking**: Live case status and timing
- **Photo Documentation**: Case photo management and storage
- **Analytics Dashboard**: Case statistics and performance metrics
- **Export Functionality**: PDF and CSV export capabilities

## Data Flow

### Authentication Flow
1. User initiates login through Replit Auth
2. OpenID Connect handles authentication
3. User session stored in PostgreSQL
4. JWT tokens managed server-side
5. Protected routes verified via middleware

### Case Management Flow
1. User creates/selects patient record
2. Case details entered through forms
3. Data validated with Zod schemas
4. Database operations via Drizzle ORM
5. Real-time updates through TanStack Query
6. Analytics computed from case data

### Theme Management Flow
1. User preference stored in database
2. Theme state managed in React context
3. CSS variables updated dynamically
4. Preference persisted across sessions

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connector
- **@radix-ui/react-***: UI component primitives
- **@tanstack/react-query**: Server state management
- **drizzle-orm**: Database ORM and query builder
- **express**: Web server framework
- **passport**: Authentication middleware
- **zod**: Schema validation library

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tailwindcss**: CSS framework
- **tsx**: TypeScript execution for development

### Replit-Specific Dependencies
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Development tooling

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite development server with HMR
- **Database**: Neon PostgreSQL development instance
- **Environment Variables**: Replit Secrets for configuration
- **Error Handling**: Runtime error overlay for development

### Production Build
- **Frontend**: Vite production build with optimization
- **Backend**: ESBuild compilation for Node.js deployment
- **Static Assets**: Served from Express static middleware
- **Database Migrations**: Drizzle Kit push for schema updates

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string
- **SESSION_SECRET**: Session encryption key
- **REPL_ID**: Replit environment identifier
- **NODE_ENV**: Environment mode (development/production)

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### July 05, 2025 - Case Management Enhancements
- ✅ **Photo Upload System**: Comprehensive photo upload functionality implemented across all case creation interfaces
- ✅ **Patient Data Management**: Enhanced patient record creation and editing with automatic weight/height/age field handling
- ✅ **Case Editing**: Full case editing capability with patient data updates and photo uploads
- ✅ **Form Validation**: Fixed form submission issues in NewCaseModal by correcting button type and form handlers
- ✅ **Data Consistency**: Patient records now created automatically during case entry when they don't exist
- ✅ **User Interface**: Age fields replace Date of Birth throughout application, Case Duration replaces individual timing fields
- ✅ **Admin Case Review**: Complete admin system for evaluating user cases with privacy protection (excludes patient ID)
- ✅ **Custom Branding**: Integrated custom CaseCurator logo across sidebar, landing page, and application headers

### Technical Achievements
- FormData handling with proper boolean and number-to-string conversions
- Automatic patient record creation from quick-add case entries
- Large photo display (h-64) with clickable full-size viewing
- Dual case creation interfaces: NewCaseModal (popup) and NewCase page (full page) both fully functional

## Changelog

Changelog:
- July 05, 2025. Initial setup and comprehensive case management implementation