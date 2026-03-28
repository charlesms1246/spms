'use client';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/lib/useAuth';
import { payrollApi } from '@/lib/api';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PayrollPage() {
  const { isAuthenticated, loading, user } = useAuth();
  const [payroll, setPayroll] = useState<any[]>([]);
  const [salaryDetails, setSalaryDetails] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadPayrollData();
    }
  }, [isAuthenticated]);

  const loadPayrollData = async () => {
    try {
      if (user?.role === 'Admin') {
        const data = await payrollApi.getAll();
        setPayroll(data.payroll || []);
      } else {
        const data = await payrollApi.getMyPayroll();
        setPayroll(data.payroll || []);

        const salary = await payrollApi.getSalaryDetails();
        setSalaryDetails(salary.salary);
      }
    } catch (error) {
      console.error('Error loading payroll:', error);
    }
  };

  if (loading || !isAuthenticated) return null;

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">Payroll</h1>
          {user?.role === 'Admin' && (
            <Link
              href="/payroll/generate"
              className="px-6 py-2 bg-gray-200 text-black rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Generate Payroll
            </Link>
          )}
        </div>

        {/* Salary Details (Employee) */}
        {salaryDetails && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <SalaryCard label="Basic" amount={salaryDetails.basic} />
            <SalaryCard label="Allowances" amount={salaryDetails.allowances} />
            <SalaryCard label="Bonus" amount={salaryDetails.bonus} />
            <SalaryCard label="Deductions" amount={salaryDetails.deductions} color="red" />
            <SalaryCard label="Net Salary" amount={salaryDetails.netSalary} color="green" />
          </div>
        )}

        {/* Payroll Records */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-black">
              {user?.role === 'Admin' ? 'All Payroll Records' : 'My Payslips'}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  {user?.role === 'Admin' && (
                    <th className="px-6 py-3 text-left text-sm font-medium text-black">Employee</th>
                  )}
                  <th className="px-6 py-3 text-left text-sm font-medium text-black">Month</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black">Basic</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black">Allowances</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black">Bonus</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black">Deductions</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black">Net Salary</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-black">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payroll.length === 0 ? (
                  <tr>
                    <td colSpan={user?.role === 'Admin' ? 9 : 8} className="px-6 py-3 text-center text-black">
                      No payroll records found
                    </td>
                  </tr>
                ) : (
                  payroll.map((record: any) => (
                    <tr key={record._id} className="hover:bg-gray-200">
                      {user?.role === 'Admin' && (
                        <td className="px-6 py-3 text-black">{record.userId?.firstName} {record.userId?.lastName}</td>
                      )}
                      <td className="px-6 py-3 text-black">
                        {new Date(2024, record.month - 1, 1).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-3 text-black">₹{record.basic?.toFixed(2)}</td>
                      <td className="px-6 py-3 text-black">₹{record.allowances?.toFixed(2)}</td>
                      <td className="px-6 py-3 text-black">₹{record.bonus?.toFixed(2)}</td>
                      <td className="px-6 py-3 text-black">₹{record.deductions?.toFixed(2)}</td>
                      <td className="px-6 py-3 font-semibold text-black">₹{record.netSalary?.toFixed(2)}</td>
                      <td className="px-6 py-3">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="px-6 py-3">
                        <Link
                          href={`/payroll/${record._id}`}
                          className="text-blue-600 hover:underline font-semibold text-sm"
                        >
                          View
                        </Link>
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

function SalaryCard({ label, amount, color = 'blue' }: any) {
  const colorMap: any = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
  };

  return (
    <div className={`${colorMap[color]} rounded-lg p-6`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="text-2xl font-bold mt-2">₹{amount?.toFixed(2)}</p>
    </div>
  );
}

function StatusBadge({ status }: any) {
  const colors: any = {
    Draft: 'bg-gray-300 text-black',
    Generated: 'bg-yellow-100 text-yellow-800',
    Paid: 'bg-green-100 text-green-800',
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${colors[status]}`}>
      {status}
    </span>
  );
}
