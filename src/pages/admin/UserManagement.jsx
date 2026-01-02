import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, UserPlus, Search, Ban, CheckCircle } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ nome: '', email: '', role: 'USUARIO', sector_id: '' });
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: s } = await supabase.from('sectors').select('id, nome');
    setSectors(s || []);
    const { data: u } = await supabase.from('users').select(`*, user_sectors(sectors(nome))`).order('created_at', { ascending: false });
    setUsers(u || []);
    setLoading(false);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setProcessing(true);
    // Em produção real, aqui chamaria uma Edge Function para criar o Auth User
    alert(`Simulação: Convite enviado para ${formData.email}. (Necessário Backend para criar login real)`);
    setShowModal(false);
    setProcessing(false);
  };

  const toggleStatus = async (id, status) => {
    await supabase.from('users').update({ active: !status }).eq('id', id);
    fetchData();
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div><h1 className="text-2xl font-bold text-slate-900">Gestão de Usuários</h1><p className="text-slate-500">Controle de acesso da prefeitura.</p></div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex gap-2 items-center hover:bg-blue-700"><UserPlus size={18} /> Novo Usuário</button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs">
            <tr><th className="px-6 py-4">Nome</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Perfil</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Ações</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? <tr><td colSpan="5" className="p-8 text-center"><Loader2 className="animate-spin mx-auto"/></td></tr> : users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{u.nome}</td>
                <td className="px-6 py-4 text-slate-600">{u.email}</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold">{u.role}</span></td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-2 text-xs font-bold ${u.active ? 'text-green-600' : 'text-red-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${u.active ? 'bg-green-500' : 'bg-red-500'}`}></span> {u.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => toggleStatus(u.id, u.active)} className="text-slate-400 hover:text-blue-600" title={u.active ? "Bloquear" : "Ativar"}>
                    {u.active ? <Ban size={18} /> : <CheckCircle size={18} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Novo Usuário</h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <input required placeholder="Nome Completo" className="w-full p-2 border rounded" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
              <input required type="email" placeholder="Email" className="w-full p-2 border rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <select className="p-2 border rounded" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="USUARIO">Usuário</option>
                  <option value="TECNICO">Técnico</option>
                  <option value="GESTOR">Gestor</option>
                </select>
                <select className="p-2 border rounded" value={formData.sector_id} onChange={e => setFormData({...formData, sector_id: e.target.value})}>
                  <option value="">Setor (Geral)</option>
                  {sectors.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border rounded">Cancelar</button>
                <button type="submit" disabled={processing} className="flex-1 py-2 bg-blue-600 text-white rounded font-bold">Enviar Convite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}