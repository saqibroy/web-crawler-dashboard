# Web Crawler Dashboard - Client

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.x-FF4785.svg?logo=reactquery&logoColor=white)](https://tanstack.com/query/latest)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)

The intuitive frontend application for the Web Crawler Dashboard, built with React and TypeScript, providing a user-friendly interface to analyze website crawl results.

## Features

### Core Application Features (Client-Side Focus)
- **URL Submission**: Provides a form to submit new website URLs for analysis.
- **Dashboard Display**: Presents all analysis results in a responsive, paginated, sortable, and searchable table.
- **Status Filtering**: Allows filtering analyses by their current status (e.g., `completed`, `processing`, `failed`).
- **Detailed Analysis View**: Enables navigation to a dedicated page for in-depth insights into a specific analysis, including:
  * Visual charts for link distribution (internal vs. external).
  * Charts for heading tag distribution (H1-H6).
  * A clear list of identified broken links with their status codes.
- **Bulk Actions**: Supports selecting multiple analyses for bulk operations like re-running or deleting.
- **Real-time Updates**: Dynamically updates analysis statuses and data on the dashboard as backend processing occurs.
- **Responsive Design**: Adapts the user interface for optimal viewing and interaction across various devices (desktop and mobile).

## Getting Started

### Prerequisites
- **Node.js**: Version `^20.19.0 || >=22.12.0` (check with `node -v`)
- **Backend server running**: This frontend application requires the backend API to be running. Please refer to the [main project README](../README.md) for instructions on how to start the full stack.

### Installation
To set up and run only the frontend application:

```bash
# Navigate to the client directory
cd web-crawler-dashboard/client

# Install dependencies
npm install
```

### Environment Variables
Create a `.env` file (or `.env.local` for Vite) in the `client/` directory with the following content. This tells the frontend where to find your backend API.

```
VITE_API_URL=http://localhost:8080/api
```

### Running the Application
Once dependencies are installed and the `.env` file is set up:

```bash
# Start the frontend development server
npm run dev

# Build the application for production
npm run build

# Preview the production build locally
npm run preview
```

## Project Structure

```
src/
├── __tests__/      # Unit tests for components and hooks
├── components/     # Reusable UI components organized by feature (Analysis, Dashboard, common)
│   ├── Analysis/   # Components specific to the Analysis detail page
│   ├── common/     # Generic, reusable UI components (e.g., buttons, modals, spinners)
│   └── Dashboard/  # Components specific to the Dashboard page
├── hooks/          # Custom React hooks (e.g., for data fetching, debouncing)
├── pages/          # Top-level page components (Dashboard, Analysis detail)
├── services/       # API interaction logic (Axios setup, API calls)
├── utils.ts        # Utility functions (e.g., status helpers, error handling, sorting)
├── App.tsx         # Main application component and routing setup
├── index.css       # Global CSS styles and Tailwind directives
├── main.tsx        # Entry journal for the React application
└── types.ts        # Centralized TypeScript interfaces and types
```

## Key Components & Concepts

### Dashboard (`pages/Dashboard.tsx`)
The main entry point for managing analyses. It integrates:
- **DashboardForm**: For submitting new URLs.
- **DashboardStats**: Displays overall analysis counts and acts as status filters.
- **DashboardControls**: Provides bulk actions (delete, stop, re-run) and a search input.
- **DashboardTable**: Renders the list of analyses, handling pagination, sorting, and selection.

### Analysis Details (`pages/Analysis.tsx`)
Provides a comprehensive view of a single analysis, utilizing:
- **AnalysisHeader**: Displays the page title, URL, and overall status.
- **AnalysisKeyMetrics**: Shows quick stats like link counts and HTML version.
- **AnalysisLinksChart**: Visualizes internal vs. external link distribution.
- **AnalysisHeadingsChart**: A bar chart showing the count of each heading tag (H1-H6) found on the page.
- **AnalysisBrokenLinks**: Lists all detected broken links and their status codes.
- **AnalysisDetailsCard**: Presents additional meta-information about the analysis.

### Common Components (`components/common/`)
Includes generic, reusable UI elements:
- **StatusBadge**: Displays analysis status with appropriate colors and icons.
- **SpinningIcon**: A reusable SVG component for loading indicators.
- **LoadingSpinner**: A wrapper around SpinningIcon for displaying loading states with messages.
- **ErrorAlert**: Displays dismissible error messages.
- **ConfirmationModal**: A generic modal for user confirmations.
- **SeoHelmet**: Manages page metadata for SEO and browser tabs.

### Data Management
- **useAnalysesData Hook**: Custom React Query hooks (`useAnalysesQuery`, `useAddUrlMutation`, etc.) for fetching and mutating analysis data, handling caching and real-time updates.
- **api.ts**: Configures Axios for API requests, including JWT authentication and error interception.
- **utils.ts**: Contains shared utility functions, including status display logic (`getStatusDisplay`, `getStatusColorClasses`), sorting logic (`sortAnalyses`), and error handling helpers.

## Code Formating

```bash
# Lint code for style and potential errors
npm run lint

# Format code using Prettier and ESLint rules
npm run format
```

## References

### Official Documentation
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [TanStack Query Documentation](https://tanstack.com/query/)
- [Recharts Documentation](https://recharts.org/)
- [Lucide React Documentation](https://lucide.dev/)
- [Vitest Documentation](https://vitest.dev/)