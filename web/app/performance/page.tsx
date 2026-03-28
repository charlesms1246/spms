'use client';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/lib/useAuth';
import { performanceApi } from '@/lib/api';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PerformancePage() {
  const { isAuthenticated, loading, user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState<any>(null);
  const [teamReviews, setTeamReviews] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadPerformanceData();
    }
  }, [isAuthenticated]);

  const loadPerformanceData = async () => {
    try {
      if (user?.role === 'Manager' || user?.role === 'Admin') {
        const teamData = await performanceApi.getTeamReviews();
        setTeamReviews(teamData.reviews || []);
      }

      const myData = await performanceApi.getMyReviews();
      setReviews(myData.reviews || []);
      setAvgRating(myData.latestReview);
    } catch (error) {
      console.error('Error loading performance data:', error);
    }
  };

  if (loading || !isAuthenticated) return null;

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">Performance</h1>
          {(user?.role === 'Manager' || user?.role === 'Admin') && (
            <Link
              href="/performance/add"
              className="px-6 py-2 bg-gray-200 text-black rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Add Review
            </Link>
          )}
        </div>

        {/* Latest Review Metrics */}
        {avgRating && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <MetricCard label="Quality" rating={avgRating.quality} />
            <MetricCard label="Teamwork" rating={avgRating.teamwork} />
            <MetricCard label="Communication" rating={avgRating.communication} />
            <MetricCard label="Leadership" rating={avgRating.leadership} />
            <MetricCard label="Overall" rating={avgRating.overallRating} />
          </div>
        )}

        {/* My Reviews */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-black">My Performance Reviews</h2>
          </div>
          {reviews.length === 0 ? (
            <div className="p-6 text-center text-black">No reviews found</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reviews.map((review: any) => (
                <div key={review._id} className="p-6 hover:bg-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-black">
                        Review by {review.reviewedBy?.firstName}
                      </h3>
                      <p className="text-sm text-black">
                        {new Date(review.reviewDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      {review.overallRating.toFixed(1)}/5
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <MetricBadge label="Quality" value={review.quality} />
                    <MetricBadge label="Teamwork" value={review.teamwork} />
                    <MetricBadge label="Comm." value={review.communication} />
                    <MetricBadge label="Leadership" value={review.leadership} />
                  </div>
                  <p className="text-black">{review.comments}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Reviews (Manager) */}
        {(user?.role === 'Manager' || user?.role === 'Admin') && teamReviews.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-black">Team Reviews</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-black">Employee</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-black">Quality</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-black">Teamwork</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-black">Communication</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-black">Leadership</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-black">Overall</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-black">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {teamReviews.map((review: any) => (
                    <tr key={review._id} className="hover:bg-gray-200">
                      <td className="px-6 py-3 text-black">{review.userId?.firstName} {review.userId?.lastName}</td>
                      <td className="px-6 py-3">
                        <RatingCircle value={review.quality} />
                      </td>
                      <td className="px-6 py-3">
                        <RatingCircle value={review.teamwork} />
                      </td>
                      <td className="px-6 py-3">
                        <RatingCircle value={review.communication} />
                      </td>
                      <td className="px-6 py-3">
                        <RatingCircle value={review.leadership} />
                      </td>
                      <td className="px-6 py-3 font-semibold text-black">{review.overallRating.toFixed(1)}/5</td>
                      <td className="px-6 py-3 text-black">{new Date(review.reviewDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function MetricCard({ label, rating }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6 text-center">
      <p className="text-black text-sm font-medium mb-2">{label}</p>
      <div className="flex items-center justify-center">
        <div className="relative w-16 h-16">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="8"
              strokeDasharray={`${(rating / 5) * 282.7} 282.7`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-black">{rating?.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricBadge({ label, value }: any) {
  const color = value >= 4 ? 'green' : value >= 3 ? 'yellow' : 'red';
  const colorMap: any = {
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
  };

  return (
    <div className={`${colorMap[color]} rounded p-3 text-center`}>
      <p className="text-xs font-medium">{label}</p>
      <p className="text-lg font-bold">{value}/5</p>
    </div>
  );
}

function RatingCircle({ value }: any) {
  const color = value >= 4 ? 'text-green-600' : value >= 3 ? 'text-yellow-600' : 'text-red-600';
  return (
    <div className={`w-12 h-12 rounded-full ${color} bg-gray-300 flex items-center justify-center font-bold text-sm`}>
      {value}/5
    </div>
  );
}
