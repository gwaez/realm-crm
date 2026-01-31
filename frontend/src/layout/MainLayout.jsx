import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, LogOut, Phone } from 'lucide-react';

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar - Mobile hidden by default would need responsive logic, simplified for MVP */}
            <aside className="w-64 bg-white shadow-md hidden md:flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold text-blue-600">Realm CRM</h1>
                    <p className="text-xs text-gray-500 mt-1">{user?.name} ({user?.role})</p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/dashboard" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700">
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/leads" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700">
                        <Users size={20} />
                        <span>Leads</span>
                    </Link>
                </nav>
                <div className="p-4 border-t">
                    <button onClick={handleLogout} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 text-red-600 w-full">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white shadow-sm p-4 md:hidden flex justify-between items-center">
                    <h1 className="font-bold text-blue-600">Realm</h1>
                    <button onClick={handleLogout}><LogOut size={20} /></button>
                </header>
                <div className="p-4 md:p-8">
                    <Outlet />
                </div>
            </main>

            {/* Bottom Nav for Mobile - Optional MVP */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 z-10">
                <Link to="/dashboard" className="flex flex-col items-center text-gray-600 text-xs">
                    <LayoutDashboard size={24} />
                    <span className="mt-1">Dash</span>
                </Link>
                <Link to="/leads" className="flex flex-col items-center text-gray-600 text-xs">
                    <Users size={24} />
                    <span className="mt-1">Leads</span>
                </Link>
            </nav>
        </div>
    );
};

export default MainLayout;
