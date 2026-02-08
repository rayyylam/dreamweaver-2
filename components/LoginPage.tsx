import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Moon, Sparkles, Loader2, Mail, Lock } from 'lucide-react';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    setError('邮箱或密码错误');
                } else if (error.message.includes('Email not confirmed')) {
                    setError('请先确认您的邮箱');
                } else {
                    setError('登录失败，请重试');
                }
                return;
            }

            onLoginSuccess();
        } catch (err) {
            setError('登录失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-forest-950 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-radial from-teal-900/30 via-forest-950 to-forest-950" />

            {/* Decorative elements */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-500/10 blur-[100px] rounded-full animate-pulse-glow" />
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-lotus-500/10 blur-[80px] rounded-full animate-pulse-glow" style={{ animationDelay: '1s' }} />

            <div className="relative z-10 w-full max-w-md mx-4">
                {/* Logo and title */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="relative inline-block animate-sway-slow">
                        <Moon className="w-16 h-16 text-starlight-100 fill-starlight-100 mx-auto" />
                        <Sparkles className="absolute -top-2 -right-2 text-lotus-300 animate-pulse w-5 h-5" fill="currentColor" />
                    </div>
                    <h1 className="text-3xl font-serif font-bold mt-4 text-transparent bg-clip-text bg-gradient-to-r from-starlight-100 to-teal-200">
                        织梦者
                    </h1>
                    <p className="text-teal-200/60 mt-2 font-serif">
                        欢迎回到梦境博物馆
                    </p>
                </div>

                {/* Login form */}
                <div className="glass-panel-dark p-8 rounded-3xl border border-teal-500/20 shadow-[0_0_40px_rgba(45,212,191,0.1)] animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Email input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-teal-300 font-serif">
                                邮箱
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-500/50 w-5 h-5" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-forest-900/50 border border-teal-500/30 rounded-xl text-starlight-50 placeholder:text-teal-500/40 focus:outline-none focus:border-lotus-400/50 transition-colors"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-teal-300 font-serif">
                                密码
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-500/50 w-5 h-5" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-forest-900/50 border border-teal-500/30 rounded-xl text-starlight-50 placeholder:text-teal-500/40 focus:outline-none focus:border-lotus-400/50 transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm text-center animate-fade-in">
                                {error}
                            </div>
                        )}

                        {/* Login button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-teal-600 hover:bg-lotus-500 text-white py-3 rounded-xl font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>进入中...</span>
                                </>
                            ) : (
                                <span>进入梦境</span>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-teal-400/40 text-xs mt-6 font-serif">
                        仅限受邀用户
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
