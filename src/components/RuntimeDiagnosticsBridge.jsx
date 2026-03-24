import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { installRuntimeDiagnostics, setRuntimeRoute } from '../services/runtimeDiagnostics';

export default function RuntimeDiagnosticsBridge() {
  const location = useLocation();

  useEffect(() => {
    installRuntimeDiagnostics();
  }, []);

  useEffect(() => {
    setRuntimeRoute(`${location.pathname}${location.search || ''}`);
  }, [location.pathname, location.search]);

  return null;
}
