import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Search, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import { modules } from '../config/modules'
import { api } from '../services/api'
import useAuth from '../hooks/useAuth'

const label = (key) => key.replaceAll('_', ' ').replace(/\b\w/g, (x) => x.toUpperCase())
const display = (value) => value === null || value === undefined || value === '' ? '—' : typeof value === 'object' ? JSON.stringify(value) : String(value)

export default function ModulePage({ moduleKey }) {
  const config = modules[moduleKey]
  const {user}=useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [values, setValues] = useState({})
  const [schoolId, setSchoolId] = useState(null)
  const [attendanceSession, setAttendanceSession] = useState(null)
  const [attendanceRows, setAttendanceRows] = useState([])
  const [resourceIndex, setResourceIndex] = useState(0)
  const [parentAccounts, setParentAccounts] = useState([])
  const importInput = useRef(null)
  const resources = config.resources || [config]
  const spec = resources[Math.min(resourceIndex, resources.length - 1)]
  const userReadOnly = spec.readOnly || ['student','parent'].includes(user?.role)
  const canImport = user?.role === 'school_admin'

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const { data } = await api.get(spec.endpoint)
      const list = Array.isArray(data) ? data : data.results || [data]
      setRows(list)
      if (spec.isSchool && list[0]) setSchoolId(list[0].id)
    } catch (e) { setError(e.response?.data?.detail || `Could not load ${config.title.toLowerCase()}.`) }
    finally { setLoading(false) }
  }, [config.title, moduleKey, spec.endpoint, spec.isSchool])
  useEffect(() => { setResourceIndex(0) }, [moduleKey])
  useEffect(() => { if (moduleKey === 'students') api.get('/accounts/users/?role=parent&is_active=true').then(({data}) => setParentAccounts(Array.isArray(data) ? data : data.results || [])).catch(() => setParentAccounts([])) }, [moduleKey])
  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => rows.filter((row) => JSON.stringify(row).toLowerCase().includes(query.toLowerCase())), [rows, query])
  async function save(event) {
    event.preventDefault(); setSaving(true); setError('')
    try {
      const body = {}
      for (const [key, title, type] of spec.fields || []) {
        const value = values[key]
        if (value === undefined || value === '') continue
        body[key] = type === 'number' ? Number(value) : type === 'json' ? JSON.parse(value) : value
      }
      let payload = body
      if ((spec.fields||[]).some(([, , type])=>type==='file')) { payload = new FormData(); for(const [key,value] of Object.entries(body)) payload.append(key,value) }
      if (spec.isSchool) {
        if (!schoolId) throw new Error('No school is available for this account.')
        await api.patch(`/schools/${schoolId}/`, payload)
      } else await api.post(spec.endpoint, payload)
      setShowForm(false); setValues({}); await load()
    } catch (e) { setError(e.response?.data ? JSON.stringify(e.response.data) : e.message || 'Could not save this record.') }
    finally { setSaving(false) }
  }
  async function remove(row) {
    if (!window.confirm(`Remove this ${config.title.toLowerCase()} record?`)) return
    try { await api.delete(`${config.endpoint}${row.id}/`); await load() }
    catch (e) { setError(e.response?.data?.detail || 'Could not remove this record.') }
  }
  async function editSettings() { const row=rows[0]; if(!row){setError('No school is available for this account.');return} setSchoolId(row.id); setValues(Object.fromEntries((spec.fields||[]).map(([key])=>[key,row[key]??'']))); setShowForm(true) }
  async function openAttendance(row) { setAttendanceSession(row); try { const {data}=await api.get(`/attendance/sessions/${row.id}/students/`); setAttendanceRows(data.map((item)=>({...item,status:item.status||'present'}))) } catch(e) { setError(e.response?.data?.detail||'Could not load the class roster.') } }
  async function submitAttendance() { try { await api.post(`/attendance/sessions/${attendanceSession.id}/submit/`,{records:attendanceRows.map(({student_id,status,remarks})=>({student_id,status,remarks}))}); setAttendanceSession(null); await load() } catch(e) { setError(JSON.stringify(e.response?.data||e.message)) } }
  async function importCsv(file) { if(!file)return; const form=new FormData();form.append('file',file);try{const {data}=await api.post('/students/bulk-import/',form);setError(`Import ${data.status}: ${data.status==='completed'?`${data.result?.created||0} students added; ${data.result?.skipped||0} duplicates skipped.`:`task ${data.task_id||''}`}`);await load()}catch(e){setError(JSON.stringify(e.response?.data||e.message))} }
  function downloadStudentTemplate() { const header='admission_number,roll_number,first_name,last_name,date_of_birth,email,guardian_name,guardian_phone,blood_group,parent_email'; const blob=new Blob([`${header}\r\n`],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='student-import-template.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000) }
  async function sendReminders() { try{const {data}=await api.post('/fees/send-reminders/');setError(`Reminder job ${data.status}.`);await load()}catch(e){setError(JSON.stringify(e.response?.data||e.message))} }
  async function choosePlan(plan) { try{const {data}=await api.post('/billing/checkout/',{plan:plan.id});window.location.assign(data.checkout_url)}catch(e){setError(e.response?.data?.detail||'Unable to start billing checkout.')} }

  return <section className="module-page"><div className="page-heading"><div><div className="eyebrow page-eyebrow">SCHOOL WORKSPACE</div><h1>{config.title}</h1><p>{config.description}</p></div><div className="page-actions"><button className="icon-button" title="Refresh" onClick={load}><RefreshCw size={17}/></button>{moduleKey==='students'&&resourceIndex===0&&canImport&&<><input ref={importInput} type="file" accept=".csv,text/csv" hidden onChange={(e)=>{importCsv(e.target.files?.[0]);e.target.value=''}}/><button className="cancel-button" onClick={downloadStudentTemplate}>Download CSV template</button><button className="cancel-button" onClick={()=>importInput.current?.click()}>Import CSV</button></>}{moduleKey==='fees'&&resourceIndex===4&&user?.role==='school_admin'&&<button className="cancel-button" onClick={sendReminders}>Send reminders</button>}{spec.isSchool ? <button className="primary-button" onClick={editSettings}>Edit school</button> : !userReadOnly && <button className="primary-button" onClick={()=>{setValues({});setShowForm(true)}}><Plus size={17}/> Add record</button>}</div></div>
    {resources.length>1&&<div className="module-tabs">{resources.map((resource,index)=><button key={resource.title} className={index===resourceIndex?'active':''} onClick={()=>setResourceIndex(index)}>{resource.title}</button>)}</div>}
    {error&&<div className="module-error">{error}<button onClick={()=>setError('')}><X size={15}/></button></div>}
    {moduleKey==='attendance'&&<div className="info-banner">Create a session with a class ID and date. Class enrollment will populate its student list for marking attendance.</div>}{moduleKey==='students'&&resourceIndex===0&&canImport&&<div className="info-banner csv-import-guide"><span><strong>CSV columns:</strong> admission_number, first_name, and last_name are required. Optional: roll_number, date_of_birth (YYYY-MM-DD), email, guardian_name, guardian_phone, blood_group, parent_email. A parent email must belong to an active parent account in this school.</span></div>}
    <div className="table-card"><div className="table-toolbar"><strong>{filtered.length} {filtered.length===1?'record':'records'}</strong><label className="search-box"><Search size={16}/><input placeholder="Search records" value={query} onChange={(e)=>setQuery(e.target.value)}/></label></div>
      {loading?<div className="empty-state">Loading {spec.title?.toLowerCase()||config.title.toLowerCase()}…</div>:filtered.length===0?<div className="empty-state"><span className="empty-icon">✳</span><strong>No records yet</strong><span>{spec.readOnly?'Nothing to show right now.':`Add your first ${(spec.title||config.title).toLowerCase()} record to get started.`}</span></div>:<div className="table-scroll"><table><thead><tr>{spec.columns.map(col=><th key={col}>{label(col)}</th>)}<th/></tr></thead><tbody>{filtered.map(row=><tr key={row.id||JSON.stringify(row)}>{spec.columns.map(col=><td key={col}>{display(row[col])}</td>)}<td className="row-actions">{moduleKey==='attendance'&&resourceIndex===0&&user?.role!=='student'&&user?.role!=='parent'&&<button className="small-action" onClick={()=>openAttendance(row)}>Take attendance</button>}{moduleKey==='settings'&&resourceIndex===3&&<button className="small-action" onClick={()=>choosePlan(row)}>Choose plan</button>}{!userReadOnly&&!spec.isSchool&&!['student','parent'].includes(user?.role)&&<button className="delete-button" title="Remove" onClick={()=>remove(row)}><Trash2 size={15}/></button>}</td></tr>)}</tbody></table></div>}
    </div>
    {showForm&&<div className="modal-backdrop" onMouseDown={(e)=>{if(e.target===e.currentTarget)setShowForm(false)}}><form className="record-modal" onSubmit={save}><div className="modal-heading"><div><span className="eyebrow page-eyebrow">{spec.isSchool?'SCHOOL PROFILE':'NEW RECORD'}</span><h2>{spec.isSchool?'Edit school details':`Add ${spec.title?.toLowerCase()||config.title.toLowerCase()}`}</h2></div><button type="button" className="icon-button" onClick={()=>setShowForm(false)}><X size={18}/></button></div><div className="modal-fields">{(spec.fields||[]).map(([key,title,type])=><label key={key} className={`modal-field ${type==='textarea'||type==='json'?'wide':''}`}><span>{title}</span>{moduleKey==='students'&&key==='guardian_user'?<select value={values[key]||''} onChange={(e)=>setValues({...values,[key]:e.target.value})}><option value="">No parent account linked</option>{parentAccounts.map((parent)=><option key={parent.id} value={parent.id}>{[parent.first_name,parent.last_name].filter(Boolean).join(' ')||parent.username} · {parent.email}</option>)}</select>:type==='textarea'||type==='json'?<textarea rows={type==='json'?4:3} value={values[key]||''} placeholder={type==='json'?'{}':`Enter ${title.toLowerCase()}`} onChange={(e)=>setValues({...values,[key]:e.target.value})}/>:type==='file'?<input type="file" onChange={(e)=>setValues({...values,[key]:e.target.files?.[0]})}/>:<input type={type==='number'?'number':type||'text'} step={type==='number'?'0.01':undefined} value={values[key]||''} placeholder={`Enter ${title.toLowerCase()}`} onChange={(e)=>setValues({...values,[key]:type==='boolean'?e.target.checked:e.target.value})}/>}</label>)}</div><div className="modal-footer"><button type="button" className="cancel-button" onClick={()=>setShowForm(false)}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving?'Saving…':spec.isSchool?'Save changes':'Save record'}</button></div></form></div>}
    {attendanceSession&&<div className="modal-backdrop"><section className="record-modal attendance-modal"><div className="modal-heading"><div><span className="eyebrow page-eyebrow">CLASS ROSTER</span><h2>Take attendance</h2></div><button className="icon-button" onClick={()=>setAttendanceSession(null)}><X size={18}/></button></div>{attendanceRows.length===0?<div className="empty-state">No active student enrollments were found for this class.</div>:<div className="roster-list">{attendanceRows.map((row,index)=><div className="roster-row" key={row.student_id}><span><strong>{row.name}</strong><small>{row.admission_number}</small></span><select value={row.status} onChange={(e)=>setAttendanceRows(attendanceRows.map((item,i)=>i===index?{...item,status:e.target.value}:item))}><option value="present">Present</option><option value="absent">Absent</option><option value="late">Late</option><option value="excused">Excused</option></select></div>)}</div>}<div className="modal-footer"><button className="cancel-button" onClick={()=>setAttendanceSession(null)}>Cancel</button><button className="primary-button" disabled={!attendanceRows.length} onClick={submitAttendance}>Submit attendance</button></div></section></div>}
  </section>
}
