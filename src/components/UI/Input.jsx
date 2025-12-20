import './Input.css'

function Input({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder,
  error,
  className = '',
  ...props 
}) {
  return (
    <div className={`input-group ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <input
        type={type}
        className={`input ${error ? 'input-error' : ''}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
      />
      {error && <span className="input-error-text">{error}</span>}
    </div>
  )
}

export default Input

