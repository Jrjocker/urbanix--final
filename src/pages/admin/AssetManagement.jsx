import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, QrCode, Plus, Save } from 'lucide-react';

export default function AssetManagement() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [sectors, setSectors] = useState([]);
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({ nome: '', categoria: '', location_id: '', sector_id: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { 
    fetchAssets();
    fetchDependencies();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    const { data } = await supabase.from('assets').select('*, locations(nome), sectors(nome)').order('created_at', { ascending: false });
    setAssets(data || []);
    setLoading(false);
  };

  const fetchDependencies = async () => {
    const { data: s } = await supabase.from('sectors').select('id, nome');
    setSectors(s || []);
    const { data: l } = await supabase.from('locations').select('id, nome');
    setLocations(l || []);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
    
    if (!profile?.tenant_id) {
        alert("Erro: Perfil de usuário incompleto.");
        setSubmitting(false);
        return;
    }

    const qrHash = `${profile.tenant_id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const { error } = await supabase.from('assets').insert({
      tenant_id: profile.tenant_id,
      nome: formData.nome,
      categoria: formData.categoria,
      location_id: formData.location_id,
      sector_id: formData.sector_id,
      qr_code_hash: qrHash
    });

    setSubmitting(false);
    if (error) {
      console.error(error);
      alert('Erro ao criar ativo. Verifique permissões.');
    } else {
      setShowModal(false);
      setFormData({ nome: '', categoria: '', location_id: '', sector_id: '' });
      fetchAssets();
      alert('Ativo criado com sucesso!');
    }
  };

  const handlePrintQR = (hash, name) => {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${hash}`;
    const win = window.open('', '_blank');
    win.document.write(`
      <div style="text-align:center; font-family:sans-serif; padding: 20px;">
        <h1 style="font-size: 18px; margin-bottom: 10px;">${name}</h1>
        <img src="${url}" style="border: 1px solid #ccc; padding: 10px;" />
        <p style="font-size: 12px; color: #555;">ID: ${hash}</p>
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Imprimir Etiqueta</button>
      </div>
    `);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Ativos & Patrimônio</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-blue-700"><Plus size={18}/> Novo Ativo</button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs">
            <tr><th className="px-6 py-4">Nome</th><th className="px-6 py-4">Categoria</th><th className="px-6 py-4">Local</th><th className="px-6 py-4">Setor</th><th className="px-6 py-4 text-center">QR Code</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? <tr><td colSpan="5" className="p-8 text-center"><Loader2 className="animate-spin mx-auto"/></td></tr> : assets.map(a => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{a.nome}</td>
                <td className="px-6 py-4 text-slate-600">{a.categoria}</td>
                <td className="px-6 py-4 text-slate-600">{a.locations?.nome}</td>
                <td className="px-6 py-4 text-slate-600">{a.sectors?.nome}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => handlePrintQR(a.qr_code_hash, a.nome)} className="text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors" title="Gerar Etiqueta">
                    <QrCode size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold mb-4 text-slate-900">Cadastrar Novo Ativo</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Ativo</label>
                <input required className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Ex: Ar Condicionado Split" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <input required className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} placeholder="Ex: Climatização" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Localização</label>
                  <select required className="w-full p-2.5 border rounded-lg bg-white outline-none"
                    value={formData.location_id} onChange={e => setFormData({...formData, location_id: e.target.value})}>
                    <option value="">Selecione...</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Setor Responsável</label>
                  <select required className="w-full p-2.5 border rounded-lg bg-white outline-none"
                    value={formData.sector_id} onChange={e => setFormData({...formData, sector_id: e.target.value})}>
                    <option value="">Selecione...</option>
                    {sectors.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancelar</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex justify-center items-center gap-2">
                  {submitting ? <Loader2 className="animate-spin" size={18}/> : <><Save size={18}/> Salvar Ativo</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}