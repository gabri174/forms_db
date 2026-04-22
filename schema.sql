-- Tabla de Administradores/Usuarios
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin', 'viewer')),
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Empresas
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  -- 1. Datos de la Empresa
  nombre_comercial TEXT NOT NULL,
  razon_social TEXT NOT NULL,
  identificacion_fiscal TEXT NOT NULL UNIQUE,
  sector_industria TEXT NOT NULL,
  propuesta_valor TEXT,
  ubicacion TEXT NOT NULL,
  sitio_web TEXT,
  redes_sociales TEXT, -- JSON: {"instagram": "url", "linkedin": "url", ...}
  paleta_colores TEXT, -- JSON: {"primario": "#color", "secundario": "#color", ...}
  branding_notas TEXT,
  
  -- 2. Datos del Dueño
  dueno_nombre_completo TEXT NOT NULL,
  dueno_documento_identidad TEXT NOT NULL,
  dueno_cargo TEXT,
  dueno_email TEXT,
  dueno_telefono TEXT,
  dueno_perfil_profesional TEXT,
  
  -- 3. Información de Contexto
  vision TEXT,
  mision TEXT,
  publico_objetivo TEXT,
  historial_marca TEXT,
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT NOT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_companies_sector ON companies(sector_industria);
CREATE INDEX idx_companies_identificacion ON companies(identificacion_fiscal);
CREATE INDEX idx_companies_created_at ON companies(created_at DESC);
CREATE INDEX idx_users_email ON users(email);

-- Tabla de Auditoría (opcional pero recomendada para seguridad)
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details TEXT, -- JSON
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_created_at ON audit_log(created_at DESC);
