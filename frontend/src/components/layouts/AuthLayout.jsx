import Brand from '../ui/Brand'

export default function AuthLayout({ children }) { return <main className="login-shell"><section className="brand-panel"><Brand /><div className="brand-copy"><div className="eyebrow">One connected school community</div><h1>Make room for what matters.</h1><p>Bring your school day into focus with one thoughtful place for learning, people, and progress.</p></div><div className="school-note">A calmer way to manage the school day.</div></section><section className="form-panel">{children}</section></main> }
