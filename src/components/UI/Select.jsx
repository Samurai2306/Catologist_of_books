import './Select.css'

function Select({ 
  label, 
  value, 
  onChange, 
  options = [],
  placeholder = 'Выберите...',
  error,
  className = '',
  multiple = false,
  ...props 
}) {
  return (
    <div className={`select-group ${className}`}>
      {label && <label className="select-label">{label}</label>}
      <select
        className={`select ${error ? 'select-error' : ''}`}
        value={multiple ? (Array.isArray(value) ? value.map(String) : []) : (value || '')}
        onChange={onChange}
        multiple={multiple}
        {...props}
      >
        {!multiple && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="select-error-text">{error}</span>}
    </div>
  )
}

export default Select

