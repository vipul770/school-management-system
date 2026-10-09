import { useCallback, useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Building2, Check, CreditCard, Pencil, Plus, RefreshCw, Search, ShieldCheck, Users, X } from 'lucide-react'
import { api } from '../services/api'

const sections = [
  { key: 'overview', title: 'Overview', path: '/dashboard' },
  { key: 'schools', title: 'Schools', path: '/platform/schools' },
  { key: 'users', title: 'All users', path: '/platform/users' },
  { key: 'plans', title: 'Subscription plans', path: '/platform/plans' },
  { key: 'audit', title: 'Audit activity', path: '/platform/audit' },
]
const roles = ['school_admin', 'teacher', 'student', 'parent', 'accountant', 'super_admin']
const blankSchool = { name: '', organization_id: '', email: '', admin_username: '', admin_email: '', admin_password: '' }
const blankUser = { username: '', email: '', first_name: '', last_name: '', role: 'school_admin', school: '', password: '', is_active: true }
const blankPlan = { name: '', price_monthly: '0', max_students: '200', max_teachers: '20', stripe_price_id: '', features: 'students, teachers, attendance, classes', is_active: true }
const asList = (data) => Array.isArray(data) ? data : data?.results || (data ? [data] : [])
const format = (value) => value == null || value === '' ? '—' : String(value)
const roleName = (role) => roles.includes(role) ? role.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : format(role)

export default function PlatformAdminPage({ section = 'overview' }) {
  const [data, setData] = useState({ summary: {}, schools: [], users: [], subscriptions: [], plans: [], audit: { results: [], count: 0, total_pages: 1 } })
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [auditFilters, setAuditFilters] = useState({ action: '', model: '', school_id: '', date_from: '', date_to: '' })
  const [auditPage, setAuditPage] = useState(1)
  const [subSchool, setSubSchool] = useState('')
  const active = sections.find((item) => item.key === section) || sections[0]

  const load = useCallback(async () => {
    setLoading(true); setError('')
    const auditParams = new URLSearchParams({ page: String(auditPage), page_size: '25' })
    if (query && section === 'audit') auditParams.set('search', query)
    Object.entries(auditFilters).forEach(([key, value]) => { if (value) auditParams.set(key, value) })
    const requests = [
      ['summary', '/platform/summary/'], ['schools', '/schools/'], ['users', '/accounts/users/'],
      ['subscriptions', '/subscriptions/'], ['plans', '/subscription-plans/'], ['audit', `/audit-logs/?${auditParams}`],
    ]
    const values = await Promise.all(requests.map(async ([key, url]) => {
      try { const response = await api.get(url); return [key, response.data] }
      catch (e) { return [key, key === 'audit' ? { results: [], count: 0, total_pages: 1 } : key === 'summary' ? {} : [], e.response?.data?.detail || `Could not load ${key}.`] }
    }))
    const next = {}; const problems = []
    for (const [key, value, issue] of values) { next[key] = value; if (issue) problems.push(issue) }
    next.schools = asList(next.schools); next.users = asList(next.users); next.subscriptions = asList(next.subscriptions); next.plans = asList(next.plans)
    if (Array.isArray(next.audit)) next.audit = { results: next.audit, count: next.audit.length, total_pages: 1 }
    setData(next); setError(problems.join(' ')); setLoading(false)
  }, [auditFilters, auditPage, query, section])
  useEffect(() => { load() }, [load])

  const subscriptionsForSchool = useMemo(() => {
    const grouped = {}
    for (const item of data.subscriptions) {
      const plan = data.plans.find((candidate) => candidate.id === item.plan)
      ;(grouped[item.school] ||= []).push({ ...item, plan_name: item.plan_name || plan?.name || 'Subscription' })
    }
    return grouped
  }, [data.plans, data.subscriptions])
  const selectedSchool = data.schools.find((item) => item.id === subSchool) || data.schools[0]
  const schoolSubscriptions = selectedSchool ? subscriptionsForSchool[selectedSchool.id] || [] : []
  const filtered = (items) => items.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase()))

  function openModal(type, item = null) {
    setModal(type)
    if (type === 'school') setForm(item ? { ...item } : { ...blankSchool })
    if (type === 'user') setForm(item ? { ...item, password: '' } : { ...blankUser, school: data.schools[0]?.id || '' })
    if (type === 'plan') setForm(item ? { ...item, price_monthly: String(item.price_monthly), max_students: String(item.max_students), max_teachers: String(item.max_teachers), features: Array.isArray(item.features) ? item.features.join(', ') : '' } : { ...blankPlan })
    if (type === 'subscription') setForm(item ? { ...item, school: item.school, plan: item.plan, start_date: item.start_date || '', end_date: item.end_date || '' } : { school: selectedSchool?.id || '', plan: data.plans.find((plan) => plan.is_active)?.id || '', status: 'active', start_date: new Date().toISOString().slice(0, 10), end_date: '' })
  }
  async function save(event) {
    event.preventDefault(); setSaving(true); setError('')
    try {
      if (modal === 'school') {
        const body = { ...form }; delete body.id; delete body.created_at; delete body.updated_at
        await api[form.id ? 'patch' : 'post'](form.id ? `/schools/${form.id}/` : '/schools/', body)
      } else if (modal === 'user') {
        const body = { ...form }; delete body.school_name; delete body.organization_id; delete body.id
        if (!body.password) delete body.password
        await api[form.id ? 'patch' : 'post'](form.id ? `/accounts/users/${form.id}/` : '/accounts/users/', body)
      } else if (modal === 'plan') {
        const body = { ...form, price_monthly: Number(form.price_monthly), max_students: Number(form.max_students), max_teachers: Number(form.max_teachers), features: String(form.features).split(',').map((value) => value.trim()).filter(Boolean) }
        delete body.id; delete body.created_at; delete body.updated_at
        await api[form.id ? 'patch' : 'post'](form.id ? `/subscription-plans/${form.id}/` : '/subscription-plans/', body)
      } else if (modal === 'subscription') {
        const body = { school: form.school, plan: form.plan, status: form.status, start_date: form.start_date, end_date: form.end_date || null }
        await api[form.id ? 'patch' : 'post'](form.id ? `/subscriptions/${form.id}/` : '/subscriptions/', body)
      }
      setModal(null); await load()
    } catch (e) { setError(JSON.stringify(e.response?.data || e.message)) }
    finally { setSaving(false) }
  }
  async function toggle(url, item, field) {
    try { await api.patch(`${url}${item.id}/`, { [field]: !item[field] }); await load() }
    catch (e) { setError(JSON.stringify(e.response?.data || e.message)) }
  }

  const title = section === 'overview' ? 'Platform overview' : active.title
  return <section className="module-page platform-page">
    <div className="page-heading"><div><div className="eyebrow page-eyebrow">PLATFORM ADMINISTRATION</div><h1>{title}</h1><p>Manage schools, platform accounts, subscriptions, and system activity.</p></div><div className="page-actions"><button className="icon-button" title="Refresh data" onClick={load}><RefreshCw size={17}/></button>{section === 'schools' && <button className="primary-button" onClick={() => openModal('school')}><Plus size={16}/> Add school</button>}{section === 'users' && <button className="primary-button" onClick={() => openModal('user')}><Plus size={16}/> Add user</button>}{section === 'plans' && <button className="primary-button" onClick={() => openModal('plan')}><Plus size={16}/> Create plan</button>}</div></div>
    <nav className="platform-tabs">{sections.map((item) => <NavLink key={item.key} to={item.path} end={item.key === 'overview'} className={({ isActive }) => isActive ? 'active' : ''}>{item.title}</NavLink>)}</nav>
    {error && <div className="module-error">{error}<button onClick={() => setError('')}><X size={15}/></button></div>}
    {section === 'overview' && <Overview data={data} loading={loading} subscriptions={subscriptionsForSchool}/>}
    {section === 'schools' && <SchoolsTable rows={filtered(data.schools)} subscriptions={subscriptionsForSchool} loading={loading} onEdit={(row) => openModal('school', row)} onToggle={(row) => toggle('/schools/', row, 'is_active')}/>}
    {section === 'users' && <UsersTable rows={filtered(data.users)} schools={data.schools} query={query} setQuery={setQuery} loading={loading} onEdit={(row) => openModal('user', row)} onToggle={(row) => toggle('/accounts/users/', row, 'is_active')}/>}
    {section === 'plans' && <div className="platform-stack"><PlansTable rows={filtered(data.plans)} loading={loading} onEdit={(row) => openModal('plan', row)} onToggle={(row) => toggle('/subscription-plans/', row, 'is_active')}/><section className="platform-panel"><div className="platform-panel-heading"><div><h2>School subscriptions</h2><p>Assign plans and update billing status for each organization.</p></div><label className="platform-school-select">School<select value={selectedSchool?.id || ''} onChange={(e) => setSubSchool(e.target.value)}>{data.schools.map((row) => <option key={row.id} value={row.id}>{row.name} · {row.organization_id}</option>)}</select></label><button className="cancel-button" disabled={!selectedSchool} onClick={() => openModal('subscription')}><Plus size={15}/> Change plan</button></div><SubscriptionsTable rows={schoolSubscriptions} loading={loading} onEdit={(row) => openModal('subscription', row)}/></section></div>}
    {section === 'audit' && <AuditTable rows={data.audit.results || []} total={data.audit.count || 0} page={auditPage} pages={data.audit.total_pages || 1} filters={auditFilters} setFilters={(value) => {setAuditFilters(value);setAuditPage(1)}} schools={data.schools} query={query} setQuery={(value) => {setQuery(value);setAuditPage(1)}} loading={loading} onPage={setAuditPage}/>}
    {modal && <PlatformModal type={modal} form={form} setForm={setForm} schools={data.schools} plans={data.plans} onClose={() => setModal(null)} onSubmit={save} saving={saving}/>}
  </section>
}

function Overview({ data, loading, subscriptions }) {
  const summary = data.summary || {}
  const cards = [
    ['Schools', summary.schools?.total ?? data.schools.length, Building2], ['Active subscriptions', summary.subscriptions?.active ?? data.subscriptions.filter((item) => ['active','trialing'].includes(item.status)).length, CreditCard],
    ['User accounts', summary.users?.total ?? data.users.length, Users], ['Monthly recurring revenue', `$${summary.subscriptions?.monthly_revenue ?? '0'}`, ShieldCheck],
  ]
  return <><div className="platform-metrics">{cards.map(([label, value, Icon]) => <article key={label}><span><Icon size={17}/>{label}</span><strong>{value}</strong></article>)}</div><div className="platform-overview-grid"><section className="platform-panel"><div className="platform-panel-heading"><div><h2>Latest schools</h2><p>{summary.schools?.active ?? data.schools.filter((row) => row.is_active).length} active · {summary.schools?.inactive ?? data.schools.filter((row) => !row.is_active).length} inactive</p></div><NavLink to="/platform/schools">All schools →</NavLink></div><SchoolsTable rows={(summary.recent_schools || data.schools).slice(0, 6)} subscriptions={subscriptions} loading={loading} compact/></section><section className="platform-panel"><div className="platform-panel-heading"><div><h2>Platform snapshot</h2><p>Current accounts and billing health.</p></div></div><div className="platform-breakdown"><div><span>Students</span><strong>{summary.students ?? 0}</strong></div><div><span>Teachers</span><strong>{summary.teachers ?? 0}</strong></div><div><span>Plans available</span><strong>{summary.plans?.active ?? data.plans.filter((row) => row.is_active).length}</strong></div><div><span>Past due subscriptions</span><strong className="platform-alert-number">{summary.subscriptions?.past_due ?? data.subscriptions.filter((row) => row.status === 'past_due').length}</strong></div></div><NavLink className="platform-inline-link" to="/platform/plans">Review billing and plans →</NavLink></section></div></>
}

function SchoolsTable({ rows, subscriptions, loading, onEdit, onToggle, compact = false }) {
  return <div className="table-card"><div className="table-toolbar"><strong>{compact ? 'School directory' : `Schools · ${rows.length}`}</strong></div>{loading ? <div className="empty-state">Loading schools…</div> : rows.length === 0 ? <div className="empty-state">No schools registered.</div> : <div className="table-scroll"><table><thead><tr><th>School</th><th>Organization ID</th><th>Administrator contact</th><th>Subscription</th><th>Status</th>{onEdit && <th/>}</tr></thead><tbody>{rows.map((row) => {const sub=(subscriptions[row.id]||[])[0];return <tr key={row.id}><td><strong>{row.name}</strong></td><td>{row.organization_id}</td><td>{row.email || '—'}</td><td>{sub ? <><span>{sub.plan_name}</span><small className="platform-subscription">{sub.status}{sub.end_date ? ` · until ${sub.end_date}` : ''}</small></> : 'No plan'}</td><td><Status active={row.is_active}/></td>{onEdit && <td className="row-actions"><button className="small-action" onClick={() => onEdit(row)}><Pencil size={13}/> Edit</button><button className="small-action" onClick={() => onToggle(row)}>{row.is_active ? 'Deactivate' : 'Activate'}</button></td>}</tr>})}</tbody></table></div>}</div>
}

function UsersTable({ rows, schools, query, setQuery, loading, onEdit, onToggle }) {
  return <div className="table-card"><Toolbar title={`All users · ${rows.length}`} query={query} setQuery={setQuery}/>{loading ? <div className="empty-state">Loading users…</div> : rows.length === 0 ? <div className="empty-state">No users match this search.</div> : <div className="table-scroll"><table><thead><tr><th>Name / email</th><th>Role</th><th>School</th><th>Status</th><th/></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td><strong>{[row.first_name,row.last_name].filter(Boolean).join(' ') || row.username}</strong><small className="platform-subscription">{row.email} · @{row.username}</small></td><td><span className={`role-pill role-${row.role}`}>{roleName(row.role)}</span></td><td>{row.school_name || schools.find((school) => school.id === row.school)?.name || '—'}<small className="platform-subscription">{row.organization_id || schools.find((school) => school.id === row.school)?.organization_id || ''}</small></td><td><Status active={row.is_active}/></td><td className="row-actions"><button className="small-action" onClick={() => onEdit(row)}><Pencil size={13}/> Edit</button><button className="small-action" onClick={() => onToggle(row)}>{row.is_active ? 'Deactivate' : 'Activate'}</button></td></tr>)}</tbody></table></div>}</div>
}

function PlansTable({ rows, loading, onEdit, onToggle }) {
  return <div className="table-card"><div className="table-toolbar"><strong>Available plans · {rows.length}</strong></div>{loading ? <div className="empty-state">Loading plans…</div> : rows.length === 0 ? <div className="empty-state">No plans configured yet.</div> : <div className="table-scroll"><table><thead><tr><th>Plan</th><th>Monthly price</th><th>Student limit</th><th>Teacher limit</th><th>Features</th><th>Status</th><th/></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td><strong>{row.name}</strong></td><td>${row.price_monthly}</td><td>{row.max_students.toLocaleString()}</td><td>{row.max_teachers.toLocaleString()}</td><td className="platform-features">{Array.isArray(row.features) ? row.features.join(', ') : ''}{row.stripe_price_id && <small className="platform-subscription">Stripe price configured</small>}</td><td><Status active={row.is_active}/></td><td className="row-actions"><button className="small-action" onClick={() => onEdit(row)}><Pencil size={13}/> Edit</button><button className="small-action" onClick={() => onToggle(row)}>{row.is_active ? 'Deactivate' : 'Activate'}</button></td></tr>)}</tbody></table></div>}</div>
}

function SubscriptionsTable({ rows, loading, onEdit }) {
  return <div className="table-scroll"><table><thead><tr><th>Plan</th><th>Status</th><th>Start date</th><th>End date</th><th/></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td>{row.plan_name}</td><td><span className={`subscription-status subscription-${row.status}`}>{row.status}</span></td><td>{format(row.start_date)}</td><td>{format(row.end_date)}</td><td className="row-actions"><button className="small-action" onClick={() => onEdit(row)}><Pencil size={13}/> Edit subscription</button></td></tr>)}{!loading && rows.length === 0 && <tr><td colSpan="5" className="subscription-empty">This school has no subscription record. Create one by selecting an active plan.</td></tr>}</tbody></table></div>
}

function AuditTable({ rows, total, page, pages, filters, setFilters, schools, query, setQuery, loading, onPage }) {
  return <div className="platform-panel"><div className="audit-filters"><label className="search-box"><Search size={15}/><input placeholder="Search actor, school, or event" value={query} onChange={(e) => setQuery(e.target.value)}/></label><select value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })}><option value="">All actions</option>{['CREATE','UPDATE','DELETE'].map((value) => <option key={value}>{value}</option>)}</select><input placeholder="Record type" value={filters.model} onChange={(e) => setFilters({ ...filters, model: e.target.value })}/><select value={filters.school_id} onChange={(e) => setFilters({ ...filters, school_id: e.target.value })}><option value="">All schools</option>{schools.map((school) => <option value={school.id} key={school.id}>{school.name}</option>)}</select><input type="date" value={filters.date_from} onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}/><input type="date" value={filters.date_to} onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}/></div><div className="table-toolbar"><strong>Audit activity · {total} events</strong></div>{loading ? <div className="empty-state">Loading activity…</div> : rows.length === 0 ? <div className="empty-state">No activity matches those filters.</div> : <div className="table-scroll"><table><thead><tr><th>Date / time</th><th>Action</th><th>Event</th><th>School</th><th>Actor</th><th>Record ID</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td>{new Date(row.created_at).toLocaleString()}</td><td><span className={`audit-action audit-${row.action?.toLowerCase()}`}>{row.action}</span></td><td>{row.model}</td><td>{row.school_name || row.organization_id || 'Platform'}</td><td>{row.actor_email || row.actor_id || 'System'}</td><td>{row.object_id}</td></tr>)}</tbody></table></div>}<div className="audit-pagination"><span>Page {page} of {Math.max(pages,1)}</span><div><button className="cancel-button" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button><button className="cancel-button" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</button></div></div></div>
}

function Toolbar({ title, query, setQuery }) { return <div className="table-toolbar"><strong>{title}</strong><label className="search-box"><Search size={15}/><input placeholder="Search users" value={query} onChange={(e) => setQuery(e.target.value)}/></label></div> }
function Status({ active }) { return <span className={`status-pill ${active ? 'is-active' : 'is-inactive'}`}>{active ? 'Active' : 'Inactive'}</span> }

function PlatformModal({ type, form, setForm, schools, plans, onClose, onSubmit, saving }) {
  const title = { school: form.id ? 'Edit school' : 'Register a school', user: form.id ? 'Edit user account' : 'Create user account', plan: form.id ? 'Edit subscription plan' : 'Create subscription plan', subscription: form.id ? 'Edit subscription' : 'Assign subscription plan' }[type]
  const field = (key, label, inputType = 'text', required = true, options = null) => <label className="modal-field" key={key}><span>{label}</span>{options ? <select required={required} value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })}><option value="">Choose…</option>{options.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select> : <input required={required} minLength={inputType === 'password' ? 10 : undefined} type={inputType} value={form[key] ?? ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })}/>}</label>
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><form className="record-modal" onSubmit={onSubmit}><div className="modal-heading"><div><span className="eyebrow page-eyebrow">PLATFORM ADMIN</span><h2>{title}</h2></div><button type="button" className="icon-button" onClick={onClose}><X size={18}/></button></div><div className="modal-fields">
    {type === 'school' && <>{field('name','School name')}{field('organization_id','Organization ID')}{field('email','School email','email',false)}{!form.id && <>{field('admin_username','First administrator username')}{field('admin_email','First administrator email','email')}{field('admin_password','Temporary password','password')}</>}{form.id && <label className="modal-field"><span>School status</span><select value={form.is_active ? 'true':'false'} onChange={(e) => setForm({ ...form, is_active:e.target.value==='true' })}><option value="true">Active</option><option value="false">Inactive</option></select></label>}</>}
    {type === 'user' && <>{field('first_name','First name','text',false)}{field('last_name','Last name','text',false)}{field('username','Username')}{field('email','Email','email')}{field('role','Role','text',true,roles.map((role) => ({ value:role,label:roleName(role) })))}{field('school','School','text',true,schools.map((school) => ({ value:school.id,label:`${school.name} (${school.organization_id})` })))}{field('password',form.id?'New password (leave blank to keep)':'Temporary password','password',!form.id)}{form.id && <label className="modal-field"><span>Account status</span><select value={form.is_active?'true':'false'} onChange={(e)=>setForm({...form,is_active:e.target.value==='true'})}><option value="true">Active</option><option value="false">Inactive</option></select></label>}</>}
    {type === 'plan' && <>{field('name','Plan name')}{field('price_monthly','Monthly price','number')}{field('max_students','Student limit','number')}{field('max_teachers','Teacher limit','number')}{field('stripe_price_id','Stripe price ID','text',false)}{field('features','Features (comma separated)')}{form.id && <label className="modal-field"><span>Plan status</span><select value={form.is_active?'true':'false'} onChange={(e)=>setForm({...form,is_active:e.target.value==='true'})}><option value="true">Active</option><option value="false">Inactive</option></select></label>}</>}
    {type === 'subscription' && <>{field('school','School','text',true,schools.map((school) => ({value:school.id,label:`${school.name} (${school.organization_id})`})))}{field('plan','Plan','text',true,plans.filter((plan)=>plan.is_active).map((plan)=>({value:plan.id,label:`${plan.name} · $${plan.price_monthly}/month`})))}{field('status','Status','text',true,['active','trialing','past_due','canceled','expired','suspended'].map((value)=>({value,label:value.replace('_',' ')})))}{field('start_date','Start date','date')}{field('end_date','End date','date',false)}</>}
  </div><div className="modal-footer"><button type="button" className="cancel-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={saving}>{saving?'Saving…':form.id?'Save changes':'Create'}</button></div></form></div>
}
