import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/layouts/AuthLayout'
import { signedIn } from '../../store/slices/authSlice'
import { login } from '../../services/authService'
import { Link } from 'react-router-dom'

export default function LoginPage() {
  const [organizationId, setOrganizationId] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  function continueToAccount(event) { event.preventDefault(); setError(''); if (!organizationId.trim()) { setError('Enter your organization ID to continue.'); return } setStep(2) }
  async function signIn(event) {
    event.preventDefault(); setError(''); setBusy(true)
    try { const { data } = await login({ organization_id: organizationId.trim(), email: username.trim(), password }); dispatch(signedIn({ access: data.access, user: data.user })); navigate('/dashboard') }
    catch (e) { setError(e.response?.data?.detail || 'We could not sign you in. Check your organization ID and credentials.') }
    finally { setBusy(false) }
  }

  return <AuthLayout><div className="login-card"><div className="step-indicator"><span className={`step-dot ${step===1?'active':''}`}>1</span><span>Organization</span><span className="step-line"/><span className={`step-dot ${step===2?'active':''}`}>2</span><span>Your account</span></div>
    {step===1 ? <form onSubmit={continueToAccount}><h2>Welcome back</h2><p className="subheading">Start by entering your school's organization ID.</p><div className="field-group"><label className="field-label" htmlFor="organization">Organization ID</label><input className="field" id="organization" autoComplete="organization" placeholder="e.g. northstar-academy" value={organizationId} onChange={(e)=>setOrganizationId(e.target.value)} autoFocus/></div>{error&&<p className="error-message">{error}</p>}<button className="continue-button">Continue</button></form> : <form onSubmit={signIn}><button className="back-button" type="button" onClick={()=>{setStep(1);setError('')}}>← Change organization</button><div className="organization-chip">School ID · <strong>{organizationId}</strong></div><h2>Sign in to your account</h2><p className="subheading">Use the account details provided by your school.</p><div className="field-group"><label className="field-label" htmlFor="username">Email address</label><input className="field" id="username" type="email" autoComplete="username" placeholder="name@school.edu" value={username} onChange={(e)=>setUsername(e.target.value)} autoFocus required/></div><div className="field-group"><label className="field-label" htmlFor="password">Password</label><input className="field" id="password" type="password" autoComplete="current-password" placeholder="Your password" value={password} onChange={(e)=>setPassword(e.target.value)} required/></div>{error&&<p className="error-message">{error}</p>}<button className="sign-in-button" disabled={busy}>{busy?'Signing in…':'Sign in'}</button></form>}
    {step===2&&<div className="forgot-link"><Link to="/forgot-password">Forgot password?</Link></div>}<div className="login-footer">Need help? Contact your school administrator.<br/><Link to="/register-school">Register your school</Link></div></div></AuthLayout>
}
