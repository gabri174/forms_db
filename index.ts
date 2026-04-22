// src/index.ts - Cloudflare Worker
/// <reference types="@cloudflare/workers-types" />
import { Router, json } from 'itty-router';

const router = Router();

// --- TIPOS ---
interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

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

// --- CORS CONFIG ---
// Al principio de index.ts, quita la URL fija y usa esto:
const getCorsHeaders = (env: Env) => ({
  'Access-Control-Allow-Origin': env.API_CORS_ORIGIN || '*', 
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
});

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

// Crear empresa
router.post('/api/companies', async (request, env: Env) => {
  const user = await verifyAuth(request, env);
  if (!user || user.role === 'viewer') return json({ error: 'No autorizado' }, { status: 403 });

  try {
    const data = await request.json();
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

// --- EXPORT DEFAULT (EL MOTOR) ---
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = getCorsHeaders(env);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const response = await router.handle(request, env);
      
      if (!response) {
        return new Response(JSON.stringify({ error: "Not Found" }), { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }

      // Inyectar CORS en la respuesta del router
      const finalResponse = new Response(response.body, response);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        finalResponse.headers.set(key, value);
      });

      return finalResponse;
    } catch (err: any) {
      return new Response(JSON.stringify({ error: "Server Error", details: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  },
};