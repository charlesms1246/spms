'use client';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/lib/useAuth';
import { leaveApi } from '@/lib/api';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LeavePage() {
  const { isAuthenticated, loading, user } = useAuth();
  const [myLeaves, setMyLeaves] = useState<any[]>([]);
  const [balance, setBalance] = useState<any>({});
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [showPending, setShowPending] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadLeaveData();
    }
  }, [isAuthenticated]);

  const loadLeaveData = async () => {
    try {
      const myData = await leaveApi.getMyLeaves();
      setMyLeaves(myData.leaves || []);

      const balanceData = await leaveApi.getBalance();
      setBalance(balanceData.balance);

      if (user?.role === 'Manager' || user?.role === 'Admin') {
        const pendingData = await leaveApi.getPending();
        setPendingLeaves(pendingData.leaves || []);
        setShowPending(true);
      }
    } catch (error) {
      console.error('Error loading leave data:', error);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await leaveApi.approve(id);
      loadLeaveData();
      alert('Leave approved successfully');
    } catch (error: any) {
      alert(error.message || 'Failed to approve leave');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await leaveApi.reject(id, reason);
      loadLeaveData();
      alert('Leave rejected successfully');
    } catch (error: any) {
      alert(error.message || 'Failed to reject leave');
    }
  };

  if (loading || !isAuthenticated) return null;

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">Leave Management</h1>
          <Link
            href="/leave/apply"
            className="px-6 py-2 bg-gray-200 text-black rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Apply for Leave
          </Link>
        </div>

        {/* Leave Balance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <BalanceCard type="Annual" days={balance.Annual || 0} />
          <BalanceCard type="Sick" days={balance.Sick || 0} />
          <BalanceCard type="Casual" days={balance.Casual || 0} />
        </div>

        {/* My Leave Requests */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-black">My Leave Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black">From</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black">To</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black">Days</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {myLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-3 text-center text-black">
                      No leave requests found
                    </td>
                  </tr>
                ) : (
                  myLeaves.map((leave: any) => (
                    <tr key={leave._id} className="hover:bg-gray-200">
                      <td className="px-6 py-3">
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {leave.leaveType}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-black">{new Date(leave.startDate).toLocaleDateString()}</td>
                      <td className="px-6 py-3 text-black">{new Date(leave.endDate).toLocaleDateString()}</td>
                      <td className="px-6 py-3 text-black">{leave.daysRequested} days</td>
                      <td className="px-6 py-3">
                        <StatusBadge status={leave.status} />
                      </td>
                      <td className="px-6 py-3 text-sm text-black">{leave.reason}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Approvals (Manager Only) */}
        {showPending && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-black">Pending Leave Requests</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-black">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-black">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-black">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-black">From</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-black">To</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-black">Days</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-black">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pendingLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-3 text-center text-black">
                        No pending requests
                      </td>
                    </tr>
                  ) : (
                    pendingLeaves.map((leave: any) => (
                      <tr key={leave._id} className="hover:bg-gray-200">
                        <td className="px-6 py-3 text-black">{leave.userId?.firstName} {leave.userId?.lastName}</td>
                        <td className="px-6 py-3">
                          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                            {leave.userId?.role}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {leave.leaveType}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-black">{new Date(leave.startDate).toLocaleDateString()}</td>
                        <td className="px-6 py-3 text-black">{new Date(leave.endDate).toLocaleDateString()}</td>
                        <td className="px-6 py-3 text-black">{leave.daysRequested} days</td>
                        <td className="px-6 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(leave._id)}
                              className="px-3 py-1 bg-green-200 text-black rounded text-sm hover:bg-green-300 transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(leave._id)}
                              className="px-3 py-1 bg-red-200 text-black rounded text-sm hover:bg-red-300 transition"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function BalanceCard({ type, days }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-black text-sm font-medium mb-2">{type} Leave</h3>
      <p className="text-3xl font-bold text-gray-900">{days} days</p>
      <p className="text-sm text-black mt-2">Remaining balance</p>
    </div>
  );
}

function StatusBadge({ status }: any) {
  const colors: any = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Approved: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${colors[status]}`}>
      {status}
    </span>
  );
}
