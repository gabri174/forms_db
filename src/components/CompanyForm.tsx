// src/components/CompanyForm.tsx
import { useState, useEffect } from 'react';
import '../styles/form.css';

export default function CompanyForm({
  token,
  onSave,
  onCancel,
  company,
}: {
  token: string;
  onSave: () => void;
  onCancel: () => void;
  company?: any;
}) {
  const [formData, setFormData] = useState({
    nombre_comercial: '',
    razon_social: '',
    identificacion_fiscal: '',
    sector_industria: '',
    propuesta_valor: '',
    ubicacion: '',
    sitio_web: '',
    redes_sociales: { instagram: '', linkedin: '', facebook: '' },
    paleta_colores: { primario: '#0099CC', secundario: '#003366', acento: '#FFFFFF' },
    branding_notas: '',
    dueno_nombre_completo: '',
    dueno_documento_identidad: '',
    dueno_cargo: '',
    dueno_email: '',
    dueno_telefono: '',
    dueno_perfil_profesional: '',
    vision: '',
    mision: '',
    publico_objetivo: '',
    historial_marca: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('empresa');

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

  useEffect(() => {
    if (company) {
      setFormData({
        ...company,
        redes_sociales: company.redes_sociales || {},
        paleta_colores: company.paleta_colores || {},
      });
    }
  }, [company]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const method = company ? 'PUT' : 'POST';
      const url = company
        ? `${apiBase}/api/companies/${company.id}`
        : `${apiBase}/api/companies`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Error al guardar');
        return;
      }

      onSave();
    } catch (err: any) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    section?: string
  ) {
    const { name, value } = e.target;

    if (section === 'redes_sociales' || section === 'paleta_colores') {
      setFormData({
        ...formData,
        [section]: {
          ...formData[section as keyof typeof formData],
          [name]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>{company ? 'Editar Empresa' : 'Nueva Empresa'}</h2>
        <button onClick={onCancel} className="btn-close">
          ✕
        </button>
      </div>

      <div className="form-tabs">
        <button
          onClick={() => setActiveTab('empresa')}
          className={`tab ${activeTab === 'empresa' ? 'active' : ''}`}
        >
          Datos Empresa
        </button>
        <button
          onClick={() => setActiveTab('dueno')}
          className={`tab ${activeTab === 'dueno' ? 'active' : ''}`}
        >
          Datos Dueño
        </button>
        <button
          onClick={() => setActiveTab('contexto')}
          className={`tab ${activeTab === 'contexto' ? 'active' : ''}`}
        >
          Contexto
        </button>
      </div>

      <form onSubmit={handleSubmit} className="company-form">
        {error && <div className="error-message">{error}</div>}

        {activeTab === 'empresa' && (
          <div className="tab-content">
            <div className="form-row">
              <div className="form-group">
                <label>Nombre Comercial *</label>
                <input
                  type="text"
                  name="nombre_comercial"
                  value={formData.nombre_comercial}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Razón Social *</label>
                <input
                  type="text"
                  name="razon_social"
                  value={formData.razon_social}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>RUT/NIT/CIF *</label>
                <input
                  type="text"
                  name="identificacion_fiscal"
                  value={formData.identificacion_fiscal}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Sector/Industria *</label>
                <select
                  name="sector_industria"
                  value={formData.sector_industria}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecciona un sector</option>
                  <option>Tecnología</option>
                  <option>Eventos</option>
                  <option>Retail</option>
                  <option>Servicios</option>
                  <option>Educación</option>
                  <option>Salud</option>
                  <option>Otro</option>
                </select>
              </div>
            </div>

            <div className="form-group full">
              <label>Propuesta de Valor</label>
              <textarea
                name="propuesta_valor"
                value={formData.propuesta_valor}
                onChange={handleInputChange}
                rows={2}
              />
            </div>

            <div className="form-group full">
              <label>Ubicación *</label>
              <input
                type="text"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Sitio Web</label>
                <input
                  type="url"
                  name="sitio_web"
                  value={formData.sitio_web}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Redes Sociales</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Instagram</label>
                  <input
                    type="url"
                    name="instagram"
                    value={formData.redes_sociales.instagram}
                    onChange={(e) => handleInputChange(e, 'redes_sociales')}
                  />
                </div>
                <div className="form-group">
                  <label>LinkedIn</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.redes_sociales.linkedin}
                    onChange={(e) => handleInputChange(e, 'redes_sociales')}
                  />
                </div>
                <div className="form-group">
                  <label>Facebook</label>
                  <input
                    type="url"
                    name="facebook"
                    value={formData.redes_sociales.facebook}
                    onChange={(e) => handleInputChange(e, 'redes_sociales')}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Paleta de Colores</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Color Primario</label>
                  <input
                    type="color"
                    name="primario"
                    value={formData.paleta_colores.primario}
                    onChange={(e) => handleInputChange(e, 'paleta_colores')}
                  />
                </div>
                <div className="form-group">
                  <label>Color Secundario</label>
                  <input
                    type="color"
                    name="secundario"
                    value={formData.paleta_colores.secundario}
                    onChange={(e) => handleInputChange(e, 'paleta_colores')}
                  />
                </div>
                <div className="form-group">
                  <label>Color Acento</label>
                  <input
                    type="color"
                    name="acento"
                    value={formData.paleta_colores.acento}
                    onChange={(e) => handleInputChange(e, 'paleta_colores')}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dueno' && (
          <div className="tab-content">
            <div className="form-row">
              <div className="form-group">
                <label>Nombre Completo *</label>
                <input
                  type="text"
                  name="dueno_nombre_completo"
                  value={formData.dueno_nombre_completo}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Documento Identidad</label>
                <input
                  type="text"
                  name="dueno_documento_identidad"
                  value={formData.dueno_documento_identidad}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Cargo</label>
                <input
                  type="text"
                  name="dueno_cargo"
                  value={formData.dueno_cargo}
                  onChange={handleInputChange}
                  placeholder="Ej: CEO, Fundador"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="dueno_email"
                  value={formData.dueno_email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  name="dueno_telefono"
                  value={formData.dueno_telefono}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group full">
              <label>Perfil Profesional</label>
              <textarea
                name="dueno_perfil_profesional"
                value={formData.dueno_perfil_profesional}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>
        )}

        {activeTab === 'contexto' && (
          <div className="tab-content">
            <div className="form-group full">
              <label>Visión</label>
              <textarea
                name="vision"
                value={formData.vision}
                onChange={handleInputChange}
                rows={2}
              />
            </div>

            <div className="form-group full">
              <label>Misión</label>
              <textarea
                name="mision"
                value={formData.mision}
                onChange={handleInputChange}
                rows={2}
              />
            </div>

            <div className="form-group full">
              <label>Público Objetivo</label>
              <textarea
                name="publico_objetivo"
                value={formData.publico_objetivo}
                onChange={handleInputChange}
                rows={2}
              />
            </div>

            <div className="form-group full">
              <label>Historial de Marca</label>
              <textarea
                name="historial_marca"
                value={formData.historial_marca}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-save">
            {loading ? 'Guardando...' : 'Guardar Empresa'}
          </button>
        </div>
      </form>
    </div>
  );
}
