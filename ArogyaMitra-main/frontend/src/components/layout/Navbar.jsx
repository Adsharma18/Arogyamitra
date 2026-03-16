import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Activity } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 w-full glass z-40 border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <Activity className="h-8 w-8 text-primary" />
                        <span className="font-bold text-xl tracking-tight text-white">
                            Arogya<span className="text-primary">Mitra</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:block">
                            <span className="text-gray-300 text-sm">Welcome, <span className="text-white font-medium">{user?.name || 'Guest'}</span></span>
                        </div>

                        <button className="p-2 rounded-full hover:bg-white/5 transition-colors text-gray-300 hover:text-white group">
                            <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-full hover:bg-red-500/10 transition-colors text-gray-300 hover:text-red-400 group"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
