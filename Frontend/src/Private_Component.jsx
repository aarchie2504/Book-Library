import { Navigate, Outlet } from 'react-router-dom';
import { isLoggedIn, getRole } from './api';

// ── Generic: must be logged in ────────────────────────────────────────────────
export function Private_Component() {
  return isLoggedIn() ? <Outlet /> : <Navigate to="/login" replace />;
}

// ── Admin only ────────────────────────────────────────────────────────────────
export function AdminRoute() {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (getRole() !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
}

// ── Writer only ───────────────────────────────────────────────────────────────
export function WriterRoute() {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (getRole() !== 'writer') return <Navigate to="/" replace />;
  return <Outlet />;
}

// ── Reader only ───────────────────────────────────────────────────────────────
export function ReaderRoute() {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (getRole() !== 'reader') return <Navigate to="/" replace />;
  return <Outlet />;
}

// ── Any logged-in user (default export for backwards compat) ─────────────────
export default Private_Component;
