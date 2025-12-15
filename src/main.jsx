import React from 'react'
import ReactDOM from 'react-dom/client'
import TimeCalculator from './TimeCalculator.jsx'
import { ThemeProvider } from './theme/ThemeProvider'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <TimeCalculator />
    </ThemeProvider>
  </React.StrictMode>,
)
