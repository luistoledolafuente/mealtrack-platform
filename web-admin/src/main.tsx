import { FormEvent, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type User = {
  id: string;
  fullName: string;
  email: string;
  role: string;
};

type Restaurant = {
  id: string;
  name: string;
  address: string | null;
  isActive: boolean;
  createdAt: string;
};

type ApiError = {
  message: string;
  status: number;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
const storageKey = 'mealtrack-control-session';

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const body = await response.json().catch(() => null) as { data?: T; message?: string } | null;
  if (!response.ok) {
    throw { message: body?.message || 'No se pudo completar la solicitud', status: response.status } satisfies ApiError;
  }
  return body?.data as T;
}

function readSession(): { token: string; user: User } | null {
  const raw = sessionStorage.getItem(storageKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { token: string; user: User };
  } catch {
    sessionStorage.removeItem(storageKey);
    return null;
  }
}

function App() {
  const [session, setSession] = useState(readSession);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(Boolean(session));
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Restaurant | null>(null);

  const filteredRestaurants = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return restaurants;
    return restaurants.filter((restaurant) => `${restaurant.name} ${restaurant.address || ''}`.toLowerCase().includes(normalized));
  }, [query, restaurants]);

  const loadRestaurants = async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      setRestaurants(await request<Restaurant[]>('/restaurants', {}, session.token));
    } catch (caught) {
      setError((caught as ApiError).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRestaurants();
  }, [session]);

  const logout = () => {
    sessionStorage.removeItem(storageKey);
    setSession(null);
    setRestaurants([]);
    setQuery('');
  };

  if (!session) {
    return <Login onAuthenticated={setSession} />;
  }

  const activeCount = restaurants.filter((restaurant) => restaurant.isActive).length;
  const pausedCount = restaurants.length - activeCount;

  return (
    <div className="shell">
      <aside className="sidebar" aria-label="Navegación principal">
        <div className="brand"><span className="brand-mark">MT</span><span>MealTrack</span></div>
        <div className="eyebrow">Control Center</div>
        <nav><a className="nav-item active" href="#restaurants">Restaurantes</a><span className="nav-item disabled">Módulos SaaS</span><span className="nav-item disabled">Auditoría</span></nav>
        <div className="sidebar-foot"><span className="user-initials">{initials(session.user.fullName)}</span><div><strong>{session.user.fullName}</strong><small>Superadmin</small></div><button className="text-button" onClick={logout}>Salir</button></div>
      </aside>
      <main className="main-content">
        <header className="topbar"><div><p className="eyebrow">Operación central</p><h1>Restaurantes</h1><p className="muted">Administra los restaurantes que operan en MealTrack.</p></div><button className="button primary" onClick={() => setShowCreate(true)}>Crear restaurante</button></header>
        <section className="metrics" aria-label="Resumen operativo"><Metric label="Restaurantes" value={restaurants.length} /><Metric label="Operativos" value={activeCount} tone="success" /><Metric label="Suspendidos" value={pausedCount} tone="muted" /></section>
        <section id="restaurants" className="panel"><div className="panel-heading"><div><h2>Directorio operativo</h2><p>Los cambios de estado se aplican inmediatamente y quedan registrados.</p></div><label className="search"><span className="sr-only">Buscar restaurante</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre o dirección" /></label></div>
          {error && <div className="notice error" role="alert">{error}<button onClick={() => void loadRestaurants()}>Reintentar</button></div>}
          {loading ? <div className="state">Cargando restaurantes…</div> : filteredRestaurants.length === 0 ? <div className="state">No hay restaurantes que coincidan. <button className="link-button" onClick={() => setShowCreate(true)}>Crea el primero.</button></div> : <RestaurantTable restaurants={filteredRestaurants} onEdit={setEditing} />}
        </section>
      </main>
      {showCreate && <RestaurantDialog title="Crear restaurante" action="Crear restaurante" token={session.token} onClose={() => setShowCreate(false)} onSaved={(restaurant) => { setRestaurants((current) => [...current, restaurant].sort((a, b) => a.name.localeCompare(b.name))); setShowCreate(false); }} />}
      {editing && <RestaurantDialog title="Editar restaurante" action="Guardar cambios" token={session.token} restaurant={editing} onClose={() => setEditing(null)} onSaved={(restaurant) => { setRestaurants((current) => current.map((item) => item.id === restaurant.id ? restaurant : item)); setEditing(null); }} />}
    </div>
  );
}

function Login({ onAuthenticated }: { onAuthenticated: (session: { token: string; user: User }) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await request<{ accessToken: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      if (result.user.role !== 'superadmin') throw { message: 'Esta cuenta no tiene acceso al Control Center.', status: 403 } satisfies ApiError;
      const session = { token: result.accessToken, user: result.user };
      sessionStorage.setItem(storageKey, JSON.stringify(session));
      onAuthenticated(session);
    } catch (caught) {
      setError((caught as ApiError).message);
    } finally {
      setSubmitting(false);
    }
  };

  return <main className="login-page"><section className="login-copy"><div className="brand"><span className="brand-mark">MT</span><span>MealTrack</span></div><p className="eyebrow">Control Center</p><h1>Una vista clara de cada operación.</h1><p>Gestiona los restaurantes y mantén el piloto bajo control desde un solo lugar.</p><div className="login-signal"><span></span> API protegida y operación auditada</div></section><section className="login-card"><p className="eyebrow">Acceso restringido</p><h2>Iniciar sesión</h2><p className="muted">Solo cuentas Superadmin.</p><form onSubmit={submit}><label>Correo<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Contraseña<input required type="password" minLength={8} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button primary full" disabled={submitting}>{submitting ? 'Validando acceso…' : 'Entrar al panel'}</button></form></section></main>;
}

function Metric({ label, value, tone = 'default' }: { label: string; value: number; tone?: 'default' | 'success' | 'muted' }) {
  return <article className={`metric ${tone}`}><span>{label}</span><strong>{value}</strong></article>;
}

function RestaurantTable({ restaurants, onEdit }: { restaurants: Restaurant[]; onEdit: (restaurant: Restaurant) => void }) {
  return <div className="table-wrap"><table><thead><tr><th>Restaurante</th><th>Dirección</th><th>Estado</th><th>Creado</th><th><span className="sr-only">Acciones</span></th></tr></thead><tbody>{restaurants.map((restaurant) => <tr key={restaurant.id}><td><strong>{restaurant.name}</strong><small>{restaurant.id}</small></td><td>{restaurant.address || 'Sin dirección registrada'}</td><td><span className={`status ${restaurant.isActive ? 'active' : 'inactive'}`}>{restaurant.isActive ? 'Operativo' : 'Suspendido'}</span></td><td>{new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(new Date(restaurant.createdAt))}</td><td><button className="button secondary small" onClick={() => onEdit(restaurant)}>Gestionar</button></td></tr>)}</tbody></table></div>;
}

function RestaurantDialog({ title, action, token, restaurant, onClose, onSaved }: { title: string; action: string; token: string; restaurant?: Restaurant; onClose: () => void; onSaved: (restaurant: Restaurant) => void }) {
  const [name, setName] = useState(restaurant?.name || '');
  const [address, setAddress] = useState(restaurant?.address || '');
  const [isActive, setIsActive] = useState(restaurant?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = restaurant ? { name, address: address || undefined, isActive } : { name, address: address || undefined };
      const saved = await request<Restaurant>(restaurant ? `/restaurants/${restaurant.id}` : '/restaurants', { method: restaurant ? 'PATCH' : 'POST', body: JSON.stringify(payload) }, token);
      onSaved(saved);
    } catch (caught) {
      setError((caught as ApiError).message);
    } finally {
      setSaving(false);
    }
  };
  return <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="restaurant-dialog-title"><div className="modal-head"><div><p className="eyebrow">Directorio operativo</p><h2 id="restaurant-dialog-title">{title}</h2></div><button className="close" aria-label="Cerrar" onClick={onClose}>×</button></div><form onSubmit={save}><label>Nombre del restaurante<input required maxLength={200} value={name} onChange={(event) => setName(event.target.value)} /></label><label>Dirección<input maxLength={300} value={address} onChange={(event) => setAddress(event.target.value)} /></label>{restaurant && <label className="toggle"><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} /><span>Restaurante operativo</span></label>}{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Cancelar</button><button className="button primary" disabled={saving}>{saving ? 'Guardando…' : action}</button></div></form></section></div>;
}

function initials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

createRoot(document.getElementById('root')!).render(<App />);
