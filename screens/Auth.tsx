
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (isSignUp) {
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;
        
        if (authData.user) {
          // 1. Create the user profile in our custom table
          const { error: profileError } = await supabase.from('med_users').insert({
            id: authData.user.id,
            first_name: firstName,
            last_name: lastName,
            start_date: new Date().toISOString().split('T')[0]
          });
          
          if (profileError) throw profileError;

          // 2. Prevent automatic login: Sign out immediately if a session was created
          await supabase.auth.signOut();
          
          // 3. Trigger success state
          setSuccess(true);
          setPassword(''); // Clear password for security
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const proceedToLogin = () => {
    setSuccess(false);
    setIsSignUp(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-12">
        {/* Brand Header */}
        <div className="text-left animate-in fade-in slide-in-from-top-4 duration-1000">
          <p className="text-white subtitle-fluid font-serif-premium font-light tracking-tight leading-none mb-1 opacity-90">
             mastery <span className="text-white/30">of</span>
          </p>
          <h1 className="text-sky-400 title-fluid font-black tracking-tighter leading-[0.85] uppercase -ml-1 text-glow-blue">
            MEDICINE
          </h1>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-luxury pt-6 ml-1">
            MEDSPRINT CLINICAL PROTOCOL V4.0
          </p>
        </div>

        {/* Auth Content Area */}
        <div className="glass-card p-8 rounded-[2.5rem] shadow-2xl border border-white/5 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 relative overflow-hidden min-h-[400px] flex flex-col">
          
          {success ? (
            /* SUCCESS VIEW */
            <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-700">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse" />
                <div className="h-20 w-20 rounded-[2rem] bg-emerald-500 flex items-center justify-center text-emerald-950 shadow-2xl relative z-10">
                  <ShieldCheck size={40} strokeWidth={2.5} />
                </div>
              </div>
              
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Protocol Initialized</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-luxury leading-relaxed px-4">
                  Clinical account created successfully. <br/> Access your dashboard to begin.
                </p>
              </div>

              <button 
                onClick={proceedToLogin}
                className="w-full h-16 bg-white text-slate-950 rounded-[1.25rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-[0_10px_30px_-5px_rgba(255,255,255,0.2)] active:scale-95 transition-premium flex items-center justify-center space-x-3 group"
              >
                <span>Proceed to Login</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ) : (
            /* FORM VIEW */
            <>
              <div className={`flex bg-white/5 p-1 rounded-2xl mb-8 border border-white/5 transition-all duration-500`}>
                <button 
                  type="button"
                  onClick={() => setIsSignUp(false)} 
                  className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-luxury transition-premium ${!isSignUp ? 'bg-white text-slate-950 shadow-xl' : 'text-slate-500'}`}
                >
                  Sign In
                </button>
                <button 
                  type="button"
                  onClick={() => setIsSignUp(true)} 
                  className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-luxury transition-premium ${isSignUp ? 'bg-white text-slate-950 shadow-xl' : 'text-slate-500'}`}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleAuth} className="space-y-4 flex-1">
                {error && (
                  <div className="p-4 bg-red-500/10 text-red-400 text-[9px] font-black rounded-xl border border-red-500/20 uppercase tracking-widest text-center animate-in zoom-in-95">
                    {error}
                  </div>
                )}
                
                {isSignUp && (
                  <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-left-4 duration-500">
                    <input 
                      required 
                      placeholder="FIRST" 
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-bold text-white focus:border-sky-500 outline-none transition-premium focus:bg-sky-500/5 placeholder:text-slate-600" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)} 
                    />
                    <input 
                      required 
                      placeholder="LAST" 
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-bold text-white focus:border-sky-500 outline-none transition-premium focus:bg-sky-500/5 placeholder:text-slate-600" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)} 
                    />
                  </div>
                )}
                
                <input 
                  required 
                  type="email" 
                  placeholder="EMAIL ADDRESS" 
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-bold text-white focus:border-sky-500 outline-none transition-premium focus:bg-sky-500/5 placeholder:text-slate-600" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
                <input 
                  required 
                  type="password" 
                  placeholder="PASSWORD" 
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-bold text-white focus:border-sky-500 outline-none transition-premium focus:bg-sky-500/5 placeholder:text-slate-600" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-16 bg-white text-slate-950 rounded-[1.25rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-[0_10px_30px_-5px_rgba(255,255,255,0.2)] active:scale-95 transition-premium mt-4 flex items-center justify-center"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    isSignUp ? 'Initialize Intelligence' : 'Begin Session'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
        
        <p className="text-center text-[9px] text-slate-700 font-black uppercase tracking-[0.5em] opacity-50">
          Steady Progress Compounds Over Time
        </p>
      </div>
    </div>
  );
};

export default Auth;
