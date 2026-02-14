import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2, ArrowRight, ShieldCheck, Zap, Sparkles, Eye } from 'lucide-react';
import { authService } from '../services/api';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return setError('Protocol mismatch: Passwords do not align.');
        }

        setLoading(true);
        setError('');
        try {
            await authService.register({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Initialization failed. Neural ID may be taken.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-base p-6 relative overflow-hidden font-sans">
            <div className="glow-mesh opacity-50" />

            <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

                {/* Visual Branding Side */}
                <div className="hidden lg:block space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-accent-purple to-accent-pink rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-accent-purple/20">
                            <Eye className="w-9 h-9 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter">
                            ATTEN<span className="text-primary-400 font-light">SEE</span>
                        </h1>
                    </div>

                    <h2 className="text-5xl font-black text-white leading-tight tracking-tighter">
                        Start Your <br />
                        <span className="text-gradient">Focus Evolution</span> <br />
                        Today.
                    </h2>

                    <p className="text-gray-400 text-lg max-w-sm font-medium leading-relaxed">
                        Join thousands of elite scholars using our AI telemetry to master their cognitive throughput.
                    </p>

                    <div className="flex items-center gap-6 pt-4 text-white/40">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-dark-base bg-white/10 flex items-center justify-center text-[10px] font-black uppercase">
                                    U{i}
                                </div>
                            ))}
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest">5k+ Active Nodes</p>
                    </div>
                </div>

                {/* Register Form Side */}
                <div className="animate-in fade-in slide-in-from-right-8 duration-1000">
                    <div className="glass-card p-10 border-white/5 bg-white/[0.02]">
                        <div className="text-center lg:text-left mb-8">
                            <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Identity Initialization</h3>
                            <p className="text-gray-500 font-medium">Define your neural parameters to begin.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 px-1">Legal Designation (Full Name)</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-primary-400 transition-colors" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="input-field pl-12 py-3.5"
                                        placeholder="Agent 007"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 px-1">Neural ID (Email)</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-primary-400 transition-colors" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="input-field pl-12 py-3.5"
                                        placeholder="id@nexus.system"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 px-1">Security Key</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-primary-400 transition-colors" />
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="input-field pl-11 py-3.5 text-sm"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 px-1">Verify Key</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-primary-400 transition-colors" />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="input-field pl-11 py-3.5 text-sm"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold flex items-center gap-3 animate-pulse">
                                    <ShieldCheck className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary w-full py-5 text-lg shadow-2xl shadow-primary-500/20"
                                >
                                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                        <>
                                            Initialize Identity <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        <p className="mt-8 text-center text-gray-500 text-sm font-medium">
                            Already part of Nexus?{' '}
                            <Link to="/login" className="text-white font-black hover:text-primary-400 transition-colors underline decoration-primary-500 underline-offset-4">
                                Synchronize ID
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
