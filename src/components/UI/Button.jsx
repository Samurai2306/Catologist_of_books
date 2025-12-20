import './Button.css'

function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  type = 'button',
  disabled = false,
  size = 'medium',
  className = '',
  ...props 
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button

