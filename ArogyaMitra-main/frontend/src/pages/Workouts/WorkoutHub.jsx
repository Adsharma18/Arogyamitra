import React, { useState, useEffect } from 'react';
import { Dumbbell, Plus, Loader2, PlayCircle, Target, Calendar, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';
import useAromiStore from '../../store/useAromiStore';

const WorkoutHub = () => {
    const { lastUpdateTimestamp } = useAromiStore();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [expandedDays, setExpandedDays] = useState({}); // { [planId_dayIndex]: boolean }

    const toggleDay = (planId, dayIndex) => {
        const key = `${planId}_${dayIndex}`;
        setExpandedDays(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const [formData, setFormData] = useState({
        goal: 'Muscle Gain',
        days_per_week: 4,
        difficulty: 'Intermediate',
        duration_minutes: 30,
        environment: 'Gym',
        target_muscle_groups: ''
    });

    const fetchPlans = async () => {
        try {
            const res = await apiClient.get('/workouts/plans');
            setPlans(res.data);
        } catch (err) {
            toast.error('Failed to load workouts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, [lastUpdateTimestamp]); // Re-fetch when AROMI updates system

    const handleGenerate = async (e) => {
        e.preventDefault();
        setGenerating(true);
        try {
            const payload = {
                ...formData,
                target_muscle_groups: formData.target_muscle_groups.split(',').map(s => s.trim()).filter(s => s)
            };
            const res = await apiClient.post('/workouts/generate', payload);
            setPlans([...plans, res.data]);
            setShowForm(false);
            toast.success('AI successfully mapped your new routine!');
        } catch (err) {
            toast.error('AI Generation Failed');
        } finally {
            setGenerating(false);
        }
    };

    const handlePlayVideo = async (exerciseName) => {
        try {
            toast.loading(`Finding tutorial for ${exerciseName}...`, { id: 'video_search' });
            const res = await apiClient.get(`/workouts/videos/${encodeURIComponent(exerciseName)}`);
            if (res.data && res.data.length > 0) {
                toast.success('Video found!', { id: 'video_search' });
                window.open(res.data[0].url, '_blank');
            } else {
                toast.error('No video found.', { id: 'video_search' });
            }
        } catch (err) {
            toast.error('Failed to search video.', { id: 'video_search' });
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center bg-black/40 p-6 rounded-2xl border border-gray-800 backdrop-blur-md">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Dumbbell className="text-primary w-8 h-8" />
                        Workout Hub
                    </h1>
                    <p className="text-gray-400 mt-1">Your AI-generated fitness routines</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                >
                    {showForm ? 'Cancel' : <><Plus className="w-5 h-5" /> Generate Plan</>}
                </button>
            </div>

            {/* Generation Form */}
            {showForm && (
                <div className="glass p-6 rounded-2xl border border-primary/30 shadow-[0_0_30px_rgba(23,249,255,0.1)]">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Flame className="text-accent" /> Configure AI
                    </h2>
                    <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Primary Goal</label>
                            <select
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-primary"
                                value={formData.goal} onChange={e => setFormData({ ...formData, goal: e.target.value })}
                            >
                                <option>Muscle Gain</option>
                                <option>Fat Loss</option>
                                <option>Endurance</option>
                                <option>Flexibility</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Days Per Week</label>
                            <input type="number" min="1" max="7"
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-primary"
                                value={formData.days_per_week} onChange={e => setFormData({ ...formData, days_per_week: parseInt(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Difficulty</label>
                            <select
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-primary"
                                value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                            >
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Target Muscles (comma separated)</label>
                            <input type="text" placeholder="e.g. Chest, Triceps"
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-primary"
                                value={formData.target_muscle_groups} onChange={e => setFormData({ ...formData, target_muscle_groups: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Duration (minutes/day)</label>
                            <input type="number" min="10" max="180"
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-primary"
                                value={formData.duration_minutes} onChange={e => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Environment</label>
                            <select
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-primary"
                                value={formData.environment} onChange={e => setFormData({ ...formData, environment: e.target.value })}
                            >
                                <option>Gym</option>
                                <option>Home (No Equipment)</option>
                                <option>Home (Dumbbells/Bands)</option>
                                <option>Outdoor</option>
                            </select>
                        </div>
                        <button
                            type="submit" disabled={generating}
                            className="md:col-span-2 bg-gradient-to-r from-primary to-accent text-black font-bold py-3 mt-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                        >
                            {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate AI Workout'}
                        </button>
                    </form>
                </div>
            )}

            {/* Plans List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
                ) : plans.length === 0 ? (
                    <div className="text-center p-12 glass rounded-2xl text-gray-400 border border-gray-800">
                        You don't have any workout plans yet. Generate one to get started!
                    </div>
                ) : (
                    plans.map((plan, i) => (
                        <div key={plan._id || i} className="glass rounded-2xl border border-gray-800 overflow-hidden">
                            <div className="bg-gradient-to-r from-primary/10 to-transparent p-6 border-b border-gray-800">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Target className="w-6 h-6 text-primary" /> {plan.goal} Phase
                                </h2>
                                <div className="flex gap-4 mt-2 text-sm text-gray-400">
                                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {plan.days_per_week} days/week</span>
                                    <span className="flex items-center gap-1"><Flame className="w-4 h-4" /> {plan.difficulty}</span>
                                    <span className="flex items-center gap-1"><Target className="w-4 h-4" /> {plan.duration_minutes} mins • {plan.environment}</span>
                                </div>
                            </div>

                            <div className="p-6 grid grid-cols-1 gap-4">
                                {plan.schedule.map((day, j) => {
                                    const isExpanded = expandedDays[`${plan._id || i}_${j}`];
                                    return (
                                        <div key={j} className="bg-black/40 border border-gray-800 rounded-xl overflow-hidden hover:border-primary/50 transition-colors">
                                            {/* Accordion Header */}
                                            <button
                                                onClick={() => toggleDay(plan._id || i, j)}
                                                className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                                            >
                                                <div>
                                                    <div className="font-bold text-primary text-lg">{day.day_name}</div>
                                                    <div className="text-sm text-gray-400">{day.focus}</div>
                                                </div>
                                                <div className="text-gray-500 bg-gray-900/50 p-2 rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                </div>
                                            </button>

                                            {/* Accordion Content */}
                                            {isExpanded && (
                                                <div className="p-4 pt-0 border-t border-gray-800/50 space-y-3 mt-2">
                                                    {day.exercises.map((ex, k) => (
                                                        <div key={k} className="bg-gray-900/50 p-3 rounded-lg flex items-start justify-between group">
                                                            <div>
                                                                <div className="font-medium text-gray-200">{ex.name}</div>
                                                                <div className="text-xs text-gray-500 mt-1">{ex.sets} sets × {ex.reps}</div>
                                                            </div>
                                                            <button onClick={() => handlePlayVideo(ex.name)} className="text-gray-600 group-hover:text-primary transition-colors" title="Search Video">
                                                                <PlayCircle className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default WorkoutHub;
