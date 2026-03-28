'use client';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/lib/useAuth';
import { userApi, attendanceApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [stats, setStats] = useState<any>({});
  const [teamCount, setTeamCount] = useState(0);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadData();
    }
  }, [isAuthenticated, user]);

  const loadData = async () => {
    try {
      if (user?.role === 'Admin' || user?.role === 'Manager') {
        const teamData = await userApi.getTeam();
        setTeamCount(teamData.total);
      }

      const attendanceData = await attendanceApi.getToday();
      setTodayAttendance(attendanceData.attendance);

      const statsData = await attendanceApi.getStats();
      setStats(statsData.stats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  if (loading || !isAuthenticated) return null;

  return (
    <DashboardLayout>
      {user?.role === 'Admin' ? (
        <AdminDashboard teamCount={teamCount} stats={stats} />
      ) : user?.role === 'Manager' ? (
        <ManagerDashboard teamCount={teamCount} todayAttendance={todayAttendance} stats={stats} />
      ) : (
        <EmployeeDashboard stats={stats} todayAttendance={todayAttendance} />
      )}
    </DashboardLayout>
  );
}

function AdminDashboard({ teamCount, stats }: any) {
  const [stats2, setStats2] = useState<any>({});

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      const data = await userApi.getAll();
      const attendanceStats = await attendanceApi.getStats();
      setStats2({
        totalEmployees: data.total,
        ...attendanceStats.stats,
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-black">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon="👥" label="Total Employees" value={stats2.totalEmployees || 0} />
        <StatCard icon="📅" label="Present Today" value={stats2.present || 0} />
        <StatCard icon="⏰" label="Late" value={stats2.late || 0} />
        <StatCard icon="❌" label="Absent" value={stats2.absent || 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickActionCard
          title="Generate Payroll"
          description="Create and manage payroll for all employees"
          href="/payroll"
          icon="💰"
        />
        <QuickActionCard
          title="Manage Employees"
          description="Add, edit, or remove employee information"
          href="/employees"
          icon="👥"
        />
        <QuickActionCard
          title="Leave Approvals"
          description="Review and approve pending leave requests"
          href="/leave"
          icon="🏖️"
        />
        <QuickActionCard
          title="Performance Reviews"
          description="View and manage employee performance"
          href="/performance"
          icon="⭐"
        />
      </div>
    </div>
  );
}

function ManagerDashboard({ teamCount, todayAttendance, stats }: any) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-black">Manager Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon="👥" label="Team Members" value={teamCount} />
        <StatCard icon="📅" label="Present" value={stats.present || 0} />
        <StatCard icon="⏰" label="Late" value={stats.late || 0} />
        <StatCard icon="🏖️" label="On Leave" value={stats.absent || 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickActionCard
          title="Team Attendance"
          description="Monitor your team's attendance"
          href="/attendance"
          icon="📅"
        />
        <QuickActionCard
          title="Leave Requests"
          description="Approve or reject team leave requests"
          href="/leave"
          icon="🏖️"
        />
        <QuickActionCard
          title="Performance Reviews"
          description="Add and manage performance reviews"
          href="/performance"
          icon="⭐"
        />
        <QuickActionCard
          title="Team Members"
          description="View and manage team information"
          href="/employees"
          icon="👥"
        />
      </div>
    </div>
  );
}

function EmployeeDashboard({ stats, todayAttendance }: any) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-black">My Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={todayAttendance?.checkInTime ? '✅' : '⭕'}
          label="Today Status"
          value={todayAttendance?.status || 'Not Marked'}
        />
        <StatCard icon="⏱️" label="Work Hours" value={stats.totalWorkHours ? `${stats.totalWorkHours.toFixed(2)}h` : '0h'} />
        <StatCard icon="📊" label="Attendance %" value={`${stats.attendancePercentage || 0}%`} />
        <StatCard icon="🏖️" label="Leave Pending" value="0" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickActionCard
          title="Check Attendance"
          description="Mark your check-in and check-out"
          href="/attendance"
          icon="📅"
        />
        <QuickActionCard
          title="Apply for Leave"
          description="Request annual, sick, or casual leave"
          href="/leave"
          icon="🏖️"
        />
        <QuickActionCard
          title="View Payslips"
          description="Download and view your payslips"
          href="/payroll"
          icon="💰"
        />
        <QuickActionCard
          title="Performance"
          description="View your performance reviews"
          href="/performance"
          icon="⭐"
        />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-black text-sm">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );
}

function QuickActionCard({ title, description, href, icon }: any) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-black mb-1">{title}</h3>
            <p className="text-sm text-black">{description}</p>
          </div>
          <span className="text-3xl">{icon}</span>
        </div>
      </div>
    </Link>
  );
}
