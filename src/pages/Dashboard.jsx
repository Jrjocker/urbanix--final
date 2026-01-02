import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Package, Loader2, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { supabase } from '../lib/supabase';

const StatCard = ({ title, value, icon: Icon, color, suffix }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex justify-between items-start">
    <div>
      <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800">{value}{suffix}</h3>
    </div>
    <div className={`p-3 rounded-lg ${color} bg-opacity-10`}><Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} /></div>
  </div>
);

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [internalUser, setInternalUser] = useState(user || null);
  const [metrics, setMetrics] = useState({ open: 0, inProgress: 0, closed: 0, rate: 0 });
  const [charts, setCharts] = useState({ by_status: [], by_sector: [] });

  useEffect(() => {
    if (!user) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) supabase.from('users').select('*').eq('id', user.id).single().then(({ data }) => setInternalUser(data));
        else navigate('/login');
      });
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!internalUser?.tenant_id) return;
      if (internalUser.role === 'GESTOR') {
        const { data: mData } = await supabase.rpc('get_dashboard_metrics', { p_tenant_id: internalUser.tenant_id });
        if (mData && mData[0]) {
            setMetrics({ 
                open: mData[0].total_open, 
                inProgress: mData[0].total_in_progress, 
                closed: mData[0].total_closed, 
                rate: mData[0].resolution_rate 
            });
        }
        const { data: cData } = await supabase.rpc('get_dashboard_charts', { p_tenant_id: internalUser.tenant_id });
        if (cData) setCharts({ by_status: cData.by_status || [], by_sector: cData.by_sector || [] });
      }
      setLoading(false);
    };
    fetchData();
  }, [internalUser]);

  if (!internalUser) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Visão Geral</h1>
        <p className="text-slate-500 mt-1">Olá, {internalUser.nome}.</p>
      </div>
      
      {loading ? <Loader2 className="animate-spin text-blue-600" /> : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Abertos" value={metrics.open} icon={AlertTriangle} color="bg-rose-500" />
            <StatCard title="Em Execução" value={metrics.inProgress} icon={Package} color="bg-amber-500" />
            <StatCard title="Resolvidos" value={metrics.closed} icon={CheckCircle} color="bg-emerald-500" />
            <StatCard title="Taxa de Resolução" value={metrics.rate} icon={TrendingUp} color="bg-blue-500" suffix="%" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-6">Volume por Setor</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.by_sector}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-6">Distribuição de Status</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={charts.by_status} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="count">
                      {charts.by_status.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}