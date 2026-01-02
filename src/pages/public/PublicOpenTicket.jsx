import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Send, Loader2, CheckCircle, QrCode } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function PublicOpenTicket() {
  const [searchParams] = useSearchParams();
  const initialHash = searchParams.get('hash') || '';
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [desc, setDesc] = useState('');
  const [hash, setHash] = useState(initialHash);
  const [protocol, setProtocol] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // FLUXO AUTENTICADO
        const { data: profile } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
        const { data: defaultLoc } = await supabase.from('locations').select('id').eq('tenant_id', profile.tenant_id).limit(1).single();

        const { data: ticket } = await supabase.from('tickets').insert({
          tenant_id: profile.tenant_id,
          location_id: defaultLoc.id, 
          created_by: user.id,
          prioridade: 'Média',
          descricao: desc + (hash ? ` [Ref: ${hash}]` : ''),
          status: 'aberto'
        }).select('readable_id').single();
        
        setProtocol(ticket?.readable_id);
      } else {
        // FLUXO ANÔNIMO (QR CODE)
        if (!hash) throw new Error("Para abrir chamado sem login, escaneie um QR Code.");
        
        const { data: res, error } = await supabase.rpc('create_anon_ticket', {
          p_qr_hash: hash,
          p_descricao: desc
        });

        if (error) throw error;
        setProtocol(res.protocolo);
      }

      setSuccess(true);
    } catch (err) {
      alert(err.message || 'Erro ao enviar.');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="text-center py-12">
      <CheckCircle size={48} className="text-green-500 mx-auto mb-4"/>
      <h2 className="text-2xl font-bold">Solicitação Enviada!</h2>
      <p className="text-slate-500 mt-2">Protocolo: <span className="font-mono font-bold text-lg">#{protocol}</span></p>
      <button onClick={() => window.location.reload()} className="mt-6 text-blue-600 font-bold">Nova solicitação</button>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Abrir Chamado</h1>
      <p className="text-slate-500 mb-6">Relate problemas urbanos.</p>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 space-y-6">
        
        {!hash && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-800 flex gap-2">
            <QrCode size={16} className="mt-0.5"/>
            <span>Para abrir sem login, você precisa escanear um QR Code de um ativo.</span>
          </div>
        )}

        {hash && (
           <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700 font-mono">
             Ativo Identificado: {hash}
           </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">O que aconteceu?</label>
          <textarea className="w-full p-4 border rounded-lg h-32 outline-none focus:ring-2 focus:ring-blue-500" required value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descreva o problema..." />
        </div>
        
        <button disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-blue-700 transition-colors">
          {loading ? <Loader2 className="animate-spin" /> : <>Enviar <Send size={18} /></>}
        </button>
      </form>
    </div>
  );
}