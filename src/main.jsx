import React from 'react'
import ReactDOM from 'react-dom/client'
import PersonalityTest from './PersonalityTest.jsx'
import ConsentBanner from './components/ConsentBanner'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PersonalityTest />
    <ConsentBanner privacyUrl="https://florian-lingner.ch/datenschutz" />
  </React.StrictMode>,
)
