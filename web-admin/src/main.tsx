import { FormEvent, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type User = { id: string; fullName: string; email: string; phone?: string | null; role: string; isActive: boolean; mustChangePassword: boolean; createdAt: string };
type Restaurant = { id: string; name: string; address: string | null; isActive: boolean; createdAt: string };
type MealPlan = { id: string; name: string; price: number; durationDays: number; description?: string | null; isActive: boolean };
type Subscription = { id: string; status: string; remainingDays: number; contractedDays: number; startDate: string; mealPlan: { name: string; price: number }; student: { fullName: string; email: string } };
type ApiError = { message: string; status: number };
type Session = { token: string; user: User };

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
const storageKey = 'mealtrack-control-session';
const dateFormatter = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' });
const currencyFormatter = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers } });
  const body = await response.json().catch(() => null) as { data?: T; message?: string } | null;
  if (!response.ok) throw { message: body?.message || 'No se pudo completar la solicitud', status: response.status } satisfies ApiError;
  return body?.data as T;
}

function readSession(): Session | null {
  const raw = sessionStorage.getItem(storageKey);
  if (!raw) return null;
  try { return JSON.parse(raw) as Session; } catch { sessionStorage.removeItem(storageKey); return null; }
}

function App() {
  const [session, setSession] = useState<Session | null>(readSession);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [loading, setLoading] = useState(Boolean(session));
  const [error, setError] = useState<string | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [support, setSupport] = useState<{ plans: MealPlan[]; users: User[]; subscriptions: Subscription[] } | null>(null);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportError, setSupportError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Restaurant | null>(null);
  const [showPlan, setShowPlan] = useState(false);
  const [showStudent, setShowStudent] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const selectedRestaurant = restaurants.find((restaurant) => restaurant.id === selectedRestaurantId) || null;
  const filteredRestaurants = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();
    return normalized ? restaurants.filter((restaurant) => `${restaurant.name} ${restaurant.address || ''}`.toLowerCase().includes(normalized)) : restaurants;
  }, [deferredQuery, restaurants]);

  const loadRestaurants = async () => {
    if (!session) return;
    setLoading(true); setError(null);
    try { setRestaurants(await request<Restaurant[]>('/restaurants', {}, session.token)); }
    catch (caught) { setError((caught as ApiError).message); }
    finally { setLoading(false); }
  };

  const loadSupport = async (restaurantId = selectedRestaurantId) => {
    if (!session || !restaurantId) return;
    setSupportLoading(true); setSupportError(null);
    const target = encodeURIComponent(restaurantId);
    try {
      const [plans, users, subscriptions] = await Promise.all([
        request<MealPlan[]>(`/meal-plans?restaurantId=${target}`, {}, session.token),
        request<User[]>(`/users?restaurantId=${target}`, {}, session.token),
        request<Subscription[]>(`/subscriptions?restaurantId=${target}`, {}, session.token),
      ]);
      setSupport({ plans, users, subscriptions });
    } catch (caught) { setSupportError((caught as ApiError).message); }
    finally { setSupportLoading(false); }
  };

  useEffect(() => { void loadRestaurants(); }, [session]);
  useEffect(() => { if (selectedRestaurantId) void loadSupport(selectedRestaurantId); else setSupport(null); }, [selectedRestaurantId]);

  const logout = () => { sessionStorage.removeItem(storageKey); setSession(null); setRestaurants([]); setSelectedRestaurantId(''); setSupport(null); };
  if (!session) return <Login onAuthenticated={setSession} />;

  const activeCount = restaurants.filter((restaurant) => restaurant.isActive).length;
  const students = support?.users.filter((user) => user.role === 'student') || [];
  const admins = support?.users.filter((user) => user.role === 'admin') || [];

  return <div className="shell">
    <aside className="sidebar" aria-label="Navegación principal">
      <div className="brand"><span className="brand-mark">MT</span><span>MealTrack</span></div>
      <div className="eyebrow">Control Center</div>
      <nav><a className="nav-item active" href="#restaurants">Restaurantes</a><a className="nav-item" href="#support">Soporte operativo</a><span className="nav-item disabled">Módulos SaaS · próximo</span></nav>
      <div className="sidebar-foot"><span className="user-initials">{initials(session.user.fullName)}</span><div><strong>{session.user.fullName}</strong><small>Superadmin</small></div><button className="text-button" onClick={logout}>Salir</button></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div><p className="eyebrow">Operación central</p><h1>Restaurantes</h1><p className="muted">Configura cada operación y brinda soporte sin salir del panel.</p></div><button className="button primary" onClick={() => setShowCreate(true)}>Crear restaurante</button></header>
      <section className="metrics" aria-label="Resumen operativo"><Metric label="Restaurantes" value={restaurants.length} /><Metric label="Operativos" value={activeCount} tone="success" /><Metric label="Suspendidos" value={restaurants.length - activeCount} tone="muted" /></section>
      <section id="restaurants" className="panel"><div className="panel-heading"><div><h2>Directorio operativo</h2><p>Selecciona Gestionar para abrir la consola de soporte de un restaurante.</p></div><label className="search"><span className="sr-only">Buscar restaurante</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre o dirección" /></label></div>
        {error && <Notice message={error} action={() => void loadRestaurants()} />}
        {loading ? <div className="state">Cargando restaurantes…</div> : filteredRestaurants.length === 0 ? <div className="state">No hay restaurantes que coincidan. <button className="link-button" onClick={() => setShowCreate(true)}>Crea el primero.</button></div> : <RestaurantTable restaurants={filteredRestaurants} onManage={(restaurant) => setSelectedRestaurantId(restaurant.id)} onEdit={setEditing} />}
      </section>
      <section id="support" className="support-section" aria-labelledby="support-title">
        <div className="section-intro"><div><p className="eyebrow">Soporte con trazabilidad</p><h2 id="support-title">Consola de restaurante</h2><p className="muted">Elige un restaurante. Todas las acciones se ejecutan con ese contexto explícito y auditado.</p></div><label className="restaurant-picker">Restaurante a gestionar<select aria-label="Restaurante a gestionar" value={selectedRestaurantId} onChange={(event) => setSelectedRestaurantId(event.target.value)}><option value="">Seleccionar restaurante…</option>{restaurants.map((restaurant) => <option key={restaurant.id} value={restaurant.id}>{restaurant.name}{restaurant.isActive ? '' : ' · suspendido'}</option>)}</select></label></div>
        {!selectedRestaurant ? <div className="support-empty">Selecciona un restaurante para gestionar sus planes, alumnos, administradores y suscripciones.</div> : <>
          <div className="support-header"><div><h3>{selectedRestaurant.name}</h3><p>{selectedRestaurant.address || 'Sin dirección registrada'} · <span className={`status ${selectedRestaurant.isActive ? 'active' : 'inactive'}`}>{selectedRestaurant.isActive ? 'Operativo' : 'Suspendido'}</span></p></div><button className="button secondary" onClick={() => void loadSupport()}>Actualizar datos</button></div>
          {supportError && <Notice message={supportError} action={() => void loadSupport()} />}
          {supportLoading ? <div className="state">Cargando información operativa…</div> : support && <div className="support-grid">
            <SupportPanel title="Planes de pensión" description="Oferta que verá y contratará el restaurante." count={support.plans.length} action="Crear plan" onAction={() => setShowPlan(true)}><PlanList plans={support.plans} /></SupportPanel>
            <SupportPanel title="Estudiantes" description="Registra al cliente y, si eliges un plan, crea su suscripción." count={students.length} action="Registrar estudiante" onAction={() => setShowStudent(true)}><UserList users={students} empty="Aún no hay estudiantes registrados." /></SupportPanel>
            <SupportPanel title="Administradores" description="Personal autorizado para operar este restaurante." count={admins.length} action="Crear administrador" onAction={() => setShowAdmin(true)}><UserList users={admins} empty="Aún no hay administradores registrados." /></SupportPanel>
            <SupportPanel title="Suscripciones" description="Estado actual de las pensiones asignadas." count={support.subscriptions.length}><SubscriptionList subscriptions={support.subscriptions} /></SupportPanel>
          </div>}
        </>}
      </section>
    </main>
    {showCreate && <RestaurantDialog title="Crear restaurante" action="Crear restaurante" token={session.token} onClose={() => setShowCreate(false)} onSaved={(restaurant) => { setRestaurants((current) => [...current, restaurant].sort((a, b) => a.name.localeCompare(b.name))); setShowCreate(false); setSelectedRestaurantId(restaurant.id); }} />}
    {editing && <RestaurantDialog title="Editar restaurante" action="Guardar cambios" token={session.token} restaurant={editing} onClose={() => setEditing(null)} onSaved={(restaurant) => { setRestaurants((current) => current.map((item) => item.id === restaurant.id ? restaurant : item)); setEditing(null); }} />}
    {selectedRestaurant && showPlan && <PlanDialog restaurant={selectedRestaurant} token={session.token} onClose={() => setShowPlan(false)} onSaved={() => { setShowPlan(false); void loadSupport(); }} />}
    {selectedRestaurant && showStudent && <UserDialog title="Registrar estudiante" role="student" restaurant={selectedRestaurant} plans={support?.plans || []} token={session.token} onClose={() => setShowStudent(false)} onSaved={() => { setShowStudent(false); void loadSupport(); }} />}
    {selectedRestaurant && showAdmin && <UserDialog title="Crear administrador" role="admin" restaurant={selectedRestaurant} plans={[]} token={session.token} onClose={() => setShowAdmin(false)} onSaved={() => { setShowAdmin(false); void loadSupport(); }} />}
  </div>;
}

function Login({ onAuthenticated }: { onAuthenticated: (session: Session) => void }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [submitting, setSubmitting] = useState(false); const [error, setError] = useState<string | null>(null);
  const submit = async (event: FormEvent) => { event.preventDefault(); setSubmitting(true); setError(null); try { const result = await request<{ accessToken: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); if (result.user.role !== 'superadmin') throw { message: 'Esta cuenta no tiene acceso al Control Center.', status: 403 } satisfies ApiError; const next = { token: result.accessToken, user: result.user }; sessionStorage.setItem(storageKey, JSON.stringify(next)); onAuthenticated(next); } catch (caught) { setError((caught as ApiError).message); } finally { setSubmitting(false); } };
  return <main className="login-page"><section className="login-copy"><div className="brand"><span className="brand-mark">MT</span><span>MealTrack</span></div><p className="eyebrow">Control Center</p><h1>Una vista clara de cada operación.</h1><p>Gestiona restaurantes, sus planes y las personas que los operan desde un solo lugar.</p><div className="login-signal"><span></span> API protegida y operación auditada</div></section><section className="login-card"><p className="eyebrow">Acceso restringido</p><h2>Iniciar sesión</h2><p className="muted">Solo cuentas Superadmin.</p><form onSubmit={submit}><label>Correo *<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Contraseña *<input required type="password" minLength={8} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button primary full" disabled={submitting}>{submitting ? 'Validando acceso…' : 'Entrar al panel'}</button></form></section></main>;
}

function Metric({ label, value, tone = 'default' }: { label: string; value: number; tone?: 'default' | 'success' | 'muted' }) { return <article className={`metric ${tone}`}><span>{label}</span><strong>{value}</strong></article>; }
function Notice({ message, action }: { message: string; action: () => void }) { return <div className="notice error" role="alert">{message}<button onClick={action}>Reintentar</button></div>; }
function RestaurantTable({ restaurants, onManage, onEdit }: { restaurants: Restaurant[]; onManage: (restaurant: Restaurant) => void; onEdit: (restaurant: Restaurant) => void }) { return <div className="table-wrap"><table><thead><tr><th>Restaurante</th><th>Dirección</th><th>Estado</th><th>Creado</th><th><span className="sr-only">Acciones</span></th></tr></thead><tbody>{restaurants.map((restaurant) => <tr key={restaurant.id}><td><strong>{restaurant.name}</strong><small>{restaurant.id}</small></td><td>{restaurant.address || 'Sin dirección registrada'}</td><td><span className={`status ${restaurant.isActive ? 'active' : 'inactive'}`}>{restaurant.isActive ? 'Operativo' : 'Suspendido'}</span></td><td>{dateFormatter.format(new Date(restaurant.createdAt))}</td><td className="action-cell"><button className="button secondary small" onClick={() => onManage(restaurant)}>Gestionar</button><button className="button ghost small" onClick={() => onEdit(restaurant)}>Editar</button></td></tr>)}</tbody></table></div>; }

function SupportPanel({ title, description, count, action, onAction, children }: { title: string; description: string; count: number; action?: string; onAction?: () => void; children: React.ReactNode }) { return <article className="support-panel"><header><div><p className="eyebrow">{count} registrados</p><h3>{title}</h3><p>{description}</p></div>{action && onAction && <button className="button secondary small" onClick={onAction}>{action}</button>}</header>{children}</article>; }
function PlanList({ plans }: { plans: MealPlan[] }) { return plans.length ? <ul className="compact-list">{plans.map((plan) => <li key={plan.id}><div><strong>{plan.name}</strong><span>{plan.durationDays} días · {currencyFormatter.format(plan.price)}</span></div><span className={`status ${plan.isActive ? 'active' : 'inactive'}`}>{plan.isActive ? 'Activo' : 'Inactivo'}</span></li>)}</ul> : <p className="empty-copy">No hay planes creados. Crea el primero antes de registrar estudiantes con pensión.</p>; }
function UserList({ users, empty }: { users: User[]; empty: string }) { return users.length ? <ul className="compact-list">{users.map((user) => <li key={user.id}><div><strong>{user.fullName}</strong><span>{user.email}{user.mustChangePassword ? ' · acceso temporal pendiente' : ''}</span></div><span className={`status ${user.isActive ? 'active' : 'inactive'}`}>{user.isActive ? 'Activo' : 'Suspendido'}</span></li>)}</ul> : <p className="empty-copy">{empty}</p>; }
function SubscriptionList({ subscriptions }: { subscriptions: Subscription[] }) { return subscriptions.length ? <ul className="compact-list">{subscriptions.slice(0, 6).map((subscription) => <li key={subscription.id}><div><strong>{subscription.student.fullName}</strong><span>{subscription.mealPlan.name} · saldo: {subscription.remainingDays}/{subscription.contractedDays} días</span></div><span className="status active">{subscription.status}</span></li>)}</ul> : <p className="empty-copy">No hay suscripciones activas ni históricas en este restaurante.</p>; }

function RestaurantDialog({ title, action, token, restaurant, onClose, onSaved }: { title: string; action: string; token: string; restaurant?: Restaurant; onClose: () => void; onSaved: (restaurant: Restaurant) => void }) {
  const [name, setName] = useState(restaurant?.name || ''); const [address, setAddress] = useState(restaurant?.address || ''); const [isActive, setIsActive] = useState(restaurant?.isActive ?? true); const [saving, setSaving] = useState(false); const [error, setError] = useState<string | null>(null);
  const save = async (event: FormEvent) => { event.preventDefault(); setSaving(true); setError(null); try { const payload = restaurant ? { name, address: address || undefined, isActive } : { name, address: address || undefined }; const saved = await request<Restaurant>(restaurant ? `/restaurants/${restaurant.id}` : '/restaurants', { method: restaurant ? 'PATCH' : 'POST', body: JSON.stringify(payload) }, token); onSaved(saved); } catch (caught) { setError((caught as ApiError).message); } finally { setSaving(false); } };
  return <Modal title={title} eyebrow="Directorio operativo" onClose={onClose}><form onSubmit={save}><label>Nombre del restaurante *<input required maxLength={200} value={name} onChange={(event) => setName(event.target.value)} /></label><label>Dirección <span className="optional">opcional</span><input maxLength={300} value={address} onChange={(event) => setAddress(event.target.value)} /></label>{restaurant && <label className="toggle"><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} /><span>Restaurante operativo</span></label>}{error && <p className="form-error" role="alert">{error}</p>}<Actions onClose={onClose} saving={saving} action={action} /></form></Modal>;
}

function PlanDialog({ restaurant, token, onClose, onSaved }: { restaurant: Restaurant; token: string; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(''); const [price, setPrice] = useState(''); const [durationDays, setDurationDays] = useState('30'); const [description, setDescription] = useState(''); const [saving, setSaving] = useState(false); const [error, setError] = useState<string | null>(null);
  const save = async (event: FormEvent) => { event.preventDefault(); setSaving(true); setError(null); try { await request<MealPlan>('/meal-plans', { method: 'POST', body: JSON.stringify({ restaurantId: restaurant.id, name, price: Number(price), durationDays: Number(durationDays), description: description || undefined }) }, token); onSaved(); } catch (caught) { setError((caught as ApiError).message); } finally { setSaving(false); } };
  return <Modal title="Crear plan de pensión" eyebrow={restaurant.name} onClose={onClose}><form onSubmit={save}><label>Nombre del plan *<input required maxLength={200} placeholder="Ej. Almuerzo mensual" value={name} onChange={(event) => setName(event.target.value)} /></label><div className="two-fields"><label>Precio en S/ *<input required type="number" min="0.01" step="0.01" inputMode="decimal" value={price} onChange={(event) => setPrice(event.target.value)} /></label><label>Días incluidos *<input required type="number" min="1" step="1" inputMode="numeric" value={durationDays} onChange={(event) => setDurationDays(event.target.value)} /></label></div><label>Descripción <span className="optional">opcional</span><input maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} /></label>{error && <p className="form-error" role="alert">{error}</p>}<Actions onClose={onClose} saving={saving} action="Crear plan" /></form></Modal>;
}

function UserDialog({ title, role, restaurant, plans, token, onClose, onSaved }: { title: string; role: 'student' | 'admin'; restaurant: Restaurant; plans: MealPlan[]; token: string; onClose: () => void; onSaved: () => void }) {
  const [fullName, setFullName] = useState(''); const [email, setEmail] = useState(''); const [phone, setPhone] = useState(''); const [planId, setPlanId] = useState(''); const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null); const [saving, setSaving] = useState(false); const [error, setError] = useState<string | null>(null);
  const save = async (event: FormEvent) => { event.preventDefault(); setSaving(true); setError(null); try { const created = await request<{ temporaryPassword?: string }>('/users', { method: 'POST', body: JSON.stringify({ fullName, email, phone: phone || undefined, role, restaurantId: restaurant.id, ...(role === 'student' && planId ? { planId } : {}) }) }, token); setTemporaryPassword(created.temporaryPassword || null); } catch (caught) { setError((caught as ApiError).message); } finally { setSaving(false); } };
  if (temporaryPassword) return <Modal title="Guarda este acceso ahora" eyebrow={`${role === 'admin' ? 'Administrador' : 'Estudiante'} creado`} onClose={onSaved}><p className="muted">Esta contraseña temporal se muestra una sola vez. La persona deberá cambiarla al iniciar sesión.</p><div className="credential"><span>Contraseña temporal</span><code>{temporaryPassword}</code></div><div className="modal-actions"><button className="button primary" onClick={onSaved}>Entendido, ya la guardé</button></div></Modal>;
  return <Modal title={title} eyebrow={restaurant.name} onClose={onClose}><p className="muted">{role === 'student' ? 'Puedes asignarle un plan ahora o registrarlo sin una pensión activa.' : 'Se generará una contraseña temporal y se exigirá cambiarla en el primer inicio de sesión.'}</p><form onSubmit={save}><label>Nombre completo *<input required maxLength={100} autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} /></label><label>Correo *<input required type="email" maxLength={200} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Teléfono <span className="optional">opcional</span><input type="tel" maxLength={30} autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} /></label>{role === 'student' && <label>Plan inicial <span className="optional">opcional</span><select value={planId} onChange={(event) => setPlanId(event.target.value)}><option value="">Sin plan por ahora</option>{plans.filter((plan) => plan.isActive).map((plan) => <option key={plan.id} value={plan.id}>{plan.name} · {plan.durationDays} días</option>)}</select></label>}{error && <p className="form-error" role="alert">{error}</p>}<Actions onClose={onClose} saving={saving} action={role === 'student' ? 'Registrar estudiante' : 'Crear administrador'} /></form></Modal>;
}

function Modal({ title, eyebrow, onClose, children }: { title: string; eyebrow: string; onClose: () => void; children: React.ReactNode }) { return <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div className="modal-head"><div><p className="eyebrow">{eyebrow}</p><h2 id="dialog-title">{title}</h2></div><button className="close" aria-label="Cerrar" onClick={onClose}>×</button></div>{children}</section></div>; }
function Actions({ onClose, saving, action }: { onClose: () => void; saving: boolean; action: string }) { return <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Cancelar</button><button className="button primary" disabled={saving}>{saving ? 'Guardando…' : action}</button></div>; }
function initials(name: string): string { return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase(); }

createRoot(document.getElementById('root')!).render(<App />);
