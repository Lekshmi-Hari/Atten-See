import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, Eye, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { authService } from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await authService.login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Neural link failed. Verify credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-base p-6 relative overflow-hidden font-sans">
            <div className="glow-mesh opacity-50" />

            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent-purple/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
            </div>

            <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

                {/* Visual Branding Side */}
                <div className="hidden lg:block space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-accent-purple rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-primary-500/20">
                            <Eye className="w-9 h-9 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter">
                            ATTEN<span className="text-primary-400 font-light">SEE</span>
                        </h1>
                    </div>

                    <h2 className="text-5xl font-black text-white leading-tight tracking-tighter">
                        The Future of <br />
                        <span className="text-gradient">Behavioral Focus</span> <br />
                        is Here.
                    </h2>

                    <div className="space-y-6 pt-4">
                        {[
                            { icon: ShieldCheck, title: 'Neural Integrity', desc: 'Secure local-first behavioral tracking' },
                            { icon: Zap, title: 'Real-time Telemetry', desc: 'Microsecond precision detection' },
                            { icon: Sparkles, title: 'AI Synthesis', desc: 'Automated study material generation' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary-500/10 transition-colors">
                                    <item.icon className="w-5 h-5 text-gray-400 group-hover:text-primary-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm uppercase tracking-widest">{item.title}</h4>
                                    <p className="text-gray-500 text-xs mt-1 font-medium">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Login Form Side */}
                <div className="animate-in fade-in slide-in-from-right-8 duration-1000">
                    <div className="glass-card p-10 border-white/5 bg-white/[0.02]">
                        <div className="text-center lg:text-left mb-10">
                            <h3 className="text-3xl font-black text-white mb-2 tracking-tight">System Core Access</h3>
                            <p className="text-gray-500 font-medium">Please authenticate to initialize your focus environment.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Neural ID (Email)</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-primary-400 transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-field pl-12"
                                        placeholder="id@nexus.system"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2 px-1">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Security Override (Password)</label>
                                    <a href="#" className="text-[10px] font-bold text-primary-500 hover:text-white transition-colors">Emergency Reset?</a>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-primary-400 transition-colors" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input-field pl-12"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold flex items-center gap-3 animate-pulse">
                                    <ShieldCheck className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-5 text-lg shadow-2xl shadow-primary-500/20"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                    <>
                                        Establish Neural Link <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>

                            <div className="relative my-8 flex items-center">
                                <div className="flex-grow border-t border-white/[0.05]"></div>
                                <span className="mx-6 text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">Protocol Bypass</span>
                                <div className="flex-grow border-t border-white/[0.05]"></div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    localStorage.setItem('token', 'demo-token');
                                    localStorage.setItem('user', JSON.stringify({ name: 'Demo Agent', email: 'demo@nexus.system' }));
                                    window.location.href = '/dashboard';
                                }}
                                className="w-full btn-secondary py-5 text-sm uppercase tracking-widest group border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                            >
                                <Zap className="w-4 h-4 text-primary-400 fill-primary-400 group-hover:scale-125 transition-transform" />
                                Launch Simulation Mode
                            </button>
                        </form>

                        <p className="mt-10 text-center text-gray-500 text-sm font-medium">
                            First time at Nexus?{' '}
                            <Link to="/register" className="text-white font-black hover:text-primary-400 transition-colors underline decoration-primary-500 underline-offset-4">
                                Initialize New Identity
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
