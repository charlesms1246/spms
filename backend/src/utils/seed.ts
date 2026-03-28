import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Attendance from '../models/Attendance';
import LeaveRequest from '../models/LeaveRequest';
import Payroll from '../models/Payroll';
import PerformanceReview from '../models/PerformanceReview';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/spms');
    console.log('✓ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Attendance.deleteMany({}),
      LeaveRequest.deleteMany({}),
      Payroll.deleteMany({}),
      PerformanceReview.deleteMany({}),
    ]);
    console.log('✓ Cleared existing data');

    // Create Admin Users
    const admins = await User.create([
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@spms.com',
        password: 'admin123',
        employeeId: 'ADM001',
        department: 'Administration',
        designation: 'System Administrator',
        role: 'Admin',
        status: 'Active',
        joiningDate: new Date('2023-01-01'),
        salary: {
          basic: 100000,
          allowances: 20000,
          bonus: 10000,
          deductions: 5000,
        },
      },
    ]);
    console.log('✓ Created 1 Admin user');

    // Create Manager Users
    const managers = await User.create([
      {
        firstName: 'Manager',
        lastName: 'One',
        email: 'manager1@spms.com',
        password: 'manager123',
        employeeId: 'MGR001',
        department: 'IT',
        designation: 'IT Manager',
        role: 'Manager',
        status: 'Active',
        joiningDate: new Date('2023-03-01'),
        salary: {
          basic: 80000,
          allowances: 16000,
          bonus: 8000,
          deductions: 4000,
        },
      },
      {
        firstName: 'Manager',
        lastName: 'Two',
        email: 'manager2@spms.com',
        password: 'manager123',
        employeeId: 'MGR002',
        department: 'HR',
        designation: 'HR Manager',
        role: 'Manager',
        status: 'Active',
        joiningDate: new Date('2023-02-01'),
        salary: {
          basic: 75000,
          allowances: 15000,
          bonus: 7500,
          deductions: 3750,
        },
      },
    ]);
    console.log('✓ Created 2 Manager users');

    // Create Employee Users
    const employees = [];
    const departments = ['IT', 'HR', 'Finance', 'Sales', 'Operations'];
    const designations = ['Developer', 'Analyst', 'Specialist', 'Executive', 'Coordinator'];

    for (let i = 1; i <= 20; i++) {
      const dept = departments[Math.floor(Math.random() * departments.length)];
      const manager = managers[Math.floor(Math.random() * managers.length)];

      employees.push({
        firstName: `Employee`,
        lastName: `${i}`,
        email: `employee${i}@spms.com`,
        password: 'emp123',
        employeeId: `EMP${String(i).padStart(3, '0')}`,
        department: dept,
        designation: designations[Math.floor(Math.random() * designations.length)],
        role: 'Employee',
        manager: manager._id,
        status: Math.random() > 0.8 ? 'Inactive' : 'Active',
        joiningDate: new Date(2023, Math.floor(Math.random() * 8)),
        salary: {
          basic: 50000 + Math.random() * 30000,
          allowances: 10000 + Math.random() * 5000,
          bonus: 5000,
          deductions: 2500,
        },
      });
    }

    const createdEmployees = await User.create(employees);
    console.log('✓ Created 20 Employee users');

    // Create Attendance Records (last 30 days)
    const attendanceRecords = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      for (const emp of createdEmployees.slice(0, 10)) {
        const isPresent = Math.random() > 0.2; // 80% present
        const checkInTime = isPresent
          ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, Math.random() * 30)
          : null;
        const checkOutTime =
          isPresent && Math.random() > 0.3 // 70% check out if present
            ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), 17, Math.random() * 30)
            : null;

        attendanceRecords.push({
          userId: emp._id,
          date: date,
          checkInTime,
          checkOutTime,
        });
      }
    }

    await Attendance.create(attendanceRecords);
    console.log('✓ Created 300 Attendance records');

    // Create Leave Requests
    const leaveRequests = [];
    for (const emp of createdEmployees.slice(0, 5)) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 10);

      leaveRequests.push({
        userId: emp._id,
        leaveType: 'Annual',
        startDate: startDate,
        endDate: new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000),
        daysRequested: 5,
        reason: 'Family vacation',
        status: 'Pending',
      });

      leaveRequests.push({
        userId: emp._id,
        leaveType: 'Sick',
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        daysRequested: 1,
        reason: 'Medical appointment',
        status: 'Approved',
        approvedBy: managers[0]._id,
        approvalDate: new Date(),
      });
    }

    await LeaveRequest.create(leaveRequests);
    console.log('✓ Created 10 Leave requests');

    // Create Payroll Records
    const payrollRecords = [];
    const months = [11, 10, 9, 8, 7]; // Last 5 months

    for (const emp of createdEmployees.slice(0, 15)) {
      for (const month of months) {
        payrollRecords.push({
          userId: emp._id,
          month: month,
          year: 2024,
          basic: emp.salary?.basic || 50000,
          allowances: emp.salary?.allowances || 10000,
          bonus: emp.salary?.bonus || 5000,
          deductions: emp.salary?.deductions || 2500,
          status: Math.random() > 0.3 ? 'Paid' : 'Generated',
          generatedBy: admins[0]._id,
          paidDate: Math.random() > 0.3 ? new Date() : undefined,
        });
      }
    }

    await Payroll.create(payrollRecords);
    console.log('✓ Created 75 Payroll records');

    // Create Performance Reviews
    const performanceReviews = [];
    for (const emp of createdEmployees.slice(0, 10)) {
      for (let i = 0; i < 3; i++) {
        performanceReviews.push({
          userId: emp._id,
          reviewedBy: managers[Math.floor(Math.random() * managers.length)]._id,
          quality: Math.floor(Math.random() * 6),
          teamwork: Math.floor(Math.random() * 6),
          communication: Math.floor(Math.random() * 6),
          leadership: Math.floor(Math.random() * 6),
          comments: `Good performance in Q${i + 1}. Keep up the excellent work!`,
          reviewDate: new Date(2024, Math.floor(Math.random() * 12)),
        });
      }
    }

    await PerformanceReview.create(performanceReviews);
    console.log('✓ Created 30 Performance reviews');

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nTest Credentials:');
    console.log('Admin:     admin@spms.com / admin123');
    console.log('Manager:   manager1@spms.com / manager123');
    console.log('Employee:  employee1@spms.com / emp123');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
