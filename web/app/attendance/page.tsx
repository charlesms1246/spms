'use client';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/lib/useAuth';
import { attendanceApi } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function AttendancePage() {
  const { isAuthenticated, loading, user } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [stats, setStats] = useState<any>({});
  const [records, setRecords] = useState<any[]>([]);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadAttendanceData();
      const interval = setInterval(loadAttendanceData, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadAttendanceData = async () => {
    try {
      const today = await attendanceApi.getToday();
      setTodayAttendance(today.attendance);
      setCheckedIn(!!today.attendance?.checkInTime);
      setCheckedOut(!!today.attendance?.checkOutTime);

      const statsData = await attendanceApi.getStats();
      setStats(statsData.stats);

      const recordsData = await attendanceApi.getRecords();
      setRecords(recordsData.records || []);
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  };

  const handleCheckIn = async () => {
    try {
      await attendanceApi.checkIn();
      loadAttendanceData();
    } catch (error: any) {
      alert(error.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceApi.checkOut();
      loadAttendanceData();
    } catch (error: any) {
      alert(error.message || 'Check-out failed');
    }
  };

  if (loading || !isAuthenticated) return null;

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-8 text-black">Attendance</h1>

        {/* Check In/Out Section */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-black">Today's Attendance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-black mb-2">Status</p>
              <p className="text-2xl font-bold text-black">
                {!checkedIn ? '⭕ Not Checked' : checkedOut ? '✅ Checked Out' : '🟢 Checked In'}
              </p>
            </div>
            <div>
              <p className="text-black mb-2">Check-In Time</p>
              <p className="text-2xl font-bold text-black">
                {todayAttendance?.checkInTime
                  ? new Date(todayAttendance.checkInTime).toLocaleTimeString()
                  : '--:--'}
              </p>
            </div>
            <div>
              <p className="text-black mb-2">Check-Out Time</p>
              <p className="text-2xl font-bold text-black">
                {todayAttendance?.checkOutTime
                  ? new Date(todayAttendance.checkOutTime).toLocaleTimeString()
                  : '--:--'}
              </p>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={handleCheckIn}
              disabled={checkedIn}
              className="px-8 py-3 bg-green-200 text-black rounded-lg font-semibold disabled:bg-gray-400 disabled:text-black hover:bg-green-300 transition"
            >
              Check In
            </button>
            <button
              onClick={handleCheckOut}
              disabled={!checkedIn || checkedOut}
              className="px-8 py-3 bg-red-200 text-black rounded-lg font-semibold disabled:bg-gray-400 disabled:text-black hover:bg-red-300 transition"
            >
              Check Out
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard label="Present" value={stats.present || 0} color="blue" />
          <StatCard label="Late" value={stats.late || 0} color="yellow" />
          <StatCard label="Absent" value={stats.absent || 0} color="red" />
          <StatCard label="Attendance %" value={`${stats.attendancePercentage || 0}%`} color="green" />
        </div>

        {/* Recent Records */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-black">Recent Attendance Records</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black">Check-In</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black">Check-Out</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black">Hours</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {records.slice(0, 10).map((record: any) => (
                  <tr key={record._id} className="hover:bg-gray-200">
                    <td className="px-6 py-3 text-black">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-black">
                      {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '--'}
                    </td>
                    <td className="px-6 py-3 text-black">
                      {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '--'}
                    </td>
                    <td className="px-6 py-3 text-black">
                      {record.workHours ? `${record.workHours.toFixed(2)}h` : '--'}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        record.status === 'Present'
                          ? 'bg-green-100 text-green-800'
                          : record.status === 'Late'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ label, value, color }: any) {
  const colorMap: any = {
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    green: 'bg-green-100 text-green-800',
  };

  return (
    <div className={`${colorMap[color]} rounded-lg p-6`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
