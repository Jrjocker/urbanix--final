import React from 'react';
import { LogOut, List, PlusCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function PublicLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 shadow-sm">
        <span className="text-xl font-bold tracking-wide text-blue-600">urbanix</span>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex gap-4 mr-4">
             <button onClick={() => navigate('/abrir-chamado')} className={`text-sm font-medium ${location.pathname === '/abrir-chamado' ? 'text-blue-600' : 'text-slate-500'}`}>Novo Chamado</button>
             <button onClick={() => navigate('/acompanhar')} className={`text-sm font-medium ${location.pathname.includes('/acompanhar') ? 'text-blue-600' : 'text-slate-500'}`}>Meus Pedidos</button>
          </nav>
          <button onClick={handleLogout} className="text-sm font-medium text-slate-500 hover:text-red-500 flex items-center gap-1">
            <LogOut size={16} /> Sair
          </button>
        </div>
      </header>
      <div className="md:hidden flex justify-around bg-white border-b border-slate-200 py-2">
        <button onClick={() => navigate('/abrir-chamado')} className="flex flex-col items-center text-xs text-slate-600"><PlusCircle size={20}/> Abrir</button>
        <button onClick={() => navigate('/acompanhar')} className="flex flex-col items-center text-xs text-slate-600"><List size={20}/> Acompanhar</button>
      </div>
      <main className="flex-1 max-w-3xl mx-auto w-full p-4 md:p-8">
        {children}
      </main>
      <footer className="text-center py-6 text-slate-400 text-xs">
        &copy; 2024 Urbanix
      </footer>
    </div>
  );
}