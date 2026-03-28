'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-black mb-4">SPMS</h1>
          <p className="text-xl text-black mb-8">Software Personnel Management System</p>
          <p className="text-black max-w-md mx-auto mb-12">
            Complete HR solution for managing employees, attendance, leave, payroll, and performance evaluations.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-gray-200 text-black rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="px-8 py-3 bg-white text-black border-2 border-gray-400 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Register
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-black mb-2">👥 Employee Management</h3>
            <p className="text-sm text-black">Manage employee profiles and details</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-black mb-2">📅 Attendance Tracking</h3>
            <p className="text-sm text-black">Track check-in/out and work hours</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-black mb-2">💰 Payroll System</h3>
            <p className="text-sm text-black">Generate payslips and manage salary</p>
          </div>
        </div>
      </div>
    </div>
  );
}
