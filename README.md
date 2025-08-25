# Student Placement Management System - Frontend

A comprehensive React + TypeScript + ShadCN UI frontend for managing student placements, recruiter verifications, and company statistics.

## 🚀 Features

- **Student Placement Submission**: Easy-to-use form for students to submit placement information
- **Recruiter Verification**: Streamlined process for recruiters to verify student placements
- **Company Statistics**: Comprehensive analytics and reporting dashboard
- **Real-time Validation**: Form validation using Zod schemas
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modern UI**: Beautiful components built with ShadCN UI

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **UI Components**: ShadCN UI + Tailwind CSS
- **Form Management**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: Sonner (Toast notifications)

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                     # ShadCN UI components
│   ├── forms/                  # Form components
│   │   ├── StudentForm.tsx     # Student placement form
│   │   ├── RecruiterForm.tsx   # Recruiter verification form
│   │   └── CompanySearch.tsx   # Company autocomplete
│   └── pages/                  # Page components
│       ├── Home.tsx            # Landing page
│       ├── StudentSubmission.tsx
│       ├── RecruiterVerification.tsx
│       └── CompanyStats.tsx
├── hooks/                      # Custom hooks
│   ├── useStudents.ts          # Student data management
│   └── useCompanies.ts         # Company data management
├── lib/                        # Utilities
│   ├── api.ts                  # API functions
│   ├── types.ts                # TypeScript interfaces
│   ├── validations.ts          # Zod validation schemas
│   └── utils.ts                # Helper functions
└── App.tsx                     # Main application component
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend server running on `http://localhost:5000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

### Build for Production

```bash
npm run build
```

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔧 Configuration

The application is configured to connect to a backend server at `http://localhost:5000`. You can modify the API base URL in `src/lib/api.ts`.

## 📱 Pages

1. **Home** (`/`) - Landing page with navigation and overview
2. **Submit Placement** (`/submit`) - Student placement submission form
3. **Verify Students** (`/verify`) - Recruiter verification interface
4. **Statistics** (`/stats`) - Company and placement analytics

## 🎨 UI Components

The application uses ShadCN UI components for a consistent and modern design:

- **Forms**: Input, Textarea, Select, Checkbox, Radio Group
- **Layout**: Card, Separator, Badge
- **Data Display**: Table, Badge
- **Feedback**: Toast notifications, Loading states
- **Navigation**: Header with responsive navigation

## 🔌 API Integration

The frontend integrates with the following backend endpoints:

- `POST /api/students` - Submit student placement
- `GET /api/students` - Fetch all students
- `GET /api/students/company/:name` - Fetch students by company
- `PUT /api/students/:id` - Update student information
- `POST /api/students/:id/verify` - Verify student placement
- `GET /api/companies` - Fetch company list
- `GET /api/companies/stats` - Fetch company statistics

## 🧪 Form Validation

All forms use Zod schemas for validation:

- **Student Form**: Validates required fields, batch years, and conditional company/package requirements
- **Recruiter Form**: Validates feedback, rating, and employment status
- **Real-time validation** with error messages and visual feedback

## 📊 Data Management

- **Custom Hooks**: `useStudents` and `useCompanies` for state management
- **API Integration**: Centralized API functions with error handling
- **Loading States**: Proper loading indicators and error handling
- **Toast Notifications**: User feedback for all operations

## 🎯 Key Features

### Student Submission
- Comprehensive form with validation
- Company autocomplete with search
- Conditional fields based on placement status
- Success confirmation with printable details

### Recruiter Verification
- Company selection and student listing
- Bulk verification capabilities
- Employment status tracking
- Rating and feedback system

### Analytics Dashboard
- Company-wise statistics
- Search and filtering capabilities
- Sortable data tables
- Key insights and metrics

## 🚀 Deployment

The application can be deployed to any static hosting service:

1. Build the application: `npm run build`
2. Deploy the `dist/` folder to your hosting service
3. Ensure the backend API is accessible from your domain

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.
