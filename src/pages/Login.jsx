import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword(formData);
      if (authError) throw authError;

      const { data: userProfile, error: profileError } = await supabase
        .from('users').select('role, active').eq('id', authData.user.id).single();

      if (profileError) throw new Error("Erro de perfil.");
      if (userProfile.active === false) {
        await supabase.auth.signOut();
        throw new Error("Conta bloqueada.");
      }

      if (userProfile.role === 'GESTOR') navigate('/dashboard');
      else if (userProfile.role === 'TECNICO') navigate('/chamados');
      else if (userProfile.role === 'SUPER_ADMIN') navigate('/admin');
      else navigate('/abrir-chamado'); 

    } catch (error) {
      setErrorMsg(error.message || 'Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">urbanix</h1>
            <h2 className="text-2xl font-bold text-slate-900">Bem-vindo</h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            {errorMsg && <div className="text-red-600 bg-red-50 p-3 rounded text-sm flex gap-2"><AlertCircle size={16}/>{errorMsg}</div>}
            <div className="space-y-4">
              <input type="email" required placeholder="Email corporativo" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, email: e.target.value})} />
              <input type="password" required placeholder="Senha" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <button disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-lg">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
      <div className="hidden md:block w-1/2 bg-slate-900" />
    </div>
  );
}