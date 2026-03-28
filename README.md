# Software Personnel Management System (SPMS)

A complete full-stack HR management system for managing employees, attendance, leave, payroll, and performance evaluations.

## 🎯 Project Overview

SPMS is a three-tier architecture application designed to automate HR operations including:

- **Employee Management** - CRUD operations for employee profiles and details
- **Attendance Tracking** - Check-in/out system with work hours calculation
- **Leave Management** - Apply, approve, and reject leave requests with balance tracking
- **Payroll System** - Salary calculation and payslip generation
- **Performance Management** - Review system with metrics (0-5 scale)

---

## 🏗️ Architecture

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | MongoDB Atlas, Mongoose |
| **Authentication** | JWT (7-day expiry), bcrypt (10 salt rounds) |
| **Security** | Helmet.js, CORS, Input Sanitization |

### Folder Structure

```
spms/
├── backend/
│   ├── src/
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── controllers/      # Business logic
│   │   ├── middleware/       # Auth, error handling
│   │   ├── config/          # Database configuration
│   │   ├── utils/           # Helpers and utilities
│   │   └── index.ts         # Express server
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── web/
    ├── app/
    │   ├── auth/            # Login & Register pages
    │   ├── dashboard/       # Role-based dashboards
    │   ├── employees/       # Employee management
    │   ├── attendance/      # Attendance tracking
    │   ├── leave/           # Leave management
    │   ├── payroll/         # Payroll system
    │   ├── performance/     # Performance reviews
    │   ├── profile/         # User profile
    │   └── layout.tsx       # Root layout
    ├── components/
    │   ├── layouts/         # Sidebar, Dashboard layout
    │   ├── forms/           # Reusable forms
    │   └── common/          # Common components
    ├── lib/
    │   ├── api.ts           # API calls
    │   └── useAuth.ts       # Authentication hooks
    ├── package.json
    └── .env.example
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Git

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd spms/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure MongoDB connection in `.env`:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spms
   JWT_SECRET=your-secret-key-min-32-characters
   PORT=5000
   FRONTEND_URL=http://localhost:3001
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```

   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to web directory:**
   ```bash
   cd spms/web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env.local` file:**
   ```bash
   cp .env.example .env.local
   ```

4. **Update API URL in `.env.local`:**
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

   Frontend runs on `http://localhost:3001`

---

## 🔐 Authentication & Security

### User Roles

- **Employee** - Can mark attendance, apply leave, view payroll and performance
- **Manager** - All employee features + team management, leave approval, performance reviews
- **Admin** - Full system control including employee CRUD, payroll generation, reports

### Authentication Flow

1. User registers or logs in
2. Backend validates credentials and returns JWT token (7-day expiry)
3. Token stored in localStorage
4. All API requests include token in Authorization header
5. Protected routes check authentication and role authorization

### Security Features

- bcrypt password hashing (10 salt rounds)
- JWT-based stateless authentication
- Role-Based Access Control (RBAC)
- Input validation and sanitization
- Helmet.js for HTTP headers protection
- CORS configuration
- Protected API routes with middleware

---

## 📊 Database Schema

### Users Collection
```typescript
{
  firstName: string
  lastName: string
  email: string (unique)
  password: string (hashed)
  employeeId: string (unique)
  department: string
  designation: string
  role: 'Employee' | 'Manager' | 'Admin'
  manager: ObjectId (ref: User)
  status: 'Active' | 'Inactive' | 'On Leave'
  salary: {
    basic: number
    allowances: number
    bonus: number
    deductions: number
  }
  joiningDate: Date
  createdAt: Date
  updatedAt: Date
}
```

### Attendance Collection
```typescript
{
  userId: ObjectId (ref: User)
  date: Date
  checkInTime: Date
  checkOutTime: Date
  status: 'Present' | 'Late' | 'Absent'
  workHours: number
  notes: string
  createdAt: Date
  updatedAt: Date
}
```

### LeaveRequests Collection
```typescript
{
  userId: ObjectId (ref: User)
  leaveType: 'Annual' | 'Sick' | 'Casual'
  startDate: Date
  endDate: Date
  daysRequested: number
  reason: string
  status: 'Pending' | 'Approved' | 'Rejected'
  approvedBy: ObjectId (ref: User)
  approvalDate: Date
  rejectionReason: string
  createdAt: Date
  updatedAt: Date
}
```

### Payroll Collection
```typescript
{
  userId: ObjectId (ref: User)
  month: number
  year: number
  basic: number
  allowances: number
  bonus: number
  deductions: number
  netSalary: number
  status: 'Draft' | 'Generated' | 'Paid'
  generatedBy: ObjectId (ref: User)
  paidDate: Date
  createdAt: Date
  updatedAt: Date
}
```

### PerformanceReviews Collection
```typescript
{
  userId: ObjectId (ref: User)
  reviewedBy: ObjectId (ref: User)
  quality: number (0-5)
  teamwork: number (0-5)
  communication: number (0-5)
  leadership: number (0-5)
  overallRating: number
  comments: string
  reviewDate: Date
  createdAt: Date
  updatedAt: Date
}
```

---

## 📡 API Endpoints (40+)

### Authentication (4 endpoints)
```
POST   /api/auth/register      - User registration
POST   /api/auth/login         - User login
GET    /api/auth/me            - Get current user
POST   /api/auth/logout        - User logout
```

### Users (7 endpoints)
```
GET    /api/users              - Get all users (Admin)
GET    /api/users/:id          - Get user by ID
POST   /api/users              - Create user (Admin)
PUT    /api/users/:id          - Update user
DELETE /api/users/:id          - Delete user (Admin)
GET    /api/users/search       - Search users
GET    /api/users/team/members - Get team (Manager)
```

### Attendance (6 endpoints)
```
POST   /api/attendance/check-in         - Check in
POST   /api/attendance/check-out        - Check out
GET    /api/attendance/today            - Get today's attendance
GET    /api/attendance/my-records       - Get my records
GET    /api/attendance/stats            - Get statistics
GET    /api/attendance/team/attendance  - Get team attendance (Manager)
```

### Leave (7 endpoints)
```
POST   /api/leave/apply                 - Apply for leave
GET    /api/leave/my-leaves             - Get my leave requests
GET    /api/leave/balance               - Get leave balance
GET    /api/leave/pending               - Get pending requests (Manager)
PUT    /api/leave/:id/approve           - Approve leave (Manager)
PUT    /api/leave/:id/reject            - Reject leave (Manager)
GET    /api/leave                       - Get all leaves (Admin)
```

### Payroll (7 endpoints)
```
GET    /api/payroll/my-payroll          - Get my payroll
GET    /api/payroll/:id                 - Get payroll by ID
GET    /api/payroll/salary/details      - Get salary details
POST   /api/payroll/generate            - Generate payroll (Admin)
GET    /api/payroll                     - Get all payroll (Admin)
PUT    /api/payroll/:id/mark-paid       - Mark as paid (Admin)
PUT    /api/payroll/salary/:userId      - Update salary (Admin)
```

### Performance (7 endpoints)
```
GET    /api/performance/my-reviews      - Get my reviews
POST   /api/performance/add-review      - Add review (Manager)
GET    /api/performance/team/reviews    - Get team reviews (Manager)
GET    /api/performance/user/:userId    - Get user history
GET    /api/performance                 - Get all reviews (Admin)
PUT    /api/performance/:id             - Update review (Manager)
DELETE /api/performance/:id             - Delete review (Admin)
```

### Health Check (1 endpoint)
```
GET    /api/health                      - Server health check
```

---

## 🎨 Frontend Pages & Routes

### Public Routes
- `/` - Home page
- `/auth/login` - Login page
- `/auth/register` - Registration page

### Protected Routes (Authenticated Users)
- `/dashboard` - Role-based dashboard
- `/attendance` - Attendance tracking
- `/leave` - Leave management
- `/leave/apply` - Apply for leave
- `/payroll` - Payroll view
- `/performance` - Performance reviews
- `/performance/add` - Add review (Manager)
- `/employees` - Employee list (Admin/Manager)
- `/employees/:id` - Employee details
- `/profile` - User profile

### Role-Based Features

**Employee Dashboard**
- View today's attendance status
- Mark attendance (check-in/out)
- View attendance records and statistics
- Apply for leave
- View leave balance
- View payslips
- View performance reviews

**Manager Dashboard**
- View team members
- Monitor team attendance
- Approve/reject leave requests
- View team performance reviews
- Add performance reviews for team members

**Admin Dashboard**
- View all employees
- Manage employee information
- Generate payroll
- View all leave requests
- Generate reports
- System settings

---

## 🔄 Attendance System

- **Check-in**: Records entry time (Before 9:15 AM = Present, After = Late)
- **Check-out**: Records exit time and calculates work hours
- **Status**: Automatically assigned based on check-in time
- **Statistics**: Monthly attendance %, avg work hours, total hours worked
- **Manager View**: Monitor team attendance in real-time

---

## 📋 Leave Management

### Leave Types with Limits
- **Annual Leave**: 20 days/year
- **Sick Leave**: 10 days/year
- **Casual Leave**: 7 days/year

### Workflow
1. Employee applies for leave with dates and reason
2. Manager receives notification (pending approval)
3. Manager can approve or reject with comments
4. Employee can view request status
5. Leave balance auto-updates for approved leaves

---

## 💰 Payroll System

### Salary Calculation
```
Net Salary = Basic + Allowances + Bonus - Deductions
```

### Features
- Auto-calculation of net salary
- Payslip generation (monthly)
- Admin can generate payroll for all/specific employees
- Track payment status (Draft/Generated/Paid)
- View detailed salary breakdown

### Salary Structure
- **Basic**: 70% of total package
- **Allowances**: 20% of total package
- **Bonus**: 10% of total package
- **Deductions**: Variable (5% average)

---

## ⭐ Performance Management

### Metrics (0-5 Scale)
- **Quality**: Work output quality
- **Teamwork**: Collaboration and cooperation
- **Communication**: Clarity and effectiveness
- **Leadership**: Initiative and responsibility

### Features
- Manager reviews team members
- Overall rating auto-calculated (average of 4 metrics)
- Performance history and trends
- Review date tracking
- Detailed comments and feedback

---

## 🧪 Sample Data Seeding

To seed the database with sample data:

```bash
cd backend
npm run seed
```

This creates:
- 5 Admin users
- 10 Manager users
- 50 Employee users
- Sample attendance records
- Sample leave requests
- Sample payroll records
- Sample performance reviews

---

## 🚢 Deployment

### Backend (Heroku/Railway)
1. Push code to repository
2. Connect to Heroku/Railway
3. Set environment variables
4. Deploy automatically

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy on push to main

---

## 📚 API Testing

### Using Postman
1. Import API endpoints from documentation
2. Set authorization header: `Bearer {token}`
3. Test endpoints by role

### Example Login Request
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employee@example.com",
    "password": "password123"
  }'
```

### Example Check-in Request
```bash
curl -X POST http://localhost:5000/api/attendance/check-in \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

---

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/spms
JWT_SECRET=your-secret-key-min-32-characters
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ENV=development
```

---

## 📝 Development Guide

### Adding New Features

1. **Backend**
   - Create model in `/src/models`
   - Create controller in `/src/controllers`
   - Create routes in `/src/routes`
   - Add endpoints to Express app

2. **Frontend**
   - Create API functions in `/lib/api.ts`
   - Create pages in `/app`
   - Use `useAuth()` hook for authentication
   - Use API functions for data fetching

### Code Style
- Use TypeScript for type safety
- Follow naming conventions (camelCase for variables, PascalCase for components)
- Add comments for complex logic
- Keep components modular and reusable

---

## 🐛 Troubleshooting

### MongoDB Connection Errors
- Check connection string in `.env`
- Verify IP whitelist in MongoDB Atlas
- Ensure database is created

### API Not Responding
- Check backend server is running
- Verify API URL in frontend `.env.local`
- Check CORS configuration

### Authentication Issues
- Clear localStorage and retry login
- Verify JWT_SECRET matches between login/logout
- Check token expiry time

---

## 👥 Support

For issues or questions, refer to:
- API documentation in this README
- Code comments in source files
- Component documentation in code

---

## ✨ Features Checklist

- ✅ User authentication and registration
- ✅ Role-based access control
- ✅ Employee management (CRUD)
- ✅ Attendance tracking with auto-status
- ✅ Leave management with approval workflow
- ✅ Payroll generation and tracking
- ✅ Performance review system
- ✅ Dashboard for all roles
- ✅ Search and filtering
- ✅ Real-time notifications
- ✅ MongoDB integration
- ✅ JWT authentication
- ✅ Input validation and sanitization
- ✅ Error handling
- ✅ Responsive design
- ✅ Role-based dashboards

---

**Built with ❤️ using Next.js, Express.js, and MongoDB**
