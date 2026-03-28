'use client';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth, useRequireRole } from '@/lib/useAuth';
import { payrollApi, userApi } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function GeneratePayrollPage() {
  const { isAuthenticated, loading } = useRequireRole(['Admin']);
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    userIds: [],
  });
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadEmployees();
    }
  }, [isAuthenticated]);

  const loadEmployees = async () => {
    try {
      const data = await userApi.getAll({ role: 'Employee' });
      setEmployees(data.users || []);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'month' || name === 'year' ? parseInt(value) : value,
    });
  };

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId) ? prev.filter((id) => id !== employeeId) : [...prev, employeeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map((emp) => emp._id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (selectedEmployees.length === 0) {
      setError('Please select at least one employee');
      return;
    }

    setGenerating(true);

    try {
      const result = await payrollApi.generate({
        month: formData.month,
        year: formData.year,
        userIds: selectedEmployees,
      });

      setSuccess(`Payroll generated successfully for ${result.total} employees`);
      setTimeout(() => {
        setSelectedEmployees([]);
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to generate payroll');
    } finally {
      setGenerating(false);
    }
  };

  if (loading || !isAuthenticated) return null;

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-8 text-black">Generate Payroll</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-6 text-black">Payroll Details</h2>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <option key={month} value={month}>
                        {new Date(2024, month - 1, 1).toLocaleDateString('en-US', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(
                      (year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Selected:</strong> {selectedEmployees.length} / {employees.length} employees
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={generating || selectedEmployees.length === 0}
                  className="w-full bg-gray-200 text-black py-2 rounded-lg font-semibold hover:bg-gray-300 disabled:bg-gray-400 disabled:text-black transition"
                >
                  {generating ? 'Generating...' : 'Generate Payroll'}
                </button>
              </form>
            </div>
          </div>

          {/* Employee Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-black">Select Employees</h2>
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1 bg-gray-200 text-gray-900 rounded text-sm font-medium hover:bg-gray-300 transition"
                >
                  {selectedEmployees.length === employees.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {employees.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No employees found</div>
                ) : (
                  employees.map((emp) => (
                    <div key={emp._id} className="p-4 hover:bg-gray-50">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(emp._id)}
                          onChange={() => handleEmployeeToggle(emp._id)}
                          className="w-4 h-4 rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {emp.firstName} {emp.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {emp.designation} • {emp.department}
                          </p>
                          <p className="text-xs text-gray-500">ID: {emp.employeeId}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{(emp.salary?.basic || 0).toFixed(2)}</p>
                          <p className="text-xs text-gray-500">Basic</p>
                        </div>
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
