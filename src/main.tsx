import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Login from './pages/Login/Login.tsx'
import Pets from './pages/Pets/Pets.tsx'
import Cadastro from './pages/Cadastro/Cadastro.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pets" element={<Pets />} />
        <Route path="/pets/novo" element={<Cadastro />} /> 
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)