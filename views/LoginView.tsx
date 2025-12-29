import React, { useState, useEffect, useRef } from 'react';
import { SparkIcon, GoogleIcon } from '../constants';
import { AuthUser, UserRole } from '../hooks/useAuth';
import { db } from '../utils/storage';

interface LoginViewProps {
    onLogin: (user: AuthUser) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
    const [mode, setMode] = useState<'signin' | 'signup' | 'otp'>('signin');
    const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
    const [isLoading, setIsLoading] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        countryCode: '+1',
        role: 'user' as UserRole,
        department: ''
    });

    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        let interval: any;
        if (mode === 'otp' && timer > 0) {
            interval = setInterval(() => setTimer((t) => t - 1), 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [mode, timer]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleOtpChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    // Create user object from form data
    const createUserFromForm = (): AuthUser => {
        const userName = mode === 'signup' ? formData.name : formData.email.split('@')[0];
        return {
            id: Date.now(),
            name: userName || 'User',
            email: formData.email || `${formData.phone}@phone.user`,
            role: formData.role,
            status: 'active',
            created_at: new Date().toISOString(),
            department: formData.department || 'Marketing',
            last_login: new Date().toISOString()
        };
    };

    const initiateLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Validation
        if (authMethod === 'email' && !formData.email) {
            setError('Please enter your email');
            setIsLoading(false);
            return;
        }
        if (authMethod === 'email' && !formData.password) {
            setError('Please enter your password');
            setIsLoading(false);
            return;
        }
        if (mode === 'signup' && !formData.name) {
            setError('Please enter your name');
            setIsLoading(false);
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 1500));

        if (authMethod === 'phone') {
            setMode('otp');
            setTimer(30);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            setIsLoading(false);
        } else {
            // Try backend API first for login validation
            const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
            try {
                const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: formData.email, password: formData.password })
                });

                const data = await response.json();

                if (response.ok && data.user) {
                    const authUser: AuthUser = {
                        ...data.user,
                        role: data.user.role as UserRole,
                        last_login: new Date().toISOString()
                    };
                    onLogin(authUser);
                    return;
                } else if (response.status === 403) {
                    // User is deactivated
                    setError('User deactivated');
                    setIsLoading(false);
                    return;
                } else if (response.status === 401) {
                    // Invalid credentials - fall through to localStorage check
                }
            } catch (apiError) {
                // API not available, fall back to localStorage
                console.log('Backend not available, using localStorage');
            }

            // Fallback: Check localStorage if user exists and is inactive
            const existingUsers = db.users.getAll();
            const existingUser = existingUsers.find(u => u.email.toLowerCase() === formData.email.toLowerCase());

            if (existingUser && existingUser.status === 'inactive') {
                setError('User deactivated');
                setIsLoading(false);
                return;
            }

            // If user exists, use their data; otherwise create new user
            if (existingUser) {
                const authUser: AuthUser = {
                    ...existingUser,
                    role: existingUser.role as UserRole,
                    last_login: new Date().toISOString()
                };
                // Update last login
                db.users.update(existingUser.id, { last_login: new Date().toISOString() });
                onLogin(authUser);
            } else {
                const user = createUserFromForm();
                onLogin(user);
            }
        }
    };

    const verifyOtp = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (otp.join('').length === 6) {
            const user = createUserFromForm();
            onLogin(user);
        } else {
            setError("Invalid OTP code. Try 123456.");
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Simulate Google login with a demo user
        const googleUser: AuthUser = {
            id: Date.now(),
            name: 'Google User',
            email: 'user@gmail.com',
            role: 'user',
            status: 'active',
            created_at: new Date().toISOString(),
            department: 'Marketing',
            last_login: new Date().toISOString()
        };
        onLogin(googleUser);
    };

    return (
        <div className="min-h-screen w-full bg-[#0F172A] flex items-center justify-center relative overflow-hidden font-sans">

            {/* --- Ambient Background --- */}
            <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-brand-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-violet-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay"></div>
            </div>

            {/* --- Card --- */}
            <div className="relative z-10 w-full max-w-sm px-6 animate-fade-in">
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 p-8">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-brand-500 to-violet-600 rounded-xl shadow-glow mb-4">
                            <span className="text-2xl font-bold text-white tracking-tighter">G</span>
                        </div>
                        <h1 className="text-xl font-bold text-white tracking-tight mb-1">
                            Welcome to <span className="text-brand-400">Guires</span>
                        </h1>
                        <p className="text-xs font-medium text-slate-400">
                            Marketing Operating System
                        </p>
                    </div>

                    {/* Tabs */}
                    {mode !== 'otp' && (
                        <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-lg mb-6">
                            <button
                                onClick={() => setMode('signin')}
                                className={`py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all duration-200 ${mode === 'signin' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => setMode('signup')}
                                className={`py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all duration-200 ${mode === 'signup' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Register
                            </button>
                        </div>
                    )}

                    {/* Form Content */}
                    <div>
                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <p className="text-red-400 text-xs font-medium">{error}</p>
                            </div>
                        )}

                        {mode === 'otp' ? (
                            <div className="space-y-6 text-center">
                                <div className="space-y-1">
                                    <h3 className="text-white font-bold text-base">Verification</h3>
                                    <p className="text-slate-400 text-xs">Enter the code sent to your device.</p>
                                </div>

                                <div className="flex justify-center gap-2">
                                    {otp.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            ref={(el) => { otpRefs.current[idx] = el; }}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(idx, e)}
                                            className="w-9 h-10 bg-slate-800 border border-slate-700 rounded-lg text-center text-base font-bold text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder-slate-700"
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={verifyOtp}
                                    disabled={isLoading || otp.join('').length !== 6}
                                    className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 rounded-lg shadow-lg shadow-brand-900/20 transition-all flex justify-center items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Verify'}
                                </button>

                                <button
                                    onClick={() => { setCanResend(false); setTimer(30); }}
                                    disabled={!canResend}
                                    className={`text-[10px] font-medium ${canResend ? 'text-brand-400 hover:text-brand-300' : 'text-slate-600 cursor-not-allowed'}`}
                                >
                                    {canResend ? 'Resend Code' : `Resend available in ${timer}s`}
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={initiateLogin} className="space-y-4">
                                {mode === 'signup' && (
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder-slate-600"
                                            placeholder="Jane Doe"
                                            required
                                        />
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                                        {authMethod === 'email' ? 'Work Email' : 'Mobile Number'}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                                        </div>
                                        <input
                                            type={authMethod === 'email' ? 'email' : 'tel'}
                                            name={authMethod}
                                            value={authMethod === 'email' ? formData.email : formData.phone}
                                            onChange={handleInputChange}
                                            autoComplete={authMethod === 'email' ? 'username' : 'tel'}
                                            className="w-full pl-9 pr-16 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder-slate-600"
                                            placeholder={authMethod === 'email' ? 'name@guires.com' : '555-0123'}
                                            required
                                        />
                                        {mode !== 'signup' && (
                                            <button
                                                type="button"
                                                onClick={() => setAuthMethod(authMethod === 'email' ? 'phone' : 'email')}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] font-bold text-slate-500 hover:text-brand-400 uppercase tracking-wider transition-colors"
                                            >
                                                {authMethod === 'email' ? 'Phone' : 'Email'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {authMethod === 'email' && (
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Password</label>
                                            {mode === 'signin' && <a href="#" className="text-[10px] text-brand-400 hover:text-brand-300">Forgot?</a>}
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                            </div>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                autoComplete="current-password"
                                                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder-slate-600"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 rounded-lg shadow-lg shadow-brand-900/20 transition-all flex justify-center items-center gap-2 mt-6 disabled:opacity-70 text-sm"
                                >
                                    {isLoading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <span>{mode === 'signup' ? 'Create Account' : 'Sign In'}</span>
                                    )}
                                </button>
                            </form>
                        )}

                        {mode !== 'otp' && (
                            <div className="mt-6">
                                <div className="relative flex justify-center text-[10px] leading-5 mb-4">
                                    <span className="bg-slate-900 px-2 text-slate-500 uppercase tracking-wide">Or continue with</span>
                                </div>

                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={isLoading}
                                    className="w-full bg-white text-slate-900 font-bold py-2.5 rounded-lg hover:bg-slate-100 transition-all flex justify-center items-center gap-3 text-sm shadow-sm"
                                >
                                    <GoogleIcon />
                                    <span>Google Workspace</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center mt-6">
                    <p className="text-[10px] text-slate-600 font-medium">
                        &copy; 2025 Guires Inc. • Enterprise Grade Security
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginView;