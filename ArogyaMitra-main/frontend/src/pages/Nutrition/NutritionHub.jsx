import React, { useState, useEffect } from 'react';
import { Apple, Plus, Loader2, Utensils, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';
import useAromiStore from '../../store/useAromiStore';

const NutritionHub = () => {
    const { lastUpdateTimestamp } = useAromiStore();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [expandedDays, setExpandedDays] = useState({}); // { [planIdx_dayIdx]: boolean }

    const toggleDay = (planIdx, dayIdx) => {
        const key = `${planIdx}_${dayIdx}`;
        setExpandedDays(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const [formData, setFormData] = useState({
        target_calories: 2000,
        diet_type: 'Standard',
        allergies: '',
        cuisine: 'Global',
        duration_days: 7
    });

    const fetchPlans = async () => {
        try {
            const res = await apiClient.get('/nutrition/plans');
            // Assuming we fetch from plans history, map properly (mock logic for now if plans empty)
            if (res.data && res.data.length > 0) setPlans(res.data);
        } catch (err) {
            console.log('Nutrition fetch info: ', err);
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
                target_calories: parseInt(formData.target_calories),
                duration_days: parseInt(formData.duration_days),
                allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()) : []
            };
            const res = await apiClient.post('/nutrition/generate', payload);
            setPlans([res.data]); // Replaces current active
            setShowForm(false);
            toast.success('AI specifically cooked your new meal plan!');
        } catch (err) {
            toast.error('Meal Plan Generation Failed');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center bg-black/40 p-6 rounded-2xl border border-gray-800 backdrop-blur-md">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Apple className="text-accent w-8 h-8" />
                        Nutrition Hub
                    </h1>
                    <p className="text-gray-400 mt-1">Your AI-curated daily macros & recipes</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                >
                    {showForm ? 'Cancel' : <><Plus className="w-5 h-5" /> Generate Meal Plan</>}
                </button>
            </div>

            {/* Generation Form */}
            {showForm && (
                <div className="glass p-6 rounded-2xl border border-accent/30 shadow-[0_0_30px_rgba(255,23,100,0.1)]">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Utensils className="text-accent" /> AI Kitchen
                    </h2>
                    <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Target Daily Calories</label>
                            <input type="number" min="1200" max="5000" step="50"
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-accent"
                                value={formData.target_calories} onChange={e => setFormData({ ...formData, target_calories: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Dietary Preference</label>
                            <select
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-accent"
                                value={formData.diet_type} onChange={e => setFormData({ ...formData, diet_type: e.target.value })}
                            >
                                <option>Standard</option>
                                <option>High Protein</option>
                                <option>Keto</option>
                                <option>Vegan</option>
                                <option>Paleo</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm text-gray-400 mb-1">Allergies (comma separated)</label>
                            <input type="text" placeholder="e.g. Peanuts, Shellfish"
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-accent"
                                value={formData.allergies} onChange={e => setFormData({ ...formData, allergies: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Cuisine</label>
                            <input type="text" placeholder="e.g. Indian, Mediterranean"
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-accent"
                                value={formData.cuisine} onChange={e => setFormData({ ...formData, cuisine: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Duration (days)</label>
                            <input type="number" min="1" max="14"
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-accent"
                                value={formData.duration_days} onChange={e => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                            />
                        </div>
                        <button
                            type="submit" disabled={generating}
                            className="md:col-span-2 bg-gradient-to-r from-accent to-pink-500 text-white font-bold py-3 mt-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                        >
                            {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate Daily Menu'}
                        </button>
                    </form>
                </div>
            )}

            {/* Plan Visualization */}
            <div className="space-y-6">
                {loading ? (
                    <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-accent animate-spin" /></div>
                ) : plans.length === 0 ? (
                    <div className="text-center p-12 glass rounded-2xl text-gray-400 border border-gray-800">
                        No active meal plans found. Let our AI curate your menu!
                    </div>
                ) : (
                    plans.map((plan, i) => (
                        <div key={i} className="space-y-6">
                            {/* Macro Overview */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-black/40 border border-gray-800 p-4 rounded-2xl flex flex-col items-center justify-center">
                                    <span className="text-gray-400 text-sm">Target Daily Calories</span>
                                    <span className="text-2xl font-bold text-accent">{plan.total_calories_per_day}</span>
                                </div>
                                <div className="bg-black/40 border border-gray-800 p-4 rounded-2xl flex flex-col items-center justify-center">
                                    <span className="text-gray-400 text-sm">Plan Duration</span>
                                    <span className="text-2xl font-bold text-blue-400">{plan.days?.length || 0} Days</span>
                                </div>
                            </div>

                            {/* Meals List - Grouped by Day */}
                            <div className="space-y-4 mt-6">
                                {plan.days?.map((dayObj, dayIdx) => {
                                    const isExpanded = expandedDays[`${i}_${dayIdx}`];
                                    return (
                                        <div key={dayIdx} className="glass rounded-2xl border border-gray-800 overflow-hidden">
                                            {/* Accordion Header */}
                                            <button
                                                onClick={() => toggleDay(i, dayIdx)}
                                                className="w-full flex justify-between items-center p-6 text-left hover:bg-white/5 transition-colors focus:outline-none"
                                            >
                                                <h3 className="text-xl font-bold text-white">Day {dayObj.day} • {dayObj.total_calories} kcal</h3>
                                                <div className="text-gray-500 bg-gray-900/50 p-2 rounded-lg hover:bg-accent/10 hover:text-accent transition-colors">
                                                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                </div>
                                            </button>

                                            {/* Accordion Content */}
                                            {isExpanded && (
                                                <div className="p-6 pt-0 border-t border-gray-800/50 mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    {dayObj.meals?.map((meal, j) => (
                                                        <div key={j} className="bg-gray-900/50 rounded-xl p-5 border border-gray-800 hover:border-accent/50 transition-colors">
                                                            <div className="flex justify-between items-start mb-4">
                                                                <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-bold uppercase tracking-wider">
                                                                    {meal.meal_type}
                                                                </span>
                                                                <span className="flex items-center gap-1 text-sm text-gray-400">
                                                                    <Flame className="w-4 h-4 text-orange-500" /> {meal.recipe.calories} kcal
                                                                </span>
                                                            </div>
                                                            <h3 className="text-xl font-bold text-white mb-2">{meal.recipe.title}</h3>

                                                            {/* Macros row */}
                                                            <div className="flex gap-4 text-sm text-gray-400 mb-4 border-b border-gray-800 pb-4">
                                                                <span><span className="text-blue-400 font-medium">{meal.recipe.protein}g</span> P</span>
                                                                <span><span className="text-yellow-400 font-medium">{meal.recipe.carbs}g</span> C</span>
                                                                <span><span className="text-red-400 font-medium">{meal.recipe.fat}g</span> F</span>
                                                            </div>

                                                            <div className="space-y-4">
                                                                <div>
                                                                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Ingredients</h4>
                                                                    <ul className="text-sm text-gray-500 list-disc pl-4 space-y-1">
                                                                        {meal.recipe.ingredients.map((ing, k) => <li key={k}>{ing}</li>)}
                                                                    </ul>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Instructions</h4>
                                                                    <p className="text-sm text-gray-500 leading-relaxed">{meal.recipe.instructions}</p>
                                                                </div>
                                                            </div>
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

export default NutritionHub;
