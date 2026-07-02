import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ProtectedRoute({ children, allowedRoles }) {
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!active) return;

        if (!session) {
          setHasSession(false);
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        setHasSession(true);

        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (!active) return;

        if (profile) {
          if (allowedRoles && allowedRoles.length > 0) {
            setIsAuthorized(allowedRoles.includes(profile.role));
          } else {
            setIsAuthorized(true);
          }
        } else {
          setIsAuthorized(false);
        }
      } catch (err) {
        console.error('Error in ProtectedRoute auth check:', err);
        setIsAuthorized(false);
      } finally {
        if (active) setLoading(false);
      }
    };

    checkAuth();

    return () => {
      active = false;
    };
  }, [allowedRoles]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <style>{`
          .loader-container {
            display: grid;
            place-items: center;
            height: 100vh;
            background-color: var(--color-bg-dark);
          }
          .loader {
            width: 48px;
            height: 48px;
            border: 3px solid rgba(255, 107, 53, 0.1);
            border-radius: 50%;
            border-top-color: var(--color-primary);
            animation: spin 1s ease-in-out infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!hasSession) {
    // If not logged in, redirect to auth
    return <Navigate to="/auth" replace />;
  }

  if (!isAuthorized) {
    // Session exists but role is unauthorized -> Alert and redirect to homepage
    alert('Akses ditolak. Halaman ini memerlukan hak akses khusus.');
    return <Navigate to="/" replace />;
  }

  return children;
}
