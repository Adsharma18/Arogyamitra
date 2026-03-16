import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Save, Loader2 } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';

const Settings = () => {
    const { user, updateProfile } = useAuthStore();
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        height: user?.profile?.height || '',
        weight: user?.profile?.weight || '',
        activity_level: user?.profile?.activity_level || 'moderate',
        goals: user?.profile?.goals?.join(', ') || '',
        dietary_preferences: user?.profile?.dietary_preferences?.join(', ') || '',
        allergies: user?.profile?.allergies?.join(', ') || '',
    });

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                height: profile.height ? Number(profile.height) : null,
                weight: profile.weight ? Number(profile.weight) : null,
                activity_level: profile.activity_level,
                goals: profile.goals ? profile.goals.split(',').map(s => s.trim()) : [],
                dietary_preferences: profile.dietary_preferences ? profile.dietary_preferences.split(',').map(s => s.trim()) : [],
                allergies: profile.allergies ? profile.allergies.split(',').map(s => s.trim()) : [],
            };
            await updateProfile(payload);
        } catch (err) {
            // toast already handled by store
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
            {/* Header */}
            <div className="glass p-8 rounded-3xl border border-gray-800">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-primary/20 rounded-xl">
                        <SettingsIcon className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Settings</h1>
                        <p className="text-gray-400">Manage your health profile and preferences</p>
                    </div>
                </div>
            </div>

            {/* Account Info (non-editable) */}
            <div className="glass p-6 rounded-2xl border border-gray-800">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-primary" /> Account
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-gray-400">Name</label>
                        <div className="text-white font-medium mt-1">{user?.name}</div>
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Email</label>
                        <div className="text-white font-medium mt-1">{user?.email}</div>
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Age</label>
                        <div className="text-white font-medium mt-1">{user?.age}</div>
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Gender</label>
                        <div className="text-white font-medium mt-1">{user?.gender}</div>
                    </div>
                </div>
            </div>

            {/* Editable Health Profile */}
            <form onSubmit={handleSave} className="glass p-6 rounded-2xl border border-gray-800 space-y-5">
                <h2 className="text-xl font-bold text-white mb-2">Health Profile</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Height (cm)</label>
                        <input name="height" type="number" value={profile.height} onChange={handleChange}
                            placeholder="e.g. 175"
                            className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Weight (kg)</label>
                        <input name="weight" type="number" value={profile.weight} onChange={handleChange}
                            placeholder="e.g. 70"
                            className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                    </div>
                </div>

                <div>
                    <label className="text-sm text-gray-400 block mb-1">Activity Level</label>
                    <select name="activity_level" value={profile.activity_level} onChange={handleChange}
                        className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all">
                        <option value="sedentary">Sedentary</option>
                        <option value="light">Lightly Active</option>
                        <option value="moderate">Moderately Active</option>
                        <option value="active">Active</option>
                        <option value="very_active">Very Active</option>
                    </select>
                </div>

                <div>
                    <label className="text-sm text-gray-400 block mb-1">Goals (comma-separated)</label>
                    <input name="goals" value={profile.goals} onChange={handleChange}
                        placeholder="e.g. Lose weight, Build muscle"
                        className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                </div>

                <div>
                    <label className="text-sm text-gray-400 block mb-1">Dietary Preferences (comma-separated)</label>
                    <input name="dietary_preferences" value={profile.dietary_preferences} onChange={handleChange}
                        placeholder="e.g. Vegetarian, High Protein"
                        className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                </div>

                <div>
                    <label className="text-sm text-gray-400 block mb-1">Allergies (comma-separated)</label>
                    <input name="allergies" value={profile.allergies} onChange={handleChange}
                        placeholder="e.g. Peanuts, Gluten"
                        className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                </div>

                <button type="submit" disabled={saving}
                    className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? 'Saving...' : 'Save Profile'}
                </button>
            </form>
        </div>
    );
};

export default Settings;
