import { useState, useEffect, useMemo } from 'react';
import { Search, MessageCircle, ChevronDown, Loader2, Plus, Edit, LogOut, PawPrint, Users, Home, Info } from 'lucide-react';
import './Pets.css';
import { Link } from 'react-router-dom'

interface AdoptionFromAPI {
    id: number | string;
    protocolo: string;
    idPet: number;
    solicitante: {
        nomeCompleto: string;
        telefone: string;
        tipoMoradia: string;
        condicaoImovel: string;
        numeroResidentes: number;
    };
    motivoAdocao: string;
    status: string;
    criadoEm: string;
    atualizadoEm: string;
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

                const petsResponse = await fetch('http://localhost:3000/api/admin/pets');
                if (!petsResponse.ok) throw new Error('Erro ao buscar pets');
                const petsData = await petsResponse.json();
                const petsArray = Array.isArray(petsData) ? petsData : petsData.pets || [];
                setPets(petsArray.map(mapPetFromAPI));

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

    const getPetAdoptions = (petId: string) => {
        return adoptions.filter(a => String(a.idPet) === petId);
    };

    if (loading) {
        return (
            <div className="pets-loading">
                <Loader2 className="pets-loading-spinner" />
                <p>Carregando painel administrativo...</p>
            </div>
        );
    }

    return (
        <div className="admin-layout">
            {/* Sidebar - Menu à Esquerda */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <PawPrint size={32} className="logo-icon" />
                    <span>PetLove Admin</span>
                </div>
                
                <nav className="sidebar-nav">
                    <Link to="/pets" className="nav-item active">
                        <Home size={20} /> Painel Principal
                    </Link>
                    <Link to="/pets/novo" className="nav-item">
                        <Plus size={20} /> Novo Pet
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-button" onClick={() => {
                        localStorage.removeItem('employee');
                        localStorage.removeItem('isAuthenticated');
                        window.location.href = '/login';
                    }}>
                        <LogOut size={20} /> Sair
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="content-header">
                    <div>
                        <h1>Gerenciamento de Pets</h1>
                        <p>Acompanhe os pets cadastrados e as solicitações de adoção.</p>
                    </div>
                    
                    <div className="header-search">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar pet pelo nome..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </header>

                <section className="filters-section">
                    <div className="filter-group">
                        <button onClick={() => setFilterType('all')} className={filterType === 'all' ? 'active' : ''}>Todos</button>
                        <button onClick={() => setFilterType('dogs')} className={filterType === 'dogs' ? 'active' : ''}>Cães</button>
                        <button onClick={() => setFilterType('cats')} className={filterType === 'cats' ? 'active' : ''}>Gatos</button>
                    </div>
                    <div className="stats-badge">
                        {filteredPets.length} pets encontrados
                    </div>
                </section>

                {error && <div className="error-banner">{error}</div>}

                <div className="pets-grid">
                    {filteredPets.map((pet) => {
                        const petAdoptions = getPetAdoptions(pet.id);
                        const isExpanded = expandedPetId === pet.id;

                        return (
                            <div key={pet.id} className={`pet-card-container ${isExpanded ? 'expanded' : ''}`}>
                                <div className="pet-card-main">
                                    <div className="pet-image-wrapper">
                                        <img src={pet.image} alt={pet.name} onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop'; }} />
                                    </div>
                                    
                                    <div className="pet-info-content">
                                        <div className="pet-info-header">
                                            <h3>{pet.name}</h3>
                                            <span className={`type-tag ${pet.type}`}>{pet.type === 'dog' ? 'Cão' : 'Gato'}</span>
                                        </div>
                                        
                                        <div className="pet-info-grid">
                                            <div className="info-item">
                                                <span className="label">Raça</span>
                                                <span className="value">{pet.breed}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">Idade</span>
                                                <span className="value">{pet.age}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">Sexo</span>
                                                <span className="value">{pet.gender === 'male' ? 'Macho' : 'Fêmea'}</span>
                                            </div>
                                        </div>

                                        <div className="pet-description">
                                            <p>{pet.description}</p>
                                        </div>

                                        <div className="pet-card-footer">
                                            <div className="adoption-count">
                                                <Users size={16} />
                                                <span>{petAdoptions.length} solicitações</span>
                                            </div>
                                            <button 
                                                className={`expand-btn ${isExpanded ? 'active' : ''}`}
                                                onClick={() => setExpandedPetId(isExpanded ? null : pet.id)}
                                            >
                                                {isExpanded ? 'Ocultar Histórico' : 'Ver Histórico'}
                                                <ChevronDown size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="pet-history-section">
                                        <h4><Info size={18} /> Histórico de Solicitações</h4>
                                        {petAdoptions.length > 0 ? (
                                            <div className="adoptions-list">
                                                {petAdoptions.map((adoption, idx) => (
                                                    <div key={adoption.id || idx} className="adoption-item-card">
                                                        <div className="adoption-item-header">
                                                            <div className="adopter-main-info">
                                                                <strong>{adoption.solicitante?.nomeCompleto}</strong>
                                                                <span>{adoption.solicitante?.telefone}</span>
                                                            </div>
                                                            <span className={`status-pill ${adoption.status}`}>{adoption.status}</span>
                                                        </div>
                                                        
                                                        <div className="adoption-details-grid">
                                                            <div className="detail-col">
                                                                <p><strong>Moradia:</strong> {adoption.solicitante?.tipoMoradia} ({adoption.solicitante?.condicaoImovel})</p>
                                                                <p><strong>Residentes:</strong> {adoption.solicitante?.numeroResidentes} pessoas</p>
                                                            </div>
                                                            <div className="detail-col">
                                                                <p><strong>Data:</strong> {new Date(adoption.criadoEm).toLocaleDateString('pt-BR')}</p>
                                                                <p><strong>Protocolo:</strong> {adoption.protocolo}</p>
                                                            </div>
                                                        </div>

                                                        <div className="adoption-reason">
                                                            <strong>Motivo da Adoção:</strong>
                                                            <p>{adoption.motivoAdocao}</p>
                                                        </div>

                                                        <div className="adoption-item-actions">
                                                            <button className="whatsapp-btn" onClick={() => handleWhatsApp(adoption.solicitante?.telefone || '', pet.name)}>
                                                                <MessageCircle size={16} /> Contatar via WhatsApp
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="empty-history">Nenhuma solicitação para este pet.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Tabela Geral de Adoções */}
                <section className="all-adoptions-section">
                    <div className="section-header">
                        <h2><Users size={22} /> Registros Gerais de Adoção</h2>
                        <p>Lista completa de todas as solicitações recebidas no sistema.</p>
                    </div>

                    {adoptions.length > 0 ? (
                        <div className="table-container">
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th>Pet</th>
                                        <th>Adotante</th>
                                        <th>Contato</th>
                                        <th>Data</th>
                                        <th>Status</th>
                                        <th>Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {adoptions.map((adoption, index) => {
                                        const pet = pets.find(p => String(p.id) === String(adoption.idPet));
                                        return (
                                            <tr key={adoption.id || index}>
                                                <td>
                                                    <div className="table-pet-info">
                                                        <strong>{pet?.name || `Pet #${adoption.idPet}`}</strong>
                                                        <span>{pet?.breed || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="table-adopter-info">
                                                        <strong>{adoption.solicitante?.nomeCompleto}</strong>
                                                        <span>{adoption.solicitante?.tipoMoradia}</span>
                                                    </div>
                                                </td>
                                                <td>{adoption.solicitante?.telefone}</td>
                                                <td>{new Date(adoption.criadoEm).toLocaleDateString('pt-BR')}</td>
                                                <td>
                                                    <span className={`status-pill ${adoption.status}`}>{adoption.status}</span>
                                                </td>
                                                <td>
                                                    <button 
                                                        className="table-whatsapp-btn" 
                                                        onClick={() => handleWhatsApp(adoption.solicitante?.telefone || '', pet?.name || 'Pet')}
                                                    >
                                                        <MessageCircle size={16} /> WhatsApp
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-table-state">
                            <p>Nenhum registro de adoção encontrado no sistema.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}