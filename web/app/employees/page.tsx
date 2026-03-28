'use client';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth, useRequireRole } from '@/lib/useAuth';
import { userApi } from '@/lib/api';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function EmployeesPage() {
  const { isAuthenticated, loading, user } = useRequireRole(['Admin', 'Manager']);
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadEmployees();
    }
  }, [isAuthenticated, filterDept]);

  const loadEmployees = async () => {
    try {
      if (user?.role === 'Manager') {
        const data = await userApi.getTeam();
        setEmployees(data.team || []);
      } else {
        const params: any = {};
        if (filterDept) params.department = filterDept;
        const data = await userApi.getAll(params);
        setEmployees(data.users || []);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 0) {
      try {
        const data = await userApi.search(query);
        setEmployees(data.users || []);
      } catch (error) {
        console.error('Error searching:', error);
      }
    } else {
      loadEmployees();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      await userApi.delete(id);
      alert('Employee deleted successfully');
      loadEmployees();
    } catch (error: any) {
      alert(error.message || 'Failed to delete employee');
    }
  };

  if (loading || !isAuthenticated) return null;

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">Employees</h1>
          {user?.role === 'Admin' && (
            <Link
              href="/employees/create"
              className="px-6 py-2 bg-gray-200 text-black rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Add Employee
            </Link>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Departments</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black">Department</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black">Designation</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-3 text-center text-black">
                      No employees found
                    </td>
                  </tr>
                ) : (
                  employees.map((emp: any) => (
                    <tr key={emp._id} className="hover:bg-gray-200">
                      <td className="px-6 py-3 font-medium">
                        {emp.firstName} {emp.lastName}
                      </td>
                      <td className="px-6 py-3 text-sm">{emp.email}</td>
                      <td className="px-6 py-3 text-sm">{emp.department}</td>
                      <td className="px-6 py-3 text-sm">{emp.designation}</td>
                      <td className="px-6 py-3">
                        <StatusBadge status={emp.status} />
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex gap-2">
                          <Link
                            href={`/employees/${emp._id}`}
                            className="text-blue-600 hover:underline text-sm font-semibold"
                          >
                            View
                          </Link>
                          {user?.role === 'Admin' && (
                            <>
                              <Link
                                href={`/employees/${emp._id}/edit`}
                                className="text-green-600 hover:underline text-sm font-semibold"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDelete(emp._id)}
                                className="text-red-600 hover:underline text-sm font-semibold"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatusBadge({ status }: any) {
  const colors: any = {
    Active: 'bg-green-100 text-green-800',
    Inactive: 'bg-gray-300 text-black',
    'On Leave': 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${colors[status]}`}>
      {status}
    </span>
  );
}
