import { useState } from 'react';
import './Login.css';

export default function Login({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Formatar CPF com máscara XXX.XXX.XXX-XX
  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
  };

  // Validar formato de CPF
  const isValidCPFFormat = (value: string): boolean => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length === 11;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
    setError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!isValidCPFFormat(cpf)) {
      setError('CPF inválido. Use o formato XXX.XXX.XXX-XX');
      return;
    }

    if (!password) {
      setError('Senha é obrigatória');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cpf: cpf.replace(/\D/g, ''), // Enviar apenas números
          senha: password
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Armazenar informações do funcionário
        localStorage.setItem('employee', JSON.stringify(result.employee));
        localStorage.setItem('isAuthenticated', 'true');
        onLoginSuccess();
      } else {
        setError(result.error || 'Erro ao fazer login');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Sistema de Administração</h1>
          <p>Autenticação de Funcionários</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="cpf">CPF</label>
            <input
              id="cpf"
              type="text"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={handleCPFChange}
              maxLength={14}
              className="form-input"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={handlePasswordChange}
              className="form-input"
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Autenticando...' : 'Logar'}
          </button>
        </form>
      </div>
    </div>
  );
}