# Overview

SmartFlow AI is a white-label social media management platform that combines AI content generation with automated posting and analytics. The application enables businesses to manage social media presence across multiple platforms (Instagram, Twitter, LinkedIn, Facebook) through AI-powered content creation, intelligent scheduling, and comprehensive performance tracking. The white-label architecture supports multi-tenant deployments with customizable branding and isolated data per client.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client uses a modern React-based stack with TypeScript for type safety and component-driven architecture:
- **React 18** with functional components and hooks for state management
- **Wouter** for lightweight client-side routing instead of React Router
- **Tailwind CSS** with custom CSS variables for theme-aware styling and white-label branding support
- **Shadcn/ui** component library providing consistent, accessible UI components
- **React Query** for efficient data fetching, caching, and synchronization with the backend
- **React Hook Form** with Zod validation for type-safe form handling

The design system supports dynamic theming through CSS custom properties, enabling tenant-specific branding customization.

### Backend Architecture
The server implements a RESTful API using Node.js with a service-oriented architecture:
- **Express.js** with TypeScript providing the web framework and API endpoints
- **JWT-based authentication** with middleware for protected routes
- **Service layer pattern** separating business logic into dedicated services (auth, AI content, scheduler, analytics)
- **Memory storage** as the primary data layer with interface abstraction for future database integration
- **Cron-based scheduling** using node-cron for automated post publishing

The backend follows dependency injection principles and maintains clear separation of concerns between routes, services, and data access.

### Data Architecture
The application uses a multi-tenant data model with shared infrastructure:
- **Shared database schema** with tenant isolation through tenantId foreign keys
- **Drizzle ORM** with PostgreSQL dialect for type-safe database operations
- **Memory storage** implementation for development with database-ready interfaces
- **Normalized schema** for users, tenants, posts, and analytics with proper relationships

Schema design supports both development (in-memory) and production (PostgreSQL) environments through abstraction layers.

### AI Integration Architecture
AI capabilities are centralized through a dedicated service layer:
- **OpenAI GPT-4** integration for intelligent content generation
- **DALL-E 3** integration for AI-generated images
- **Platform-specific optimization** tailoring content length and style per social media platform
- **Context-aware generation** incorporating user preferences, brand voice, and platform requirements

The AI service handles prompt engineering, content formatting, and error handling for reliable content generation.

### Authentication & Authorization
Security is implemented through a token-based authentication system:
- **JWT tokens** with configurable expiration for secure session management
- **bcryptjs** for password hashing with salt rounds
- **Role-based access control** supporting user and admin roles per tenant
- **Middleware-based route protection** ensuring authenticated access to protected endpoints

The auth system supports tenant isolation and role-based feature access.

### Scheduling & Automation
Post scheduling uses a cron-based system for reliable automation:
- **Node-cron** for scheduled job execution checking every minute
- **Post status management** tracking draft, scheduled, published, and failed states
- **Platform simulation** for development with hooks for real social media API integration
- **Error handling and retry logic** for robust post publishing

The scheduler supports multiple time zones and platform-specific scheduling rules.

## External Dependencies

### Database Infrastructure
- **PostgreSQL** as the production database with connection pooling
- **Neon Database** serverless PostgreSQL for scalable cloud deployment
- **Drizzle Kit** for database migrations and schema management

### AI & ML Services
- **OpenAI API** for GPT-4 text generation and DALL-E 3 image creation
- **OpenAI JavaScript SDK** for secure API communication and response handling

### Development & Build Tools
- **Vite** for fast frontend development and hot module replacement
- **ESBuild** for efficient backend bundling and TypeScript compilation
- **TypeScript** for compile-time type checking across frontend and backend

### UI & Styling Framework
- **Radix UI** component primitives for accessible, unstyled UI components
- **Tailwind CSS** for utility-first styling with design system support
- **Lucide React** for consistent iconography throughout the application

### Authentication & Security
- **jsonwebtoken** for JWT creation, verification, and payload management
- **bcryptjs** for secure password hashing and verification

### Deployment & Runtime
- **Replit** deployment platform with integrated development environment
- **Node.js** runtime with ES modules support for modern JavaScript features