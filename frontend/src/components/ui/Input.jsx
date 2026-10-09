export default function Input({ label, id, ...props }) { return <label className="modal-field"><span>{label}</span><input id={id} {...props}/></label> }
