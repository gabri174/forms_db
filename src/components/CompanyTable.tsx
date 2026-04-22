// src/components/CompanyTable.tsx
import '../styles/table.css';

interface Company {
  id: string;
  nombre_comercial: string;
  razon_social: string;
  identificacion_fiscal: string;
  sector_industria: string;
  ubicacion: string;
  dueno_nombre_completo: string;
  created_at: string;
}

export default function CompanyTable({
  companies,
  loading,
  onSelect,
}: {
  companies: Company[];
  loading: boolean;
  onSelect: (company: Company) => void;
}) {
  if (loading) {
    return <div className="loading">Cargando empresas...</div>;
  }

  if (!companies || companies.length === 0) {
    return (
      <div className="empty-state">
        <p>No hay empresas registradas</p>
        <p className="empty-hint">Crea la primera empresa para comenzar</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="companies-table">
        <thead>
          <tr>
            <th>Nombre Comercial</th>
            <th>RUT/NIT</th>
            <th>Sector</th>
            <th>Dueño</th>
            <th>Ubicación</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id} className="table-row">
              <td className="cell-name">{company.nombre_comercial}</td>
              <td className="cell-id">{company.identificacion_fiscal}</td>
              <td className="cell-sector">{company.sector_industria}</td>
              <td>{company.dueno_nombre_completo}</td>
              <td className="cell-location">{company.ubicacion}</td>
              <td className="cell-date">
                {new Date(company.created_at).toLocaleDateString('es-ES')}
              </td>
              <td className="cell-actions">
                <button
                  onClick={() => onSelect(company)}
                  className="btn-edit"
                  title="Ver/Editar"
                >
                  ✎
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
