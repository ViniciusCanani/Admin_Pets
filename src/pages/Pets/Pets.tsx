import { useState, useEffect, useMemo } from 'react';
import { Search, MessageCircle, ChevronDown, Loader2 } from 'lucide-react';
import './Pets.css';

interface PetFromAPI {
  id: number;
  foto: string;
  nome: string;
  raca: string;
  idade: string;
  tipo: string;
  descricao: string;
  sexo: string;
  adocoes: Adoption[];
}

interface Pet {
  id: string;
  name: string;
  breed: string;
  age: string;
  type: 'dog' | 'cat';
  gender: 'male' | 'female';
  description: string;
  adoptions: number;
  image: string;
}

interface Adoption {
  id?: string;
  petName?: string;
  petType?: 'dog' | 'cat';
  adoptionDate?: string;
  adopterName?: string;
  adopterPhone?: string;
}

type FilterType = 'all' | 'dogs' | 'cats';

/**
 * Mapeia dados da API para o formato interno do componente
 */
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
    adoptions: petData.adocoes ? petData.adocoes.length : 0,
    image: petData.foto,
  };
}

export default function Pets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [expandedPetId, setExpandedPetId] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchPetsData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('http://localhost:3000/api/admin/pets');

        if (!response.ok) {
          throw new Error(`Erro ao buscar dados: ${response.statusText}`);
        }

        const data = await response.json();

        // Handle both array and object responses
        const petsArray = Array.isArray(data) ? data : data.pets || [];

        // Map API data to internal format
        const mappedPets = petsArray.map(mapPetFromAPI);
        setPets(mappedPets);

        // Collect all adoptions from all pets
        const allAdoptions: Adoption[] = [];
        petsArray.forEach((pet: PetFromAPI) => {
          if (pet.adocoes && Array.isArray(pet.adocoes)) {
            pet.adocoes.forEach((adoption) => {
              allAdoptions.push({
                ...adoption,
                petName: pet.nome,
                petType: pet.tipo.toLowerCase().includes('cachorro') ? 'dog' : 'cat',
              });
            });
          }
        });

        setAdoptions(allAdoptions);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        console.error('Erro ao buscar pets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPetsData();
  }, []);

  // Filter and search pets
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

  const getAdoptionCount = (petName: string) => {
    return adoptions.filter((a) => a.petName === petName).length;
  };

  const getPetAdoptions = (petName: string) => {
    return adoptions.filter((a) => a.petName === petName);
  };

  if (loading) {
    return (
      <div className="pets-loading">
        <div className="pets-loading-content">
          <Loader2 className="pets-loading-spinner" />
          <p className="pets-loading-text">Carregando dados de pets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pets-container">
      {/* Header */}
      <header className="pets-header">
        <div className="pets-header-content">
          <div className="pets-header-top">
            <h1 className="pets-header-title">Pets Cadastrados</h1>
            <div className="pets-header-buttons">
              <button className="pets-header-button">Novo</button>
              <button className="pets-header-button">Editar</button>
            </div>
          </div>
          <p className="pets-header-subtitle">
            Visualize e gerencie todos pets e suas solicitações de adoção
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="pets-main">
        {/* Error Message */}
        {error && (
          <div className="pets-error">
            <p className="pets-error-text">
              <span className="pets-error-label">Erro:</span> {error}
            </p>
          </div>
        )}

        {/* Search and Filters */}
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

          {/* Filter Badges */}
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

        {/* Pets Grid */}
        <div className="pets-grid-section">
          <h2 className="pets-grid-title">Listagem de Pets ({filteredPets.length})</h2>
          <div className="pets-grid">
            {filteredPets.map((pet) => {
              const adoptionCount = getAdoptionCount(pet.name);
              return (
                <div key={pet.id} className="pet-card">
                  {/* Pet Image */}
                  <div className="pet-card-image">
                    <img
                      src={pet.image}
                      alt={pet.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop';
                      }}
                    />
                  </div>

                  {/* Pet Info */}
                  <div className="pet-card-info">
                    <h3 className="pet-card-name">{pet.name}</h3>
                    <p className="pet-card-breed">
                      {pet.breed} • {pet.age}
                    </p>
                  </div>

                  {/* Pet Details */}
                  <div className="pet-card-details">
                    <div className="pet-card-detail-item">
                      <span className="pet-card-detail-label">Tipo:</span>
                      <span>
                        {pet.type === 'dog' ? '🐕 Cachorro' : '🐱 Gato'}
                      </span>
                    </div>
                    <div className="pet-card-detail-item">
                      <span className="pet-card-detail-label">Sexo:</span>
                      <span>
                        {pet.gender === 'male' ? 'Macho' : 'Fêmea'}
                      </span>
                    </div>
                    <div className="pet-card-detail-item">
                      <span className="pet-card-detail-label">Descrição:</span>
                      <span>{pet.description}</span>
                    </div>
                  </div>

                  {/* Adoption Badge */}
                  <div className="pet-card-badge">
                    <span className="adoption-badge">
                      {adoptionCount} adoção
                      {adoptionCount !== 1 ? 'ões' : ''}
                    </span>
                  </div>

                  {/* Expandable Details */}
                  <button
                    onClick={() =>
                      setExpandedPetId(expandedPetId === pet.id ? null : pet.id)
                    }
                    className="pet-card-expand-button"
                  >
                    <span>
                      {expandedPetId === pet.id ? 'Ocultar' : 'Ver'} histórico
                    </span>
                    <ChevronDown
                      className={`pet-card-expand-icon ${
                        expandedPetId === pet.id ? 'rotated' : ''
                      }`}
                    />
                  </button>

                  {/* Expanded History */}
                  {expandedPetId === pet.id && (
                    <div className="pet-card-history">
                      <p className="pet-card-history-title">
                        Histórico de Adoções:
                      </p>
                      {getPetAdoptions(pet.name).length > 0 ? (
                        getPetAdoptions(pet.name).map((adoption, index) => (
                          <div
                            key={adoption.id || index}
                            className="pet-card-history-item"
                          >
                            <p style={{ margin: 0 }}>
                              <span className="pet-card-history-item-name">
                                {adoption.adopterName || 'N/A'}
                              </span>{' '}
                              -{' '}
                              {adoption.adoptionDate
                                ? new Date(
                                    adoption.adoptionDate
                                  ).toLocaleDateString('pt-BR')
                                : 'Data não disponível'}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="pet-card-no-history">
                          Nenhuma adoção registrada
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredPets.length === 0 && (
            <div className="pets-empty-state">
              <p className="pets-empty-state-text">
                Nenhum pet encontrado com os filtros selecionados.
              </p>
            </div>
          )}
        </div>

        {/* Adoptions Table */}
        <div className="adoptions-section">
          <h2 className="adoptions-title">Histórico de Adoções</h2>
          {adoptions.length > 0 ? (
            <div className="adoptions-table-wrapper">
              <table className="adoptions-table">
                <thead>
                  <tr>
                    <th>Pet</th>
                    <th>Data da Adoção</th>
                    <th>Adotante</th>
                    <th>Telefone</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {adoptions.map((adoption, index) => (
                    <tr key={adoption.id || index}>
                      <td>
                        <span className="adoptions-table-pet-name">
                          {adoption.petName}
                        </span>
                        <span className="adoptions-table-pet-icon">
                          {adoption.petType === 'dog' ? ' 🐕' : ' 🐱'}
                        </span>
                      </td>
                      <td>
                        {adoption.adoptionDate
                          ? new Date(adoption.adoptionDate).toLocaleDateString(
                              'pt-BR'
                            )
                          : 'N/A'}
                      </td>
                      <td>{adoption.adopterName || 'N/A'}</td>
                      <td>{adoption.adopterPhone || 'N/A'}</td>
                      <td>
                        {adoption.adopterPhone ? (
                          <button
                            className="adoptions-table-action-button"
                            onClick={() =>
                              handleWhatsApp(
                                adoption.adopterPhone!,
                                adoption.petName || ''
                              )
                            }
                          >
                            <MessageCircle size={16} />
                            WhatsApp
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                            Sem telefone
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="adoptions-empty">
              <p className="adoptions-empty-text">
                Nenhum registro de adoção encontrado.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}