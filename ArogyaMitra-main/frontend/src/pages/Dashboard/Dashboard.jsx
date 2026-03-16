import React, { useState, useEffect } from 'react';
import { Activity, Flame, Dumbbell, HeartPulse, Trophy, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import useAuthStore from '../../store/useAuthStore';
import useAromiStore from '../../store/useAromiStore';

const Dashboard = () => {
    const { user } = useAuthStore();
    const { lastUpdateTimestamp, sendMessage, isTyping } = useAromiStore();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Quick Log State
    const [logInput, setLogInput] = useState('');
    const [isLogging, setIsLogging] = useState(false);

    const fetchStats = async () => {
        try {
            const res = await apiClient.get('/progress/dashboard');
            setStats(res.data);
        } catch (err) {
            console.error('Failed to load dashboard stats');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [lastUpdateTimestamp]); // Re-fetch when AROMI updates system

    if (loading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>;
    }

    const handleQuickLog = async (e) => {
        e.preventDefault();
        if (!logInput.trim() || isLogging || isTyping) return;

        setIsLogging(true);
        try {
            await sendMessage(logInput);
            setLogInput('');
        } catch (err) {
            console.error(err);
        } finally {
            setIsLogging(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in relative z-10">
            {/* Welcome Banner */}
            <div className="glass p-8 rounded-3xl border border-primary/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700 pointer-events-none" />

                <div className="relative z-10">
                    <h1 className="text-4xl font-bold text-white mb-2">Welcome Back, {user?.name?.split(' ')[0] || 'Athlete'}!</h1>
                    <p className="text-gray-400 text-lg">Let's crush your fitness goals today. AROMI is ready when you are.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Workout Streak', value: `${stats?.workout_streak || 0} Days`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
                    { label: 'Total Workouts', value: stats?.total_workouts || 0, icon: Dumbbell, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
                    { label: 'Avg Calories Burned', value: `${stats?.avg_calories_burned || 0} kcal`, icon: Activity, color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20' },
                    { label: 'Health Score', value: `${stats?.health_score || 0}/100`, icon: HeartPulse, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' }
                ].map((stat, idx) => (
                    <div key={idx} className={`glass p-6 rounded-2xl border ${stat.border} hover:-translate-y-1 transition-transform duration-300`}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <h3 className="text-gray-400 font-medium">{stat.label}</h3>
                        </div>
                        <div className="text-3xl font-bold text-white tracking-tight">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Action 1 */}
                <Link to="/workouts" className="group glass p-8 rounded-3xl border border-gray-800 hover:border-primary/50 transition-all relative overflow-hidden flex flex-col justify-between min-h-[200px]">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                        <div className="p-3 bg-primary/20 w-fit rounded-xl mb-4 text-primary">
                            <Dumbbell className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Generate New Workout</h2>
                        <p className="text-gray-400">Let AI tailor your next workout routine.</p>
                    </div>
                    <div className="relative z-10 flex text-primary font-bold items-center gap-2 mt-4 group-hover:translate-x-2 transition-transform">
                        Start Now <ArrowRight className="w-5 h-5" />
                    </div>
                </Link>

                {/* Action 2 */}
                <Link to="/nutrition" className="group glass p-8 rounded-3xl border border-gray-800 hover:border-accent/50 transition-all relative overflow-hidden flex flex-col justify-between min-h-[200px]">
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                        <div className="p-3 bg-accent/20 w-fit rounded-xl mb-4 text-accent">
                            <Flame className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Plan Daily Macros</h2>
                        <p className="text-gray-400">Get an AI mapped meal plan hitting your exact targets.</p>
                    </div>
                    <div className="relative z-10 flex text-accent font-bold items-center gap-2 mt-4 group-hover:translate-x-2 transition-transform">
                        Plan Meals <ArrowRight className="w-5 h-5" />
                    </div>
                </Link>
            </div>

            {/* Quick Log AI Input */}
            <div className="glass p-6 rounded-3xl border border-gray-800">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-shrink-0 bg-primary/20 p-4 rounded-2xl text-primary">
                        <Activity className="w-8 h-8" />
                    </div>
                    <div className="flex-1 w-full">
                        <h2 className="text-xl font-bold text-white mb-2">AROMI Quick Log</h2>
                        <p className="text-gray-400 text-sm mb-4">
                            Tell AROMI what you did today. E.g. "I ran 3 miles", "I ate a 400 calorie sandwich."
                        </p>
                        <form onSubmit={handleQuickLog} className="flex gap-3">
                            <input
                                type="text"
                                placeholder="Log your progress naturally..."
                                value={logInput}
                                onChange={(e) => setLogInput(e.target.value)}
                                disabled={isLogging || isTyping}
                                className="flex-1 bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={!logInput.trim() || isLogging || isTyping}
                                className="bg-primary text-background font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {(isLogging || isTyping) ? <Loader2 className="w-5 h-5 animate-spin" /> : "Log It"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
