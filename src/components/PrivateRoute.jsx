import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function PrivateRoute({ children, roles }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (mounted) setLoading(false); return; }

      const { data: profile, error } = await supabase.from('users').select('role').eq('id', user.id).single();

      if (!profile || error) {
        if (mounted) { setAuthorized(false); setLoading(false); }
        return;
      }

      if (!roles || roles.includes(profile.role)) {
        if (mounted) setAuthorized(true);
      }
      if (mounted) setLoading(false);
    }
    checkAuth();
    return () => { mounted = false; };
  }, [roles]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  return authorized ? children : <Navigate to="/login" />;
}