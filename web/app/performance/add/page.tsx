'use client';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth, useRequireRole } from '@/lib/useAuth';
import { performanceApi, userApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function AddReviewPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useRequireRole(['Manager', 'Admin']);
  const [employees, setEmployees] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    userId: '',
    quality: 3,
    teamwork: 3,
    communication: 3,
    leadership: 3,
    comments: '',
    reviewDate: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadEmployees();
    }
  }, [isAuthenticated]);

  const loadEmployees = async () => {
    try {
      const data = await userApi.getTeam();
      setEmployees(data.team || []);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: isNaN(Number(value)) ? value : Number(value),
    });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseInt(value),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.userId) {
      setError('Please select an employee');
      return;
    }

    setSubmitting(true);

    try {
      await performanceApi.addReview(formData);
      alert('Review added successfully!');
      router.push('/performance');
    } catch (error: any) {
      setError(error.message || 'Failed to add review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !isAuthenticated) return null;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-black">Add Performance Review</h1>

        <div className="bg-white rounded-lg shadow p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
              <select
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select an employee</option>
                {employees.map((emp: any) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName} ({emp.designation})
                  </option>
                ))}
              </select>
            </div>

            {/* Quality Slider */}
            <SliderInput
              label="Quality"
              name="quality"
              value={formData.quality}
              onChange={handleSliderChange}
            />

            {/* Teamwork Slider */}
            <SliderInput
              label="Teamwork"
              name="teamwork"
              value={formData.teamwork}
              onChange={handleSliderChange}
            />

            {/* Communication Slider */}
            <SliderInput
              label="Communication"
              name="communication"
              value={formData.communication}
              onChange={handleSliderChange}
            />

            {/* Leadership Slider */}
            <SliderInput
              label="Leadership"
              name="leadership"
              value={formData.leadership}
              onChange={handleSliderChange}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                placeholder="Provide detailed feedback and comments..."
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Review Date</label>
              <input
                type="date"
                name="reviewDate"
                value={formData.reviewDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gray-200 text-black py-2 rounded-lg font-semibold hover:bg-gray-300 disabled:bg-gray-400 disabled:text-black transition"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

function SliderInput({ label, name, value, onChange }: any) {
  const getColor = (val: number) => {
    if (val <= 2) return 'text-red-600';
    if (val <= 3) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div>
      <div className="flex justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <span className={`text-lg font-bold ${getColor(value)}`}>{value}/5</span>
      </div>
      <input
        type="range"
        name={name}
        min="0"
        max="5"
        value={value}
        onChange={onChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Poor</span>
        <span>Good</span>
        <span>Excellent</span>
      </div>
    </div>
  );
}
