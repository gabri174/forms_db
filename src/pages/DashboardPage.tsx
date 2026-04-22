// src/pages/DashboardPage.tsx
import { useState, useEffect } from 'react';
import '../styles/dashboard.css';
import CompanyForm from '../components/CompanyForm';
import CompanyTable from '../components/CompanyTable';

export default function DashboardPage({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [sectors, setSectors] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, thisMonth: 0 });

  // @ts-ignore
const apiBase = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8787';

  useEffect(() => {
    fetchCompanies();
  }, []);

  async function fetchCompanies(search = '', sector = '') {
    setLoading(true);
    try {
      let url = `${apiBase}/api/companies`;
      const params = new URLSearchParams();

      if (search) params.append('search', search);
      if (sector) params.append('sector', sector);

      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          onLogout();
          return;
        }
        throw new Error('Error al obtener empresas');
      }

      const data = await response.json();
      setCompanies(data.results || []);

      // Extraer sectores únicos
      const uniqueSectors = [...new Set(data.results?.map((c: any) => c.sector_industria) || [])];
      setSectors(uniqueSectors as string[]);

      // Calcular estadísticas
      const now = new Date();
      const thisMonth = data.results?.filter((c: any) => {
        const createdAt = new Date(c.created_at);
        return createdAt.getMonth() === now.getMonth();
      }).length || 0;

      setStats({
        total: data.results?.length || 0,
        thisMonth,
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar empresas');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    fetchCompanies(searchTerm, sectorFilter);
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Empresas BD</h1>
          <p>Gestión centralizada de datos empresariales</p>
        </div>
        <button onClick={onLogout} className="btn-logout">
          Salir
        </button>
      </header>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Empresas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.thisMonth}</div>
          <div className="stat-label">Este Mes</div>
        </div>
      </div>

      <div className="dashboard-main">
        <div className="sidebar">
          <button
            onClick={() => {
              setShowForm(!showForm);
              setSelectedCompany(null);
            }}
            className="btn-new-company"
          >
            + Nueva Empresa
          </button>

          <div className="filters">
            <h3>Filtros</h3>

            <div className="search-box">
              <input
                type="text"
                placeholder="Buscar por nombre, RUT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button onClick={handleSearch} className="btn-search">
                Buscar
              </button>
            </div>

            <div className="filter-group">
              <label>Sector</label>
              <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)}>
                <option value="">Todos los sectores</option>
                {sectors.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
              <button onClick={handleSearch} className="btn-filter">
                Filtrar
              </button>
            </div>
          </div>
        </div>

        <div className="main-content">
          {showForm ? (
            <CompanyForm
              token={token}
              onSave={() => {
                setShowForm(false);
                setSelectedCompany(null);
                fetchCompanies(searchTerm, sectorFilter);
              }}
              onCancel={() => {
                setShowForm(false);
                setSelectedCompany(null);
              }}
              company={selectedCompany}
            />
          ) : (
            <>
              <CompanyTable
                companies={companies}
                loading={loading}
                onSelect={(company) => {
                  setSelectedCompany(company);
                  setShowForm(true);
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
