import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, RefreshCw, Search, ShieldCheck, UserRound, UserRoundX, X } from 'lucide-react'
import { api } from '../services/api'
import useAuth from '../hooks/useAuth'

const roleLabels = { school_admin: 'School administrator', teacher: 'Teacher', student: 'Student', parent: 'Parent / guardian', accountant: 'Accountant' }
const blank = { username: '', email: '', first_name: '', last_name: '', role: 'teacher', password: '' }

export default function UsersRolesPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(null)
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { const { data } = await api.get('/accounts/users/'); setUsers(Array.isArray(data) ? data : data.results || []) }
    catch (e) { setError(e.response?.data?.detail || 'Could not load school users.') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])
  const filtered = users.filter((item) => `${item.first_name} ${item.last_name} ${item.email} ${item.username} ${roleLabels[item.role]}`.toLowerCase().includes(query.toLowerCase()))
  async function save(event) {
    event.preventDefault(); setSaving(true); setError('')
    const body = { ...form }
    if (!body.password) delete body.password
    try {
      if (form.id) await api.patch(`/accounts/users/${form.id}/`, body)
      else await api.post('/accounts/users/', body)
      setForm(null); await load()
    } catch (e) { setError(JSON.stringify(e.response?.data || e.message)) }
    finally { setSaving(false) }
  }
  async function toggleActive(item) {
    try { await api.patch(`/accounts/users/${item.id}/`, { is_active: !item.is_active }); await load() }
    catch (e) { setError(e.response?.data?.detail || 'Could not update this account.') }
  }
  return <section className="module-page users-page">
    <div className="page-heading"><div><div className="eyebrow page-eyebrow">SCHOOL WORKSPACE</div><h1>Users &amp; roles</h1><p>Create staff and family accounts, assign roles, and manage access to school modules.</p></div><div className="page-actions"><button className="icon-button" title="Refresh" onClick={load}><RefreshCw size={17}/></button><button className="primary-button" onClick={() => setForm({ ...blank })}><Plus size={17}/> Add user</button></div></div>
    <div className="role-summary">{Object.entries(roleLabels).map(([role, title]) => <div className="role-summary-card" key={role}><ShieldCheck size={16}/><span>{title}</span><strong>{users.filter((item) => item.role === role).length}</strong></div>)}</div>
    {error && <div className="module-error">{error}<button onClick={() => setError('')}><X size={15}/></button></div>}
    <div className="table-card"><div className="table-toolbar"><strong>{filtered.length} {filtered.length === 1 ? 'user' : 'users'}</strong><label className="search-box"><Search size={16}/><input placeholder="Search by name, email, or role" value={query} onChange={(e) => setQuery(e.target.value)}/></label></div>
      {loading ? <div className="empty-state">Loading users…</div> : filtered.length === 0 ? <div className="empty-state"><UserRound size={25}/><strong>No users found</strong><span>Add a school account or change your search.</span></div> : <div className="table-scroll"><table><thead><tr><th>User</th><th>Role</th><th>Status</th><th/></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><div className="managed-user"><span className="managed-avatar">{(item.first_name || item.email || 'U')[0].toUpperCase()}</span><span><strong>{[item.first_name, item.last_name].filter(Boolean).join(' ') || item.username}</strong><small>{item.email} · @{item.username}</small></span></div></td><td><span className={`role-pill role-${item.role}`}>{roleLabels[item.role] || item.role}</span></td><td><span className={`status-pill ${item.is_active ? 'is-active' : 'is-inactive'}`}>{item.is_active ? 'Active' : 'Inactive'}</span></td><td className="row-actions"><button className="small-action" onClick={() => setForm({ id: item.id, username: item.username, email: item.email, first_name: item.first_name || '', last_name: item.last_name || '', role: item.role, password: '', is_active: item.is_active })}><Pencil size={14}/> Edit</button>{item.id !== user?.id && <button className="small-action" onClick={() => toggleActive(item)} title={item.is_active ? 'Deactivate account' : 'Reactivate account'}><UserRoundX size={14}/>{item.is_active ? 'Deactivate' : 'Reactivate'}</button>}</td></tr>)}</tbody></table></div>}
    </div>
    <div className="role-access-note"><ShieldCheck size={17}/><p><strong>Role access is applied automatically.</strong> Teachers work with assigned classes; students and parents only see linked school records; accountants can manage fees and view reports.</p></div>
    {form && <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setForm(null)}><form className="record-modal" onSubmit={save}><div className="modal-heading"><div><span className="eyebrow page-eyebrow">{form.id ? 'UPDATE ACCOUNT' : 'NEW ACCOUNT'}</span><h2>{form.id ? 'Edit user' : 'Add a school user'}</h2></div><button type="button" className="icon-button" onClick={() => setForm(null)}><X size={18}/></button></div><div className="modal-fields">{[['first_name','First name','text'],['last_name','Last name','text'],['username','Username','text'],['email','Email address','email']].map(([key,title,type]) => <label className="modal-field" key={key}><span>{title}</span><input required value={form[key] || ''} type={type} onChange={(e) => setForm({ ...form, [key]: e.target.value })}/></label>)}<label className="modal-field"><span>Role</span><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>{Object.entries(roleLabels).map(([value, title]) => <option key={value} value={value}>{title}</option>)}</select></label><label className="modal-field"><span>{form.id ? 'New password (optional)' : 'Temporary password'}</span><input required={!form.id} minLength={10} type="password" autoComplete="new-password" value={form.password || ''} onChange={(e) => setForm({ ...form, password: e.target.value })}/></label></div><div className="modal-footer"><button type="button" className="cancel-button" onClick={() => setForm(null)}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving ? 'Saving…' : form.id ? 'Save changes' : 'Create account'}</button></div></form></div>}
  </section>
}
