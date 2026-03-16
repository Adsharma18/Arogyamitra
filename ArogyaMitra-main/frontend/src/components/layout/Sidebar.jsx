import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, Apple, HeartPulse, Settings, UserCircle } from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Workouts', path: '/workouts', icon: Dumbbell },
        { name: 'Nutrition', path: '/nutrition', icon: Apple },
        { name: 'Health', path: '/health', icon: HeartPulse },
        { name: 'Profile', path: '/profile', icon: UserCircle },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    return (
        <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 glass border-r border-gray-800 z-30 hidden md:block">
            <div className="py-6 px-4 flex flex-col gap-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname.startsWith(item.path);

                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                                ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(23,249,255,0.15)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'group-hover:text-primary transition-colors'}`} />
                            <span className="font-medium">{item.name}</span>
                        </NavLink>
                    );
                })}
            </div>

            {/* Decorative gradient orb at bottom of sidebar */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
        </aside>
    );
};

export default Sidebar;
