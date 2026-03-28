'use client';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  if (loading || !isAuthenticated || !user) return null;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">My Profile</h1>
          <Link
            href="/profile/edit"
            className="px-6 py-2 bg-gray-200 text-black rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Edit Profile
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="flex items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-black text-3xl font-bold mr-6">
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-black">{user.role}</p>
              <p className="text-sm text-black">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">Personal Information</h3>
              <ProfileField label="First Name" value={user.firstName} />
              <ProfileField label="Last Name" value={user.lastName} />
              <ProfileField label="Email" value={user.email} />
              <ProfileField label="Phone" value={user.phone || 'Not provided'} />
            </div>

            {/* Job Information */}
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">Job Information</h3>
              <ProfileField label="Employee ID" value={user.employeeId} />
              <ProfileField label="Department" value={user.department} />
              <ProfileField label="Designation" value={user.designation} />
              <ProfileField label="Joining Date" value={new Date(user.joiningDate).toLocaleDateString()} />
            </div>
          </div>

          {/* Status */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-black mb-4">Status</h3>
            <div className="flex items-center gap-3">
              <span className="text-black">Current Status:</span>
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                user.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : user.status === 'Inactive'
                  ? 'bg-gray-300 text-black'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {user.status}
              </span>
            </div>
          </div>
        </div>

        {/* Salary Information */}
        {user.salary && (
          <div className="bg-white rounded-lg shadow p-8">
            <h3 className="text-lg font-semibold text-black mb-4">Salary Structure</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <SalaryField label="Basic" amount={user.salary.basic} />
              <SalaryField label="Allowances" amount={user.salary.allowances} />
              <SalaryField label="Bonus" amount={user.salary.bonus} />
              <SalaryField label="Deductions" amount={user.salary.deductions} />
              <SalaryField
                label="Net"
                amount={(user.salary.basic || 0) + (user.salary.allowances || 0) + (user.salary.bonus || 0) - (user.salary.deductions || 0)}
                highlight
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-4">
      <p className="text-sm text-black font-medium">{label}</p>
      <p className="text-black mt-1">{value}</p>
    </div>
  );
}

function SalaryField({ label, amount, highlight }: { label: string; amount: number; highlight?: boolean }) {
  return (
    <div className={`${highlight ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'} rounded-lg p-4`}>
      <p className="text-xs text-black font-medium">{label}</p>
      <p className={`text-lg font-bold ${highlight ? 'text-blue-600' : 'text-black'}`}>
        ₹{amount.toFixed(2)}
      </p>
    </div>
  );
}
