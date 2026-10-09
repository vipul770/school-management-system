import { X } from 'lucide-react'
export default function Modal({ title, onClose, children }) { return <div className="modal-backdrop" onMouseDown={(e)=>e.target===e.currentTarget&&onClose()}><section className="record-modal"><div className="modal-heading"><h2>{title}</h2><button className="icon-button" onClick={onClose}><X size={18}/></button></div>{children}</section></div> }
