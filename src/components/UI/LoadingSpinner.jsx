import './LoadingSpinner.css'

function LoadingSpinner() {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p className="spinner-text">Загрузка...</p>
    </div>
  )
}

export default LoadingSpinner

