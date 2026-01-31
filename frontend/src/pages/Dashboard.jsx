import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { TrendingUp, AlertCircle, Trophy } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalLeads: 0,
        newLeadsWeek: 0,
        wonDeals: 0,
        overdueFollowups: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/dashboard/stats');
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Leads */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm opacity-90 font-medium">Total Leads</h3>
                            <p className="text-4xl font-bold mt-2">{stats.totalLeads}</p>
                        </div>
                        <TrendingUp size={40} className="opacity-80" />
                    </div>
                    <p className="text-sm mt-3 opacity-90">All time</p>
                </div>

                {/* New This Week */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm opacity-90 font-medium">New This Week</h3>
                            <p className="text-4xl font-bold mt-2">{stats.newLeadsWeek}</p>
                        </div>
                        <TrendingUp size={40} className="opacity-80" />
                    </div>
                    <p className="text-sm mt-3 opacity-90">Last 7 days</p>
                </div>

                {/* Won Deals */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm opacity-90 font-medium">Won Deals</h3>
                            <p className="text-4xl font-bold mt-2">{stats.wonDeals}</p>
                        </div>
                        <Trophy size={40} className="opacity-80" />
                    </div>
                    <p className="text-sm mt-3 opacity-90">This month</p>
                </div>

                {/* Overdue Follow-ups */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm opacity-90 font-medium">Overdue Follow-ups</h3>
                            <p className="text-4xl font-bold mt-2">{stats.overdueFollowups}</p>
                        </div>
                        <AlertCircle size={40} className="opacity-80" />
                    </div>
                    <p className="text-sm mt-3 opacity-90">
                        {stats.overdueFollowups > 0 ? 'Action required!' : 'All caught up!'}
                    </p>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-medium transition">
                            + Add New Lead
                        </button>
                        <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 font-medium transition">
                            📞 View Overdue Follow-ups
                        </button>
                        <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 font-medium transition">
                            📊 View Reports
                        </button>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
                    <div className="text-center text-gray-500 py-8">
                        <p>No recent activity</p>
                        <p className="text-sm mt-2">Activity will appear here as you work with leads</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
