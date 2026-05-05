import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import './Cadastro.css';

export default function NovoPet() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [formData, setFormData] = useState({
        nome: '',
        raca: '',
        idade: '',
        sexo: 'Macho',
        porte: 'Médio',
        cor: '',
        foto: '',
        descricao: '',
        tipo: 'Cachorro'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch('http://localhost:3000/api/pets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Erro ao salvar o pet. Verifique os dados e tente novamente.');
            }

            setMessage({ type: 'success', text: 'Pet cadastrado com sucesso!' });
            
            // Redireciona após 2 segundos
            setTimeout(() => {
                navigate('/pets');
            }, 2000);

        } catch (err) {
            setMessage({ 
                type: 'error', 
                text: err instanceof Error ? err.message : 'Ocorreu um erro inesperado.' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="novo-pet-container">
            <header className="novo-pet-header">
                <Link to="/pets" className="back-button">
                    <ArrowLeft size={20} />
                    Voltar
                </Link>
                <h1>Cadastrar Novo Pet</h1>
            </header>

            <main className="novo-pet-main">
                <form onSubmit={handleSubmit} className="novo-pet-form">
                    {message && (
                        <div className={`message-banner ${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="nome">Nome do Pet</label>
                            <input
                                type="text"
                                id="nome"
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                required
                                placeholder="Ex: Thor"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="tipo">Tipo</label>
                            <select id="tipo" name="tipo" value={formData.tipo} onChange={handleChange}>
                                <option value="Cachorro">Cachorro</option>
                                <option value="Gato">Gato</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="raca">Raça</label>
                            <input
                                type="text"
                                id="raca"
                                name="raca"
                                value={formData.raca}
                                onChange={handleChange}
                                required
                                placeholder="Ex: Labrador"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="idade">Idade</label>
                            <input
                                type="text"
                                id="idade"
                                name="idade"
                                value={formData.idade}
                                onChange={handleChange}
                                required
                                placeholder="Ex: 2 anos"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="sexo">Sexo</label>
                            <select id="sexo" name="sexo" value={formData.sexo} onChange={handleChange}>
                                <option value="Macho">Macho</option>
                                <option value="Fêmea">Fêmea</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="porte">Porte</label>
                            <select id="porte" name="porte" value={formData.porte} onChange={handleChange}>
                                <option value="Pequeno">Pequeno</option>
                                <option value="Médio">Médio</option>
                                <option value="Grande">Grande</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="cor">Cor</label>
                            <input
                                type="text"
                                id="cor"
                                name="cor"
                                value={formData.cor}
                                onChange={handleChange}
                                required
                                placeholder="Ex: Caramelo"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="foto">URL da Imagem</label>
                            <input
                                type="url"
                                id="foto"
                                name="foto"
                                value={formData.foto}
                                onChange={handleChange}
                                required
                                placeholder="https://exemplo.com/foto.jpg"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="descricao">Descrição</label>
                            <textarea
                                id="descricao"
                                name="descricao"
                                value={formData.descricao}
                                onChange={handleChange}
                                required
                                rows={4}
                                placeholder="Conte um pouco sobre o pet..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="save-button" disabled={loading}>
                            {loading ? (
                                <><Loader2 className="spinner" size={20} /> Salvando...</>
                            ) : (
                                <><Save size={20} /> Salvar Pet</>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}