import { useState, useRef, useEffect } from 'react'
import './MultiSelect.css'

function MultiSelect({
  label,
  value = [],
  onChange,
  options = [],
  placeholder = 'Выберите...',
  error,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const selectedValues = Array.isArray(value) ? value.map(String) : []
  const selectedOptions = options.filter(opt => selectedValues.includes(String(opt.value)))

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToggle = (optionValue) => {
    const stringValue = String(optionValue)
    const newValues = selectedValues.includes(stringValue)
      ? selectedValues.filter(v => v !== stringValue)
      : [...selectedValues, stringValue]
    
    // Создаем объект, совместимый с нативным select
    const selectedOptionsArray = newValues.map(val => {
      const opt = options.find(o => String(o.value) === val)
      return {
        value: val,
        text: opt?.label || val,
        selected: true,
      }
    })
    
    onChange({
      target: {
        selectedOptions: selectedOptionsArray,
      },
    })
  }

  const handleRemove = (optionValue, e) => {
    e.stopPropagation()
    const stringValue = String(optionValue)
    const newValues = selectedValues.filter(v => v !== stringValue)
    
    const selectedOptionsArray = newValues.map(val => {
      const opt = options.find(o => String(o.value) === val)
      return {
        value: val,
        text: opt?.label || val,
        selected: true,
      }
    })
    
    onChange({
      target: {
        selectedOptions: selectedOptionsArray,
      },
    })
  }

  return (
    <div className={`multi-select-group ${className}`} ref={containerRef}>
      {label && <label className="multi-select-label">{label}</label>}
      <div
        className={`multi-select ${error ? 'multi-select-error' : ''} ${isOpen ? 'multi-select-open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="multi-select-content">
          {selectedOptions.length === 0 ? (
            <span className="multi-select-placeholder">{placeholder}</span>
          ) : (
            <div className="multi-select-tags">
              {selectedOptions.map(opt => (
                <span key={opt.value} className="multi-select-tag">
                  {opt.label}
                  <button
                    type="button"
                    className="multi-select-tag-remove"
                    onClick={(e) => handleRemove(opt.value, e)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <span className="multi-select-arrow">▼</span>
      </div>

      {isOpen && (
        <div className="multi-select-dropdown">
          {options.length > 5 && (
            <div className="multi-select-search">
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="multi-select-search-input"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className="multi-select-options">
            {filteredOptions.length === 0 ? (
              <div className="multi-select-empty">Нет вариантов</div>
            ) : (
              filteredOptions.map(opt => {
                const isSelected = selectedValues.includes(String(opt.value))
                return (
                  <div
                    key={opt.value}
                    className={`multi-select-option ${isSelected ? 'multi-select-option-selected' : ''}`}
                    onClick={() => handleToggle(opt.value)}
                  >
                    <span className="multi-select-checkbox">
                      {isSelected && '✓'}
                    </span>
                    <span className="multi-select-option-label">{opt.label}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {error && <span className="multi-select-error-text">{error}</span>}
    </div>
  )
}

export default MultiSelect

