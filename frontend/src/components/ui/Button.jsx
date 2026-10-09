export default function Button({ variant='primary', children, ...props }) { return <button className={variant==='primary'?'primary-button':'cancel-button'} {...props}>{children}</button> }
