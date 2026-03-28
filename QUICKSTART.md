# Quick Start Guide - SPMS

## 📋 Prerequisites
- Node.js 18+ and npm installed
- MongoDB Atlas account (free tier available)
- Git

---

## 🚀 5-Minute Setup

### Step 1: Clone & Install Dependencies

```bash
# Backend
cd spms/backend
npm install

# Frontend (in a new terminal)
cd spms/web
npm install
```

### Step 2: Configure Environment Variables

**Backend Setup (.env file)**
```bash
cd spms/backend
cp .env.example .env
```

Edit `.env` and add:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spms
JWT_SECRET=your-super-secret-key-min-32-characters-long
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
```

**Frontend Setup (.env.local file)**
```bash
cd spms/web
cp .env.example .env.local
```

File already configured:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Step 3: Start Backend

```bash
cd spms/backend

# Option 1: Development mode with auto-reload
npm run dev

# Option 2: Production build
npm run build
npm start
```

Backend runs on: **http://localhost:5000**

### Step 4: Start Frontend

```bash
cd spms/web

# Development mode
npm run dev

# Production build
npm run build
npm start
```

Frontend runs on: **http://localhost:3001**

---

## 🌱 Seed Sample Data (Optional)

Before first use, populate the database with sample data:

```bash
cd spms/backend
npm run seed
```

This creates:
- 1 Admin account
- 2 Manager accounts
- 20 Employee accounts
- Sample attendance, leave, payroll, and performance data

**Test Login Credentials:**
```
Admin:    admin@spms.com / admin123
Manager:  manager1@spms.com / manager123
Employee: employee1@spms.com / emp123
```

---

## 🎯 Access the Application

1. Open browser: **http://localhost:3001**
2. Login with credentials above
3. Explore role-based features

---

## 📁 Project Structure at a Glance

```
spms/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── models/       # 5 MongoDB collections
│   │   ├── routes/       # 40+ API endpoints
│   │   ├── controllers/  # Business logic
│   │   └── index.ts      # Express server
│   └── package.json
│
└── web/                  # Next.js 16 Frontend
    ├── app/
    │   ├── auth/         # Login & Register
    │   ├── dashboard/    # 3 role-based dashboards
    │   ├── employees/    # Employee management
    │   ├── attendance/   # Check-in/out system
    │   ├── leave/        # Leave requests
    │   ├── payroll/      # Salary management
    │   ├── performance/  # Reviews
    │   └── profile/      # User profile
    ├── components/       # Reusable components
    ├── lib/             # API client & hooks
    └── package.json
```

---

## 🔑 Key Features to Try

### 1. **Authentication**
- Register new account
- Login with credentials
- JWT token expires in 7 days

### 2. **Employee Dashboard**
- Check attendance (check-in/out)
- View attendance statistics
- Apply for leave
- View payslips
- See performance reviews

### 3. **Manager Dashboard**
- Approve/reject leave requests
- Monitor team attendance
- Add performance reviews
- Manage team information

### 4. **Admin Dashboard**
- Create/edit employees
- Generate monthly payroll
- View all reports
- System management

---

## 🔐 Authentication Details

- **Method**: JWT tokens stored in localStorage
- **Expiry**: 7 days
- **Password**: bcrypt hashed (10 salt rounds)
- **Roles**: Employee, Manager, Admin

### Example: Get Auth Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employee1@spms.com",
    "password": "emp123"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "firstName": "Employee",
    "lastName": "1",
    "email": "employee1@spms.com",
    "role": "Employee"
  }
}
```

---

## 🧪 API Testing

### Using curl
```bash
# Get all employees (Admin only)
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer {token}"

# Check-in
curl -X POST http://localhost:5000/api/attendance/check-in \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"

# Apply leave
curl -X POST http://localhost:5000/api/leave/apply \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "leaveType": "Annual",
    "startDate": "2024-03-01",
    "endDate": "2024-03-05",
    "reason": "Vacation"
  }'
```

### Using Postman
1. Import endpoints from API documentation
2. Set Authorization header: `Bearer {token}`
3. Test endpoints by role

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module" errors
**Solution**: Ensure dependencies are installed
```bash
npm install
```

### Issue: MongoDB connection failed
**Solution**:
- Check connection string in `.env`
- Verify IP is whitelisted in MongoDB Atlas
- Test connection: `mongodb+srv://...`

### Issue: CORS errors
**Solution**: Check `FRONTEND_URL` in backend `.env`
```
FRONTEND_URL=http://localhost:3001
```

### Issue: Blank page in frontend
**Solution**:
- Check backend is running on port 5000
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Clear browser cache and retry

---

## 📊 Database Collections

5 MongoDB collections with 40+ indexed fields:

1. **Users** - Employee, Manager, Admin accounts
2. **Attendance** - Daily check-in/out records
3. **LeaveRequests** - Leave applications & approvals
4. **Payroll** - Monthly salary & payslips
5. **PerformanceReviews** - Employee reviews

---

## 📈 Attendance System

- **Check-in before 9:15 AM** = Present
- **Check-in after 9:15 AM** = Late
- **No check-in** = Absent
- Auto-calculate work hours
- Monthly statistics

---

## 💰 Leave Management

**Annual Limits:**
- Annual Leave: 20 days
- Sick Leave: 10 days
- Casual Leave: 7 days

**Workflow:**
Employee → Apply → Manager Approves/Rejects → Update Balance

---

## 🧑‍💼 Role Comparison

| Feature | Employee | Manager | Admin |
|---------|----------|---------|-------|
| View Profile | ✅ | ✅ | ✅ |
| Mark Attendance | ✅ | ✅ | ✅ |
| Apply Leave | ✅ | ✅ | ✅ |
| Approve Leave | ❌ | ✅ | ✅ |
| View Team | ❌ | ✅ | ✅ |
| Add Reviews | ❌ | ✅ | ✅ |
| Manage Employees | ❌ | ❌ | ✅ |
| Generate Payroll | ❌ | ❌ | ✅ |
| View Reports | ❌ | ❌ | ✅ |

---

## 📱 Responsive Design

- ✅ Desktop (1920px+)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (320px - 767px)

---

## 🚀 Next Steps

1. **Explore Admin Features**: Create employees, generate payroll
2. **Test Manager Features**: Approve leave, add reviews
3. **Try Employee Features**: Mark attendance, apply leave
4. **Review Code**: Check `/backend/src` and `/web/app` for implementation details

---

## 📞 Support

- Check console for error messages
- Review `.env` configuration
- Verify all dependencies are installed
- Check MongoDB connection

---

## 🎓 Learning Resources

- **Backend**: See `/backend/README.md`
- **Frontend**: Check individual page components
- **API**: All endpoints documented in main README.md

---

**Enjoy building with SPMS! 🚀**

Made with ❤️ using Next.js, Express.js, and MongoDB
