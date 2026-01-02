import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('tickets')
        .select('id, readable_id, status, descricao, prioridade, locations(nome)')
        .order('created_at', { ascending: false });
      setTickets(data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Todos os Chamados</h1>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs">
            <tr><th className="px-6 py-4">ID</th><th className="px-6 py-4">Descrição</th><th className="px-6 py-4">Local</th><th className="px-6 py-4">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map(t => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-bold text-slate-700">#{t.readable_id}</td>
                <td className="px-6 py-4 truncate max-w-xs">{t.descricao}</td>
                <td className="px-6 py-4 text-sm">{t.locations?.nome}</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold uppercase">{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}