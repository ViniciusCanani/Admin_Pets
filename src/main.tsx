import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Login from './pages/Login/Login.tsx'
import Pets from './pages/Pets/Pets.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
<Routes>
  <Route path="/" element={<App />} />
  <Route path="/login" element={<Login />} />
  <Route path="/pets" element={<Pets />} />

  {/* Rotas temporárias só para não dar erro */}
  <Route path="/pets/novo" element={<div style={{padding: '2rem'}}><h2>Cadastro de pet (em construção)</h2></div>} />
  <Route path="/pets/editar" element={<div style={{padding: '2rem'}}><h2>Edição de pet (em construção)</h2></div>} />
</Routes>
    </BrowserRouter>
  </StrictMode>,
)