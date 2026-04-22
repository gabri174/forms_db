// src/index.ts - Cloudflare Worker
/// <reference types="@cloudflare/workers-types" />
import { AutoRouter, json, cors } from 'itty-router';

// --- TIPOS ---
interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  API_CORS_ORIGIN: string;
}

// CORS con el origen correcto
const { preflight, corsify } = cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
});

const router = AutoRouter({
  before: [preflight],
  finally: [corsify],
});

interface User {
  id: string;
  email: string;
  password_hash: string;
  role: 'superadmin' | 'admin' | 'viewer';
  name: string;
}

interface Company {
  id: string;
  nombre_comercial: string;
  razon_social: string;
  identificacion_fiscal: string;
  sector_industria: string;
  [key: string]: any;
}

interface CompanyData {
  nombre_comercial: string;
  razon_social: string;
  identificacion_fiscal: string;
  sector_industria: string;
  propuesta_valor?: string;
  ubicacion: string;
  sitio_web?: string;
  redes_sociales?: Record<string, string>;
  paleta_colores?: Record<string, string>;
  branding_notas?: string;
  dueno_nombre_completo: string;
  dueno_documento_identidad: string;
  dueno_cargo?: string;
  dueno_email?: string;
  dueno_telefono?: string;
  dueno_perfil_profesional?: string;
  vision?: string;
  mision?: string;
  publico_objetivo?: string;
  historial_marca?: string;
}

// --- HELPERS ---
async function verifyAuth(request: Request, env: Env): Promise<User | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload as User;
  } catch {
    return null;
  }
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const newHash = await hashPassword(password);
  return newHash === hash;
}

function generateJWT(user: User, secret: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400
  }));
  const signature = btoa(secret); 
  return `${header}.${payload}.${signature}`;
}

// --- RUTAS ---

// Registro inicial
router.post('/api/auth/register', async (request, env: Env) => {
  try {
    const { email, password, name } = await request.json();
    if (!email || !password || !name) return json({ error: 'Faltan campos' }, { status: 400 });

    const passwordHash = await hashPassword(password);
    await env.DB.prepare(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, "superadmin")'
    ).bind(email, passwordHash, name).run();

    return json({ success: true, message: 'SuperAdmin creado' }, { status: 201 });
  } catch (error: any) {
    if (error.message.includes('UNIQUE')) return json({ error: 'Email ya existe' }, { status: 409 });
    return json({ error: error.message }, { status: 500 });
  }
});

// Login
router.post('/api/auth/login', async (request, env: Env) => {
  try {
    const { email, password } = await request.json();
    const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first() as User;

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const token = generateJWT(user, env.JWT_SECRET);
    return json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } catch (error) {
    return json({ error: 'Error en login' }, { status: 500 });
  }
});

// Listar empresas
router.get('/api/companies', async (request, env: Env) => {
  const user = await verifyAuth(request, env);
  if (!user) return json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const sector = searchParams.get('sector');
  const search = searchParams.get('search');

  let query = 'SELECT * FROM companies WHERE 1=1';
  const params: any[] = [];

  if (sector) { query += ' AND sector_industria = ?'; params.push(sector); }
  if (search) { 
    query += ' AND (nombre_comercial LIKE ? OR razon_social LIKE ?)'; 
    params.push(`%${search}%`, `%${search}%`); 
  }

  const companies = await env.DB.prepare(query).bind(...params).all();
  return json(companies.results);
});

// Crear empresa (requiere auth)
router.post('/api/companies', async (request, env: Env) => {
  const user = await verifyAuth(request, env);
  if (!user || user.role === 'viewer') return json({ error: 'No autorizado' }, { status: 403 });

  try {
    const data = await request.json() as CompanyData;
    const result = await env.DB.prepare(
      `INSERT INTO companies (nombre_comercial, razon_social, identificacion_fiscal, sector_industria, ubicacion, dueno_nombre_completo, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      data.nombre_comercial, data.razon_social, data.identificacion_fiscal, 
      data.sector_industria, data.ubicacion, data.dueno_nombre_completo, user.id
    ).run();

    return json({ success: true, id: result.meta.last_row_id }, { status: 201 });
  } catch (e: any) {
    return json({ error: e.message }, { status: 500 });
  }
});

// Formulario público - Registrar empresa (sin autenticación)
router.post('/api/public/register-company', async (request, env: Env) => {
  try {
    const data = await request.json() as CompanyData;
    
    // Validar campos obligatorios
    const required: (keyof CompanyData)[] = ['nombre_comercial', 'razon_social', 'identificacion_fiscal', 'sector_industria', 'ubicacion', 'dueno_nombre_completo', 'dueno_documento_identidad'];
    for (const field of required) {
      if (!data[field]) {
        return json({ error: `Campo obligatorio faltante: ${field}` }, { status: 400 });
      }
    }

    const result = await env.DB.prepare(
      `INSERT INTO companies (
        nombre_comercial, razon_social, identificacion_fiscal, sector_industria, 
        propuesta_valor, ubicacion, sitio_web, redes_sociales, paleta_colores, branding_notas,
        dueno_nombre_completo, dueno_documento_identidad, dueno_cargo, dueno_email, dueno_telefono, dueno_perfil_profesional,
        vision, mision, publico_objetivo, historial_marca,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      data.nombre_comercial,
      data.razon_social,
      data.identificacion_fiscal,
      data.sector_industria,
      data.propuesta_valor || null,
      data.ubicacion,
      data.sitio_web || null,
      data.redes_sociales ? JSON.stringify(data.redes_sociales) : null,
      data.paleta_colores ? JSON.stringify(data.paleta_colores) : null,
      data.branding_notas || null,
      data.dueno_nombre_completo,
      data.dueno_documento_identidad,
      data.dueno_cargo || null,
      data.dueno_email || null,
      data.dueno_telefono || null,
      data.dueno_perfil_profesional || null,
      data.vision || null,
      data.mision || null,
      data.publico_objetivo || null,
      data.historial_marca || null,
      'system-public' // Usuario especial para formulario público
    ).run();

    return json({ 
      success: true, 
      message: 'Empresa registrada correctamente',
      id: result.meta.last_row_id 
    }, { status: 201 });
  } catch (e: any) {
    if (e.message.includes('UNIQUE constraint failed')) {
      return json({ error: 'Ya existe una empresa con esa identificación fiscal' }, { status: 409 });
    }
    return json({ error: e.message }, { status: 500 });
  }
});

// Health check
router.get('/api/health', () => json({ status: 'ok', timestamp: new Date().toISOString() }));

// --- EXPORT DEFAULT (AutoRouter maneja todo automáticamente) ---
export default router;