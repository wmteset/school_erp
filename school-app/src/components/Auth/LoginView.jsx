import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { api, forgotPasswordApi, verifyOtpApi, resetPasswordApi } from '../../api/client';
import {
  GraduationCap,
  Lock,
  Mail,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Building,
  ShieldCheck,
  BookOpen,
  KeyRound,
  X,
  ArrowLeft,
  RotateCcw,
  Check
} from 'lucide-react';

export const LoginView = () => {
  const { login, schoolInfo, showToast, forgotPassword, verifyOtp, resetPassword } = useSchool();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot Password Multi-Step State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotInfoMessage, setForgotInfoMessage] = useState('');

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    try {
      await login({ email: email.trim(), password: password.trim() });
    } catch (err) {
      console.warn('Login failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const openForgotPassword = () => {
    setForgotEmail(email.trim());
    setForgotOtp('');
    setVerificationCode('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotInfoMessage('');
    setForgotStep(1);
    setShowForgotModal(true);
  };

  const closeForgotPassword = () => {
    setShowForgotModal(false);
    setForgotStep(1);
    setForgotOtp('');
    setVerificationCode('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotInfoMessage('');
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    if (!forgotEmail.trim()) {
      showToast('Please enter your registered institutional email address.', 'error');
      return;
    }

    setForgotLoading(true);
    try {
      let res;
      if (typeof forgotPassword === 'function') {
        res = await forgotPassword(forgotEmail.trim());
      } else if (typeof forgotPasswordApi === 'function') {
        res = await forgotPasswordApi(forgotEmail.trim());
      } else if (api?.auth?.forgotPassword) {
        res = await api.auth.forgotPassword(forgotEmail.trim());
      } else {
        const fetchRes = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: forgotEmail.trim() }),
        });
        res = await fetchRes.json();
        if (!fetchRes.ok) throw new Error(res.error?.message || res.message || 'Failed to send OTP code');
      }
      setForgotInfoMessage(res?.message || 'A 6-digit verification code has been dispatched to your email.');
      setForgotStep(2);
    } catch (err) {
      console.warn('Forgot password request failed:', err.message);
      showToast(err.message || 'Failed to request OTP code.', 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!forgotOtp.trim()) {
      showToast('Please enter the 6-digit OTP code received.', 'error');
      return;
    }

    setForgotLoading(true);
    try {
      let res;
      if (typeof verifyOtp === 'function') {
        res = await verifyOtp(forgotEmail.trim(), forgotOtp.trim());
      } else if (typeof verifyOtpApi === 'function') {
        res = await verifyOtpApi({ email: forgotEmail.trim(), otp: forgotOtp.trim() });
      } else if (api?.auth?.verifyOtp) {
        res = await api.auth.verifyOtp({ email: forgotEmail.trim(), otp: forgotOtp.trim() });
      } else {
        const fetchRes = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: forgotEmail.trim(), otp: forgotOtp.trim() }),
        });
        res = await fetchRes.json();
        if (!fetchRes.ok) throw new Error(res.error?.message || res.message || 'Invalid or expired OTP code');
      }
      setVerificationCode(res.verificationCode);
      setForgotInfoMessage('OTP verified successfully. Please enter your new password.');
      setForgotStep(3);
    } catch (err) {
      console.warn('Verify OTP failed:', err.message);
      showToast(err.message || 'Invalid or expired OTP code.', 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 3: Set New Password
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    if (!newPassword.trim()) {
      showToast('Please enter your new password.', 'error');
      return;
    }
    if (newPassword.length < 4) {
      showToast('Password must be at least 4 characters long.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match. Please verify.', 'error');
      return;
    }

    setForgotLoading(true);
    try {
      let res;
      if (typeof resetPassword === 'function') {
        res = await resetPassword(forgotEmail.trim(), newPassword.trim(), verificationCode);
      } else if (typeof resetPasswordApi === 'function') {
        res = await resetPasswordApi({ email: forgotEmail.trim(), newPassword: newPassword.trim(), verificationCode });
        showToast(res.message || 'Password reset successfully!', 'success');
      } else if (api?.auth?.resetPassword) {
        res = await api.auth.resetPassword({ email: forgotEmail.trim(), newPassword: newPassword.trim(), verificationCode });
        showToast(res.message || 'Password reset successfully!', 'success');
      } else {
        const fetchRes = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: forgotEmail.trim(), newPassword: newPassword.trim(), verificationCode }),
        });
        res = await fetchRes.json();
        if (!fetchRes.ok) throw new Error(res.error?.message || res.message || 'Failed to update password');
        showToast(res.message || 'Password reset successfully!', 'success');
      }

      setEmail(forgotEmail.trim());
      setPassword('');
      closeForgotPassword();
    } catch (err) {
      console.warn('Reset password failed:', err.message);
      showToast(err.message || 'Failed to update password.', 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-12 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden relative z-10">
        
        {/* Left Side: School Crest & Institutional Identity */}
        <div className="md:col-span-5 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />

          <div>
            {/* Logo & School Name */}
            <div className="flex items-center space-x-3 mb-6">
              {schoolInfo?.logo ? (
                <img
                  src={schoolInfo.logo}
                  alt={schoolInfo.name}
                  className="w-12 h-12 rounded-2xl object-cover shadow-lg border-2 border-indigo-400/40 bg-white"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg border border-white/20">
                  <GraduationCap className="w-7 h-7" />
                </div>
              )}
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white leading-tight">
                  {schoolInfo?.name || 'Oakridge International Academy'}
                </h1>
                <p className="text-xs text-indigo-300 font-medium tracking-wide">
                  {schoolInfo?.headerSubtitle || 'CBSE & IB World School #04291'}
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>Enterprise School ERP</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Centralized academic administration, staff payroll ledgers, student profiles, and real-time attendance registers.
              </p>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero-Trust Role Permissions</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-300" />
                <span>Live Code-First Database</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-300" />
                <span>Campus Academic Year {schoolInfo?.academicYear || '2026-2027'}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Session: {schoolInfo?.academicYear || '2026-2027'}</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Backend Connected
            </span>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
          <div className="max-w-sm w-full mx-auto">
            
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to your account</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your authorized institutional email address and security password.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Institutional Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@oakridge.edu"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={openForgotPassword}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-800 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-md shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Oakridge ERP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Protected Portal</span>
              </div>
              <span>TypeORM Code-First</span>
            </div>

          </div>
        </div>

      </div>

      {/* Multi-Step Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scale-in">
            
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/30 text-indigo-300 rounded-xl border border-indigo-400/30">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Password Recovery</h3>
                  <p className="text-xs text-indigo-300">
                    Step {forgotStep} of 3: {forgotStep === 1 ? 'Request OTP' : forgotStep === 2 ? 'Verify 6-Digit OTP' : 'Set New Password'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeForgotPassword}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Progress Indicators */}
            <div className="grid grid-cols-3 bg-slate-100 p-1 border-b border-slate-200 text-center text-[11px] font-bold">
              <div className={`py-1.5 rounded-lg transition-all ${forgotStep === 1 ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-400'}`}>
                1. Email
              </div>
              <div className={`py-1.5 rounded-lg transition-all ${forgotStep === 2 ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-400'}`}>
                2. Verify OTP
              </div>
              <div className={`py-1.5 rounded-lg transition-all ${forgotStep === 3 ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-400'}`}>
                3. New Password
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              
              {/* STEP 1: Request OTP */}
              {forgotStep === 1 && (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-1">Enter your registered email</h4>
                    <p className="text-xs text-slate-500 mb-3">
                      We will dispatch a secure 6-digit one-time verification code to your institutional mailbox.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Work / Institutional Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        autoFocus
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="e.g. m.vance@oakridge-academy.edu"
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={closeForgotPassword}
                      className="w-1/3 py-2.5 px-3 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading || !forgotEmail.trim()}
                      className="w-2/3 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
                    >
                      {forgotLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Sending OTP...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Verification OTP</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: Verify OTP */}
              {forgotStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-1">Verify 6-digit OTP code</h4>
                    <p className="text-xs text-slate-500">
                      Enter the security verification code dispatched to:
                    </p>
                    <p className="text-xs font-bold text-indigo-700 mt-0.5 font-mono">{forgotEmail}</p>
                  </div>

                  {forgotInfoMessage && (
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-800">
                      {forgotInfoMessage}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      6-Digit Security OTP
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      maxLength={6}
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none font-bold text-slate-900"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Change Email</span>
                    </button>

                    <button
                      type="button"
                      disabled={forgotLoading}
                      onClick={handleRequestOtp}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Resend OTP</span>
                    </button>
                  </div>

                  <div className="pt-2 flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={closeForgotPassword}
                      className="w-1/3 py-2.5 px-3 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading || forgotOtp.length < 6}
                      className="w-2/3 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
                    >
                      {forgotLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify & Proceed</span>
                          <Check className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Set New Password */}
              {forgotStep === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-1">Set your new password</h4>
                    <p className="text-xs text-slate-500">
                      After updating, all existing active sessions for this account will be terminated immediately.
                    </p>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        autoFocus
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none font-medium text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none font-medium text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={closeForgotPassword}
                      className="w-1/3 py-2.5 px-3 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading || !newPassword.trim() || !confirmPassword.trim()}
                      className="w-2/3 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-100 transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
                    >
                      {forgotLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <span>Save & End All Sessions</span>
                          <Check className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
