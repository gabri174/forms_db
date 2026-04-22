// src/pages/PublicFormPage.tsx - Formulario público de registro de empresas
import { useState } from 'react';
import '../styles/public-form.css';

export default function PublicFormPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Datos de la Empresa
    nombre_comercial: '',
    razon_social: '',
    identificacion_fiscal: '',
    sector_industria: '',
    propuesta_valor: '',
    ubicacion: '',
    sitio_web: '',
    vision: '',
    mision: '',
    publico_objetivo: '',
    historial_marca: '',
    
    // Redes Sociales (JSON)
    instagram: '',
    linkedin: '',
    facebook: '',
    twitter: '',
    
    // Paleta de Colores (JSON)
    color_primario: '',
    color_secundario: '',
    color_terciario: '',
    
    // Notas de Branding
    branding_notas: '',
    
    // Datos del Dueño
    dueno_nombre_completo: '',
    dueno_documento_identidad: '',
    dueno_cargo: '',
    dueno_email: '',
    dueno_telefono: '',
    dueno_perfil_profesional: '',
  });

  const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || 'https://form-empresas-backend.crtv-technologies.workers.dev';

  const sectors = [
    'Tecnología',
    'Marketing Digital',
    'Consultoría',
    'E-commerce',
    'Educación',
    'Salud',
    'Alimentación',
    'Moda',
    'Servicios Profesionales',
    'Otro'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Preparar datos para enviar
      const payload = {
        nombre_comercial: formData.nombre_comercial,
        razon_social: formData.razon_social,
        identificacion_fiscal: formData.identificacion_fiscal,
        sector_industria: formData.sector_industria,
        propuesta_valor: formData.propuesta_valor,
        ubicacion: formData.ubicacion,
        sitio_web: formData.sitio_web,
        redes_sociales: {
          instagram: formData.instagram,
          linkedin: formData.linkedin,
          facebook: formData.facebook,
          twitter: formData.twitter,
        },
        paleta_colores: {
          primario: formData.color_primario,
          secundario: formData.color_secundario,
          terciario: formData.color_terciario,
        },
        branding_notas: formData.branding_notas,
        dueno_nombre_completo: formData.dueno_nombre_completo,
        dueno_documento_identidad: formData.dueno_documento_identidad,
        dueno_cargo: formData.dueno_cargo,
        dueno_email: formData.dueno_email,
        dueno_telefono: formData.dueno_telefono,
        dueno_perfil_profesional: formData.dueno_perfil_profesional,
        vision: formData.vision,
        mision: formData.mision,
        publico_objetivo: formData.publico_objetivo,
        historial_marca: formData.historial_marca,
      };

      const response = await fetch(`${apiBase}/api/public/register-company`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json() as any;

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar la empresa');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  if (success) {
    return (
      <div className="public-form-container">
        <div className="success-message">
          <h2>¡Registro Exitoso!</h2>
          <p>Tu empresa ha sido registrada correctamente en nuestra base de datos.</p>
          <p>Nos pondremos en contacto contigo pronto.</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Registrar Otra Empresa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="public-form-container">
      <div className="form-header">
        <h1>Registro de Empresa</h1>
        <p>Complete el formulario para registrar su empresa en nuestra base de datos</p>
        
        <div className="progress-bar">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Empresa</div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Marca</div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Dueño</div>
          <div className={`step ${step >= 4 ? 'active' : ''}`}>4. Contexto</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="public-form">
        {error && <div className="error-message">{error}</div>}

        {/* PASO 1: Datos de la Empresa */}
        {step === 1 && (
          <div className="form-section">
            <h3>Datos de la Empresa</h3>
            
            <div className="form-group">
              <label>Nombre Comercial *</label>
              <input
                type="text"
                name="nombre_comercial"
                value={formData.nombre_comercial}
                onChange={handleChange}
                placeholder="Nombre comercial de la empresa"
                required
              />
            </div>

            <div className="form-group">
              <label>Razón Social *</label>
              <input
                type="text"
                name="razon_social"
                value={formData.razon_social}
                onChange={handleChange}
                placeholder="Razón social legal"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Identificación Fiscal (CIF/NIF) *</label>
                <input
                  type="text"
                  name="identificacion_fiscal"
                  value={formData.identificacion_fiscal}
                  onChange={handleChange}
                  placeholder="B12345678"
                  required
                />
              </div>

              <div className="form-group">
                <label>Sector/Industria *</label>
                <select
                  name="sector_industria"
                  value={formData.sector_industria}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona un sector</option>
                  {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Ubicación *</label>
              <input
                type="text"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
                placeholder="Ciudad, País"
                required
              />
            </div>

            <div className="form-group">
              <label>Sitio Web</label>
              <input
                type="url"
                name="sitio_web"
                value={formData.sitio_web}
                onChange={handleChange}
                placeholder="https://www.ejemplo.com"
              />
            </div>

            <div className="form-group">
              <label>Propuesta de Valor</label>
              <textarea
                name="propuesta_valor"
                value={formData.propuesta_valor}
                onChange={handleChange}
                placeholder="¿Qué hace única a tu empresa?"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* PASO 2: Marca y Redes */}
        {step === 2 && (
          <div className="form-section">
            <h3>Marca y Presencia Digital</h3>
            
            <div className="form-group">
              <label>Redes Sociales</label>
              <div className="form-row">
                <input
                  type="url"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="Instagram URL"
                />
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="LinkedIn URL"
                />
              </div>
              <div className="form-row">
                <input
                  type="url"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  placeholder="Facebook URL"
                />
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="Twitter/X URL"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Paleta de Colores</label>
              <div className="form-row colors">
                <div>
                  <input
                    type="color"
                    name="color_primario"
                    value={formData.color_primario}
                    onChange={handleChange}
                  />
                  <small>Primario</small>
                </div>
                <div>
                  <input
                    type="color"
                    name="color_secundario"
                    value={formData.color_secundario}
                    onChange={handleChange}
                  />
                  <small>Secundario</small>
                </div>
                <div>
                  <input
                    type="color"
                    name="color_terciario"
                    value={formData.color_terciario}
                    onChange={handleChange}
                  />
                  <small>Terciario</small>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Notas sobre Branding</label>
              <textarea
                name="branding_notas"
                value={formData.branding_notas}
                onChange={handleChange}
                placeholder="Estilo de la marca, tipografías, elementos visuales..."
                rows={3}
              />
            </div>
          </div>
        )}

        {/* PASO 3: Datos del Dueño */}
        {step === 3 && (
          <div className="form-section">
            <h3>Datos del Representante Legal</h3>
            
            <div className="form-group">
              <label>Nombre Completo *</label>
              <input
                type="text"
                name="dueno_nombre_completo"
                value={formData.dueno_nombre_completo}
                onChange={handleChange}
                placeholder="Nombre y apellidos"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Documento de Identidad *</label>
                <input
                  type="text"
                  name="dueno_documento_identidad"
                  value={formData.dueno_documento_identidad}
                  onChange={handleChange}
                  placeholder="DNI/NIE"
                  required
                />
              </div>

              <div className="form-group">
                <label>Cargo</label>
                <input
                  type="text"
                  name="dueno_cargo"
                  value={formData.dueno_cargo}
                  onChange={handleChange}
                  placeholder="CEO, Director, etc."
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="dueno_email"
                  value={formData.dueno_email}
                  onChange={handleChange}
                  placeholder="email@ejemplo.com"
                />
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  name="dueno_telefono"
                  value={formData.dueno_telefono}
                  onChange={handleChange}
                  placeholder="+34 600 000 000"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Perfil Profesional</label>
              <textarea
                name="dueno_perfil_profesional"
                value={formData.dueno_perfil_profesional}
                onChange={handleChange}
                placeholder="Breve descripción profesional y experiencia"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* PASO 4: Contexto de la Marca */}
        {step === 4 && (
          <div className="form-section">
            <h3>Contexto de la Marca</h3>
            
            <div className="form-group">
              <label>Visión</label>
              <textarea
                name="vision"
                value={formData.vision}
                onChange={handleChange}
                placeholder="¿Hacia dónde quiere llegar la empresa?"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Misión</label>
              <textarea
                name="mision"
                value={formData.mision}
                onChange={handleChange}
                placeholder="¿Cuál es el propósito de la empresa?"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Público Objetivo</label>
              <textarea
                name="publico_objetivo"
                value={formData.publico_objetivo}
                onChange={handleChange}
                placeholder="¿Quiénes son tus clientes ideales?"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Historial de la Marca</label>
              <textarea
                name="historial_marca"
                value={formData.historial_marca}
                onChange={handleChange}
                placeholder="¿Cómo empezó la empresa? Hitos importantes..."
                rows={4}
              />
            </div>
          </div>
        )}

        {/* Navegación */}
        <div className="form-navigation">
          {step > 1 && (
            <button type="button" onClick={prevStep} className="btn-secondary">
              ← Anterior
            </button>
          )}
          
          {step < 4 ? (
            <button type="button" onClick={nextStep} className="btn-primary">
              Siguiente →
            </button>
          ) : (
            <button type="submit" disabled={loading} className="btn-primary btn-submit">
              {loading ? 'Enviando...' : 'Registrar Empresa'}
            </button>
          )}
        </div>

        <p className="form-note">* Campos obligatorios</p>
      </form>
    </div>
  );
}
