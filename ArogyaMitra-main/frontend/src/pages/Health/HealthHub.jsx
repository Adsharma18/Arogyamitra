import React, { useState, useEffect } from 'react';
import { HeartPulse, Loader2, UserRound, Droplets, Moon, Info } from 'lucide-react';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';

const HealthHub = () => {
    const [score, setScore] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchScore = async () => {
            try {
                const res = await apiClient.get('/health/score');
                setScore(res.data);
            } catch (e) {
                console.error("Health score load fail", e);
            } finally {
                setLoading(false);
            }
        };
        fetchScore();
    }, []);

    return (
        <div className="space-y-6 animate-fade-in relative z-10">
            <div className="flex justify-between items-center bg-black/40 p-6 rounded-2xl border border-gray-800 backdrop-blur-md">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <HeartPulse className="text-green-400 w-8 h-8" />
                        Health Metrics
                    </h1>
                    <p className="text-gray-400 mt-1">AI-Assessed wellness and lifestyle tracking</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-green-400 animate-spin" /></div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Health Score Card */}
                    <div className="lg:col-span-1 glass p-8 rounded-3xl border border-green-500/20 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors pointer-events-none" />
                        <div className="relative z-10">
                            <div className="text-gray-400 font-medium mb-4 uppercase tracking-widest text-sm">Overall Health Score</div>

                            <div className="w-48 h-48 rounded-full border-8 border-gray-800 border-t-green-400 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(74,222,128,0.2)]">
                                <div className="text-6xl font-black text-white">{score?.score || '--'}</div>
                            </div>

                            <div className="inline-block px-4 py-1 bg-green-500/20 text-green-400 rounded-full font-bold text-sm tracking-wide">
                                {score?.category || 'Analyzing'}
                            </div>
                        </div>
                    </div>

                    {/* AI Recommendations */}
                    <div className="lg:col-span-2 glass p-8 rounded-3xl border border-gray-800">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Info className="text-primary w-5 h-5" /> AROMI Recommendations
                        </h2>
                        <div className="space-y-4">
                            {score?.recommendations?.map((rec, idx) => (
                                <div key={idx} className="bg-black/40 p-4 rounded-xl border border-gray-800 flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                                        {idx + 1}
                                    </div>
                                    <p className="text-gray-300 leading-relaxed mt-1">{rec}</p>
                                </div>
                            )) || (
                                    <div className="text-gray-500 italic">No recommendations mapped currently. Log more data!</div>
                                )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
};

export default HealthHub;
