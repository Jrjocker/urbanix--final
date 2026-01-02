import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2, ChevronRight } from 'lucide-react';

export default function PublicTicketList() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyTickets() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase.from('tickets')
        .select('id, readable_id, status, descricao, created_at, locations(nome)')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });
      setTickets(data || []);
      setLoading(false);
    }
    fetchMyTickets();
  }, []);

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Meus Pedidos</h1>
      {tickets.length === 0 ? (
        <p className="text-center text-slate-500 py-10">Você não tem chamados.</p>
      ) : (
        <div className="space-y-4">
          {tickets.map(t => (
            <div key={t.id} onClick={() => navigate(`/acompanhar/${t.id}`)} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex justify-between cursor-pointer">
              <div>
                <span className="font-bold">#{t.readable_id}</span> - {t.status}
                <p className="text-sm text-slate-500">{t.descricao}</p>
              </div>
              <ChevronRight />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}