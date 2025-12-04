import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, perform auth logic here
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-light p-6 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-teal-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center max-w-6xl w-full z-10 fade-in">
        
        {/* Illustration Side */}
        <div className="hidden md:flex justify-center relative">
          <div className="relative w-full aspect-square max-w-md">
            {/* Abstract representation of the fox/owl illustration using placeholder graphics or SVG logic */}
            <div className="w-full h-full bg-contain bg-no-repeat bg-center drop-shadow-2xl transition-transform duration-500 hover:scale-105" 
                 style={{ backgroundImage: `url('https://cdn.dribbble.com/users/1355613/screenshots/15563964/media/37e3e970a2489c402179d6281735a28c.jpg?resize=800x600&vertical=center')`, borderRadius: '2rem' }}>
              {/* Using a placeholder image that matches the vibe (illustration style) since I cannot generate the complex SVG from scratch perfectly without code bloat. In production, this would be an SVG component. */}
              <div className="absolute inset-0 bg-gradient-to-t from-background-light via-transparent to-transparent rounded-[2rem]"></div>
            </div>
            
             {/* Floating elements simulation */}
             <div className="absolute -top-4 -right-4 bg-white p-4 rounded-2xl shadow-soft animate-bounce" style={{ animationDuration: '3s' }}>
                <span className="material-symbols-outlined text-4xl text-primary">card_giftcard</span>
             </div>
             <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-2xl shadow-soft animate-bounce" style={{ animationDuration: '4s' }}>
                <span className="material-symbols-outlined text-4xl text-soft-sage">celebration</span>
             </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">Welcome to <span className="text-primary">Family Gifting</span></h1>
            <p className="text-slate-500 text-lg">Log in to continue managing your gifts and lists.</p>
          </div>

          <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-soft hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-semibold text-center text-slate-800 mb-8">Login</h2>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2 ml-1" htmlFor="email">Email or Username</label>
                <input 
                    className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 outline-none" 
                    id="email" 
                    name="email" 
                    placeholder="you@example.com" 
                    type="email" 
                    defaultValue="demo@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2 ml-1" htmlFor="password">Password</label>
                <input 
                    className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 outline-none" 
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    type="password" 
                    defaultValue="password"
                />
              </div>
              <div className="pt-2">
                <button 
                    type="submit"
                    className="w-full bg-primary text-white font-bold py-4 rounded-full shadow-lg shadow-primary/30 hover:bg-primary-dark hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                >
                    Log In
                </button>
              </div>
            </form>
          </div>

          <div className="text-center mt-8">
            <p className="text-slate-500">
                Don't have an account? 
                <a href="#" className="font-semibold text-primary hover:underline ml-1">Sign Up</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
