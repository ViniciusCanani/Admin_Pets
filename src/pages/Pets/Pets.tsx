import { useState, useEffect, useMemo } from 'react';
import { Search, MessageCircle, ChevronDown, Loader2 } from 'lucide-react';
import './Pets.css';
import { Link } from 'react-router-dom'

// Estrutura correta da API de Adoções (Porta 3333)
interface AdoptionFromAPI {
    id?: number | string;
    idPet: number;
    nome: string;
    telefone: string;
    moradia: string;
    condicao: string;
    pessoas: number;
    motivo: string;
    status?: string;
    criadoEm?: string;
}

interface PetFromAPI {
    id: number;
    foto: string;
    nome: string;
    raca: string;
    idade: string;
    tipo: string;
    descricao: string;
    sexo: string;
}

interface Pet {
    id: string;
    name: string;
    breed: string;
    age: string;
    type: 'dog' | 'cat';
    gender: 'male' | 'female';
    description: string;
    image: string;
}

type FilterType = 'all' | 'dogs' | 'cats';

function mapPetFromAPI(petData: PetFromAPI): Pet {
    const type = petData.tipo.toLowerCase().includes('cachorro') ? 'dog' : 'cat';
    const gender = petData.sexo.toLowerCase().includes('macho') ? 'male' : 'female';

    return {
        id: String(petData.id),
        name: petData.nome,
        breed: petData.raca,
        age: petData.idade,
        type,
        gender,
        description: petData.descricao,
        image: petData.foto,
    };
}

export default function Pets() {
    const [pets, setPets] = useState<Pet[]>([]);
    const [adoptions, setAdoptions] = useState<AdoptionFromAPI[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [expandedPetId, setExpandedPetId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. Busca Pets (Porta 3000)
                const petsResponse = await fetch('http://localhost:3000/api/admin/pets');
                if (!petsResponse.ok) throw new Error('Erro ao buscar pets');
                const petsData = await petsResponse.json();
                const petsArray = Array.isArray(petsData) ? petsData : petsData.pets || [];
                setPets(petsArray.map(mapPetFromAPI));

                // 2. Busca Adoções (Porta 3333)
                const adoptionsResponse = await fetch('http://localhost:3000/api/adoptions');
                if (adoptionsResponse.ok) {
                    const adoptionsData = await adoptionsResponse.json();
                    setAdoptions(Array.isArray(adoptionsData) ? adoptionsData : []);
                }

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredPets = useMemo(() => {
        return pets.filter((pet) => {
            const matchesSearch = pet.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter =
                filterType === 'all' ||
                (filterType === 'dogs' && pet.type === 'dog') ||
                (filterType === 'cats' && pet.type === 'cat');
            return matchesSearch && matchesFilter;
        });
    }, [searchQuery, filterType, pets]);

    const handleWhatsApp = (phone: string, petName: string) => {
        const message = `Olá! Gostaria de saber mais sobre a adoção do ${petName}.`;
        const whatsappUrl = `https://wa.me/55${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    // Função para pegar adoções de um pet específico pelo ID
    const getPetAdoptions = (petId: string) => {
        return adoptions.filter(a => String(a.idPet) === petId);
    };

    if (loading) {
        return (
            <div className="pets-loading">
                <div className="pets-loading-content">
                    <Loader2 className="pets-loading-spinner" />
                    <p className="pets-loading-text">Carregando dados...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pets-container">
            <header className="pets-header">
                <div className="pets-header-content">
                    <div className="pets-header-top">
                        <h1 className="pets-header-title">Pets Cadastrados</h1>
                        <div className="pets-header-buttons">
                            <Link to="/pets/novo" className="pets-header-button">Novo</Link>
                            <Link to="/pets/editar" className="pets-header-button">Editar</Link>
                            <button
                                className="pets-header-button"
                                onClick={() => {
                                    localStorage.removeItem('employee');
                                    localStorage.removeItem('isAuthenticated');
                                    window.location.href = '/login';
                                }}
                            >
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="pets-main">
                {error && <div className="pets-error"><p>{error}</p></div>}

                <div className="pets-search-filters">
                    <div className="pets-search-wrapper">
                        <Search className="pets-search-icon" />
                        <input
                            type="text"
                            placeholder="Pesquisar por nome..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pets-search-input"
                        />
                    </div>
                    <div className="pets-filter-badges">
                        {(['all', 'cats', 'dogs'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`pets-filter-badge ${filterType === type ? 'active' : ''}`}
                            >
                                {type === 'all' ? 'Todos' : type === 'cats' ? 'Gatos' : 'Cães'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pets-grid-section">
                    <h2 className="pets-grid-title">Listagem de Pets ({filteredPets.length})</h2>
                    <div className="pets-grid">
                        {filteredPets.map((pet) => {
                            const petAdoptions = getPetAdoptions(pet.id);
                            return (
                                <div key={pet.id} className="pet-card-wrapper">
                                    <div className="pet-card">
                                        <div className="pet-card-image">
                                            <img src={pet.image} alt={pet.name} onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop'; }} />
                                        </div>
                                        <div className="pet-card-info">
                                            <h3 className="pet-card-name">{pet.name}</h3>
                                            <p className="pet-card-breed">{pet.breed} • {pet.age}</p>
                                        </div>
                                        <div className="pet-card-details">
                                            <div className="pet-card-detail-item"><span className="pet-card-detail-label">Tipo:</span> <span>{pet.type === 'dog' ? 'Cão' : 'Gato'}</span></div>
                                            <div className="pet-card-detail-item"><span className="pet-card-detail-label">Sexo:</span> <span>{pet.gender === 'male' ? 'Macho' : 'Fêmea'}</span></div>
                                            <div className="pet-card-detail-item"><span className="pet-card-detail-label">Descrição:</span> <span>{pet.description}</span></div>
                                        </div>
                                        <div className="pet-card-actions">
                                            <div className="pet-card-badge">
                                                <span className="adoption-badge">{petAdoptions.length} adoção{petAdoptions.length !== 1 ? 'es' : ''}</span>
                                            </div>
                                            <button onClick={() => setExpandedPetId(expandedPetId === pet.id ? null : pet.id)} className="pet-card-expand-button">
                                                <span>{expandedPetId === pet.id ? 'Ocultar' : 'Ver'} histórico</span>
                                                <ChevronDown className={`pet-card-expand-icon ${expandedPetId === pet.id ? 'rotated' : ''}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {expandedPetId === pet.id && (
                                        <div className="pet-card-history">
                                            <p className="pet-card-history-title">Histórico de Adoções:</p>
                                            {petAdoptions.length > 0 ? (
                                                petAdoptions.map((adoption, index) => (
                                                    <div key={adoption.id || index} className="pet-card-history-item">
                                                        <p style={{ margin: 0 }}>
                                                            <span className="pet-card-history-item-name">{adoption.nome}</span> - {adoption.telefone}
                                                        </p>
                                                        <p style={{ margin: 0 }}>
                                                            <strong>Moradia:</strong> {adoption.moradia} ({adoption.condicao})
                                                        </p>
                                                        <p style={{ margin: 0 }}>
                                                            <strong>Residentes:</strong> {adoption.pessoas}
                                                        </p>
                                                        <p style={{ margin: 0 }}>
                                                            <strong>Motivo:</strong> {adoption.motivo}
                                                        </p>
                                                        <p style={{ margin: 0 }}>
                                                            <strong>Status:</strong> {adoption.status || 'Pendente'}
                                                        </p>
                                                        {adoption.criadoEm && (
                                                            <p style={{ margin: 0 }}>
                                                                <strong>Solicitado em:</strong> {new Date(adoption.criadoEm).toLocaleDateString('pt-BR')}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="pet-card-no-history">Nenhuma adoção registrada</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Tabela Inferior */}
                <div className="adoptions-section">
                    <h2 className="adoptions-title">Histórico Geral de Adoções</h2>
                    {adoptions.length > 0 ? (
                        <div className="adoptions-table-wrapper">
                            <table className="adoptions-table">
                                <thead>
                                    <tr>
                                        <th>Pet ID</th>
                                        <th>Adotante</th>
                                        <th>Telefone</th>
                                        <th>Moradia</th>
                                        <th>Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {adoptions.map((adoption, index) => (
                                        <tr key={adoption.id || index}>
                                            <td>#{adoption.idPet}</td>
                                            <td>{adoption.nome}</td>
                                            <td>{adoption.telefone}</td>
                                            <td>{adoption.moradia}</td>
                                            <td>
                                                <button className="adoptions-table-action-button" onClick={() => handleWhatsApp(adoption.telefone, 'Pet #' + adoption.idPet)}>
                                                    <MessageCircle size={16} /> WhatsApp
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="adoptions-empty"><p>Nenhum registro encontrado.</p></div>
                    )}
                </div>
            </main>
        </div>
    );
}