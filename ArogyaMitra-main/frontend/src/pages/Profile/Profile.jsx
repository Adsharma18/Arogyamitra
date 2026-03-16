import React, { useState } from 'react';
import { User, Save, Loader2, Mail, Calendar, UserCheck } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user } = useAuthStore();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || '',
        age: user?.age || '',
        gender: user?.gender || 'Male',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                name: form.name,
                age: Number(form.age),
                gender: form.gender,
            };
            const res = await apiClient.put('/users/me', payload);
            // Update local storage and store
            localStorage.setItem('user_data', JSON.stringify(res.data));
            useAuthStore.setState({ user: res.data });
            toast.success('Personal info updated!');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to update personal info');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
            {/* Header */}
            <div className="glass p-8 rounded-3xl border border-gray-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex items-center gap-5">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="text-3xl font-bold text-white">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">{user?.name}</h1>
                        <p className="text-gray-400 flex items-center gap-2 mt-1">
                            <Mail className="w-4 h-4" /> {user?.email}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                            Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Edit Personal Info Form */}
            <form onSubmit={handleSave} className="glass p-8 rounded-3xl border border-gray-800 space-y-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-primary" /> Edit Personal Information
                </h2>

                <div>
                    <label className="text-sm text-gray-400 block mb-2">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            name="name"
                            type="text"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="w-full bg-black/40 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm text-gray-400 block mb-2">Age</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                name="age"
                                type="number"
                                min="1"
                                max="120"
                                value={form.age}
                                onChange={handleChange}
                                required
                                className="w-full bg-black/40 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-gray-400 block mb-2">Gender</label>
                        <select
                            name="gender"
                            value={form.gender}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Non-binary">Non-binary</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </form>

            {/* Account Info (read-only) */}
            <div className="glass p-6 rounded-2xl border border-gray-800">
                <h2 className="text-lg font-bold text-white mb-3">Account Details</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500">Email</span>
                        <p className="text-white font-medium">{user?.email}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">User ID</span>
                        <p className="text-white font-mono text-xs mt-1">{user?.id || user?._id}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
