# Toro Eats Admin Panel

A Next.js-based admin dashboard for managing restaurant reviews, dishes, and user data for the Toro Eats platform.

## Features

- 📊 Dashboard with real-time statistics
- 👥 User management
- 🍽️ Restaurant management
- ⭐ Review management
- 🌆 City-based data organization
- 🔒 Secure admin authentication

## Tech Stack

- [Next.js 15](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide React](https://lucide.dev/) - Icons
- [Radix UI](https://www.radix-ui.com/) - Headless UI components
- [TanStack Table](https://tanstack.com/table) - Data tables
- [Axios](https://axios-http.com/) - API requests
- [JWT](https://jwt.io/) - Authentication

## Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm
- [Toro Backend Server](https://github.com/Volare-Solutions/toro-backend)

## Getting Started

1. Clone the repository:
    ```bash
    git clone <repository-url>
    cd toro-eats-admin
    ```

2. Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3. Create a `.env` file in the root directory:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:3001
    JWT_SECRET=your-secret-key
    ADMIN_PASSWORD=secret-password
    ```

4. Ensure the [backend server](https://github.com/Volare-Solutions/toro-backend) is running

5. Run the development server:
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details. 
