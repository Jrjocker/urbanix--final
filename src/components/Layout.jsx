import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Ticket, Box, Users, Settings, LogOut, Shield, Menu, Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Layout({ children, user: initialUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(initialUser);

  useEffect(() => {
    if (!currentUser) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase.from('users').select('*').eq('id', user.id).single().then(({ data }) => setCurrentUser(data));
        } else {
          navigate('/login');
        }
      });
    }
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Super Admin', icon: Shield, path: '/admin', role: 'SUPER_ADMIN' },
    { label: 'Visão Geral', icon: LayoutDashboard, path: '/dashboard', role: ['GESTOR', 'SUPER_ADMIN'] },
    { label: 'Chamados', icon: Ticket, path: '/chamados', role: ['GESTOR', 'TECNICO', 'SUPER_ADMIN'] },
    { label: 'Ativos', icon: Box, path: '/ativos', role: ['GESTOR', 'SUPER_ADMIN', 'TECNICO'] },
    { label: 'Usuários', icon: Users, path: '/usuarios', role: ['GESTOR', 'SUPER_ADMIN'] },
    { label: 'Configurações', icon: Settings, path: '/config', role: ['GESTOR', 'SUPER_ADMIN'] },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-2">
          <span className="text-xl font-bold tracking-wide text-blue-400">urbanix</span>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1">
          {menuItems.map((item) => {
             if (item.role) {
                const roles = Array.isArray(item.role) ? item.role : [item.role];
                if (!roles.includes(currentUser?.role)) return null;
             }
             const isActive = location.pathname === item.path;
             return (
              <button key={item.path} onClick={() => navigate(item.path)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                <item.icon size={20} /> {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800 text-center">
          <p className="text-sm font-medium text-white">{currentUser?.nome || 'Carregando...'}</p>
          <p className="text-xs text-slate-400 mb-2">{currentUser?.role || '...'}</p>
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 text-xs text-red-400 hover:text-red-300 w-full py-2"><LogOut size={14} /> Sair</button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4"><Menu className="md:hidden text-slate-600" /><h2 className="text-slate-500 text-sm font-medium">Painel Administrativo</h2></div>
          <Bell className="text-slate-400 hover:text-blue-600 cursor-pointer" size={20} />
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}