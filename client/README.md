# Web Crawler Dashboard - Client

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.x-FF4785.svg?logo=reactquery&logoColor=white)](https://tanstack.com/query/latest)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)

A React and TypeScript frontend for the Web Crawler Dashboard, offering a user-friendly interface to analyze website crawl results.

## Features
- **URL Submission**: Form to submit URLs for analysis.
- **Dashboard Display**: Responsive, paginated, sortable, and searchable table of analysis results.
- **Status Filtering**: Filter analyses by status (e.g., completed, processing, failed).
- **Detailed Analysis View**: Charts for link distribution, heading tags (H1-H6), and a list of broken links with status codes.
- **Bulk Actions**: Re-run or delete multiple analyses.
- **Real-time Updates**: Dynamic status and data updates.
- **Responsive Design**: Optimized for desktop and mobile.

## Getting Started

### Prerequisites
- Node.js (`^20.19.0 || >=22.12.0`, check: `node -v`)
- Backend API running (see [main project README](../README.md)).

### Installation
```bash
cd web-crawler-dashboard/client
npm install
```

### Environment Variables
Create `client/.env` (or `.env.local`):
```
VITE_API_URL=http://localhost:8080/api
```

### Running
```bash
npm run dev
npm run build    # Production build
npm run preview  # Preview production build
```

## Project Structure
```
src/
├── __tests__/      # Unit tests
├── components/     # UI components (Analysis, Dashboard, common)
├── hooks/          # Custom React hooks
├── pages/          # Dashboard and Analysis pages
├── services/       # API interaction logic
├── utils.ts        # Utility functions
├── App.tsx         # Main app and routing
├── index.css       # Global CSS and Tailwind
├── main.tsx        # Entry point
└── types.ts02      # TypeScript types
```

## Key Components
- **Dashboard (`pages/Dashboard.tsx`)**: URL submission, stats, controls, and table for analyses.
- **Analysis Details (`pages/Analysis.tsx`)**: Displays title, URL, metrics, charts, and broken links.
- **Common Components (`components/common/`)**: StatusBadge, SpinningIcon, LoadingSpinner, ErrorAlert, ConfirmationModal, SeoHelmet.
- **Data Management**: React Query hooks (`useAnalysesQuery`, `useAddUrlMutation`), Axios setup (`api.ts`), and utilities (`utils.ts`).

## Code Formatting
```bash
npm run lint    # Lint code
npm run format  # Format with Prettier/ESLint
```

## References
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [TanStack Query Documentation](https://tanstack.com/query/)
- [Recharts Documentation](https://recharts.org/)
- [Lucide React Documentation](https://lucide.dev/)
- [Vitest Documentation](https://vitest.dev/)