# ClubAguidom - Club Management & QR Attendance System

<p align="center">
  <img src="public/clubAguidom.png" alt="ClubAguidom Logo" width="200"/>
</p>

<h1 align="center">ClubAguidom</h1>

<p align="center">
  A comprehensive solution for managing club members and tracking attendance through a secure QR code system. Built with Next.js, Supabase, and Turso.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
  <a href="#system-architecture"><strong>Architecture</strong></a> ·
  <a href="#getting-started"><strong>Getting Started</strong></a> ·
  <a href="#available-scripts"><strong>Scripts</strong></a> ·
  <a href="#documentation"><strong>Docs</strong></a>
</p>
<br/>

## Features

- **Secure User Authentication**: Handles user sign-up, sign-in, and session management using Supabase Auth.
- **Club Management**: Allows authorized users to create and manage clubs.
- **Member Management**: Club owners can add or remove users from their club.
- **Role-Based Access Control**: Differentiates between regular users and admins, with specific permissions for certain actions.
- **QR Code Attendance**:
  - Admins can generate dynamic, short-lived JWT-based QR codes.
  - Members can scan the QR code to register their attendance in real-time.
- **Attendance-History**: View a log of attendance records for each club.
- **Profile Management**: Users can update their personal information.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Programming Language**: [TypeScript](https://www.typescriptlang.org/)
- **Authentication**: [Supabase](https://supabase.io/)
- **Database**: [Turso](https://turso.tech/) with [Drizzle ORM](https://orm.drizzle.team/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Form Management**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation
- **QR Code Scanning**: [html5-qrcode](https://github.com/mebjas/html5-qrcode)

## System Architecture

This project uses a secure hybrid architecture that separates authentication from the application database.

- **Supabase**: Handles all user authentication and session management on the client and server.
- **Turso**: A Turso database (via Drizzle ORM) stores all application-specific data (user profiles, clubs, attendance records).
- **Security**: The Turso database is **only accessible from the server-side** via secure API endpoints. The client never interacts directly with the application database, ensuring that sensitive data and database credentials remain protected.

For a more detailed explanation, see the [Authentication System Documentation](./docs/AUTHENTICATION_SYSTEM.md).

## Getting Started

Follow these steps to set up and run the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Install Dependencies

This project uses `pnpm` as the preferred package manager, but you can use `npm` or `yarn`.

```bash
pnpm install
# or
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

Rename the `.env.example` file to `.env.local` and add your credentials for Supabase and Turso.

```bash
cp .env.example .env.local
```

Update `.env.local` with your keys:

```env
# Supabase Credentials (for authentication)
# Find these in your Supabase project > Settings > API
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Turso Credentials (for application data)
# Find these in your Turso dashboard
TURSO_DATABASE_URL=your_turso_database_url
TURSO_AUTH_TOKEN=your_turso_auth_token

# JWT Secret for QR Codes
# Generate a strong, random string (e.g., using openssl rand -hex 32)
JWT_SECRET_KEY=your_strong_secret_key
```

For more details, see the [Environment Setup Documentation](./docs/ENVIRONMENT_SETUP.md).

### 4. Run the Database Seed Script

This script will populate the database with initial data required for the application to function correctly.

```bash
npm run db:seed
```

### 5. Run the Development Server

You can now start the development server.

```bash
pnpm dev
# or
npm run dev
```

The application should now be running on [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `dev`: Starts the development server with Next.js Turbopack.
- `build`: Creates a production build of the application.
- `start`: Starts the production server.
- `lint`: Lints the codebase using Next.js ESLint configuration.
- `db:seed`: Executes the database seed script.

## Documentation

For more in-depth information, please refer to the documentation in the `/docs` directory:

- **[API Documentation](./docs/API.md)**: Detailed information about the available API endpoints.
- **[Authentication System](./docs/AUTHENTICATION_SYSTEM.md)**: An explanation of the hybrid auth model.
- **[Environment Setup](./docs/ENVIRONMENT_SETUP.md)**: Guide to setting up environment variables.
