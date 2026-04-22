# 🚀 INSTRUCCIONES PARA WINDSURF — EMPRESAS BD
# Dominio: https://forms.ensupresencia.eu
# Tiempo estimado: 45-60 minutos

---

## ⚠️ ANTES DE EMPEZAR — SEGURIDAD

1. El archivo `.env` NUNCA va a Git (ya está en .gitignore)
2. Los secrets van SÓLO en Cloudflare Dashboard
3. NO commitear wrangler.toml con IDs reales (se ignora también)

---

## PASO 1 — INSTALAR DEPENDENCIAS (2 min)

Abre terminal en la raíz del proyecto y ejecuta:

```bash
npm install
```

---

## PASO 2 — CLOUDFLARE: CREAR BASE DE DATOS D1 (5 min)

### 2a. Login en Cloudflare
```bash
npx wrangler login
```
Se abrirá el navegador. Autoriza tu cuenta de Cloudflare.

### 2b. Crear la base de datos
```bash
npx wrangler d1 create empresas_db
```

Guarda el output. Verás algo así:
```
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 2c. Copiar el database_id
Abre el archivo `wrangler.toml` y reemplaza:
```
database_id = "tu_database_id_aqui"
```
por el ID real que te dio el comando anterior.

---

## PASO 3 — EJECUTAR SCHEMA SQL (3 min)

```bash
# Crear las tablas en producción
npx wrangler d1 execute empresas_db --file=./schema.sql

# Crear las tablas en local (para pruebas)
npx wrangler d1 execute empresas_db --local --file=./schema.sql
```

Deberías ver: `Successfully executed SQL`

---

## PASO 4 — CONFIGURAR VARIABLES DE ENTORNO (5 min)

### 4a. Crear archivo .env.local (NUNCA a Git)
Crea un archivo `.env.local` en la raíz con este contenido:

```
VITE_API_BASE_URL=http://localhost:8787
VITE_ENVIRONMENT=development
```

### 4b. Generar JWT Secret seguro
En terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Copia el resultado.

### 4c. Subir el JWT Secret a Cloudflare
```bash
npx wrangler secret put JWT_SECRET
```
Pega el valor cuando lo pida.

### 4d. Actualizar wrangler.toml
En el archivo `wrangler.toml`, actualiza también:
```toml
[vars]
JWT_SECRET = "TU_SECRET_AQUI"  ← reemplaza aquí también para local
API_CORS_ORIGIN = "https://forms.ensupresencia.eu"
```

---

## PASO 5 — PROBAR EN LOCAL (5 min)

### Terminal 1 — Backend (Worker)
```bash
npx wrangler dev src/index.ts --local
```
Debería correr en: http://localhost:8787

### Terminal 2 — Frontend (React)
```bash
npm run dev
```
Debería correr en: http://localhost:3000

### Probar que funciona:
Abre http://localhost:3000 en el navegador.
Deberías ver la pantalla de login.

---

## PASO 6 — CREAR EL PRIMER SUPERADMIN (3 min)

En el login, haz clic en "Crear SuperAdmin" y registra:
- Nombre: Tu nombre
- Email: tu@email.com
- Contraseña: (mínimo 8 caracteres, usa una segura)

Luego inicia sesión con esas credenciales.

---

## PASO 7 — SUBIR A GIT (5 min)

```bash
# Inicializar git (si no existe)
git init

# Verificar que .env NO aparece en los archivos
git status

# Añadir archivos (el .gitignore protege los secrets)
git add .

# Verificar qué se va a commitear (NO debe aparecer .env ni wrangler.toml con IDs)
git diff --cached --name-only

# Commit
git commit -m "feat: dashboard empresas BD con autenticación"

# Conectar con tu repo (reemplaza la URL)
git remote add origin https://github.com/TU_USUARIO/empresas-bd.git
git branch -M main
git push -u origin main
```

---

## PASO 8 — DEPLOY EN CLOUDFLARE (10 min)

### 8a. Build del frontend
```bash
npm run build
```

### 8b. Configurar Cloudflare Pages
1. Ve a https://dash.cloudflare.com
2. Selecciona tu cuenta
3. Ve a "Workers & Pages" → "Create application" → "Pages"
4. Conecta tu repositorio de Git
5. Configura:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
6. En "Environment variables" añade:
   - `VITE_API_BASE_URL` = `https://forms.ensupresencia.eu/api`
   - `VITE_ENVIRONMENT` = `production`

### 8c. Deploy del Worker (API backend)
```bash
npx wrangler deploy src/index.ts
```

---

## PASO 9 — CONFIGURAR SUBDOMINIO EN CLOUDFLARE (5 min)

1. Ve a https://dash.cloudflare.com
2. Selecciona el dominio `ensupresencia.eu`
3. Ve a "DNS" → "Add record"
4. Añade:
   ```
   Type: CNAME
   Name: forms
   Target: TU_PAGES_URL.pages.dev
   Proxy: ✅ (naranja)
   ```

5. En el Worker, ve a "Settings" → "Triggers" → "Add Custom Domain"
6. Añade: `forms.ensupresencia.eu`

---

## PASO 10 — VERIFICAR TODO (5 min)

1. Abre https://forms.ensupresencia.eu
2. Debería aparecer el login
3. Inicia sesión con el SuperAdmin
4. Crea una empresa de prueba
5. Verifica que aparece en la tabla

---

## 🔧 SOLUCIÓN DE PROBLEMAS COMUNES

### Error: "CORS blocked"
→ Verifica que `API_CORS_ORIGIN` en wrangler.toml sea exactamente `https://forms.ensupresencia.eu`

### Error: "Database not found"
→ Verifica que el `database_id` en wrangler.toml es correcto
→ Ejecuta de nuevo: `npx wrangler d1 execute empresas_db --file=./schema.sql`

### Error: "401 Unauthorized"
→ El token expiró. Cierra sesión e inicia de nuevo.

### Error: "Cannot POST /api/auth/login"
→ El Worker no está corriendo. Ejecuta: `npx wrangler dev src/index.ts --local`

### Error en build TypeScript
→ Ejecuta: `npm install` de nuevo
→ Verifica que no hay errores en los archivos .tsx

---

## 📁 ESTRUCTURA FINAL DEL PROYECTO

```
empresas-bd/
├── src/
│   ├── index.ts          ← Worker (API backend)
│   ├── main.tsx          ← Entrada React
│   ├── App.tsx           ← Router principal
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   └── DashboardPage.tsx
│   ├── components/
│   │   ├── CompanyTable.tsx
│   │   └── CompanyForm.tsx
│   └── styles/
│       ├── app.css
│       ├── login.css
│       ├── dashboard.css
│       ├── table.css
│       └── form.css
├── schema.sql            ← Estructura base de datos
├── wrangler.toml         ← Config Cloudflare Worker
├── vite.config.ts        ← Config frontend
├── package.json
├── tsconfig.json
├── index.html
├── .gitignore            ← Protege secrets
└── .env.example          ← Plantilla (sin valores reales)
```

---

## 🔐 RESUMEN DE SEGURIDAD

| Dónde          | Qué guardar                        |
|----------------|------------------------------------|
| `.env.local`   | Variables locales (NUNCA a Git)    |
| Cloudflare     | `JWT_SECRET`, `API_TOKEN`          |
| `wrangler.toml`| Solo `database_id` (no secrets)    |
| Git            | Solo código, NUNCA credentials     |

---

## ✅ CHECKLIST FINAL

- [ ] npm install ejecutado
- [ ] Base de datos D1 creada
- [ ] schema.sql ejecutado
- [ ] JWT_SECRET subido a Cloudflare
- [ ] .env.local creado (local, no en Git)
- [ ] Worker corriendo en local
- [ ] Frontend corriendo en local
- [ ] SuperAdmin creado
- [ ] Empresa de prueba creada
- [ ] Código en Git (sin secrets)
- [ ] Deploy en Cloudflare Pages
- [ ] DNS configurado en Cloudflare
- [ ] https://forms.ensupresencia.eu funciona

---

## 📋 PROMPT PARA WINDSURF

Copia y pega esto en Windsurf al abrir el proyecto:

---

"Tengo un proyecto React + Cloudflare Workers listo. Necesito que hagas lo siguiente en orden:

1. Ejecuta `npm install`
2. Ejecuta `npx wrangler login` y espera que me autentique
3. Ejecuta `npx wrangler d1 create empresas_db` y guarda el database_id
4. Actualiza `wrangler.toml` con el database_id real
5. Ejecuta `npx wrangler d1 execute empresas_db --file=./schema.sql`
6. Genera un JWT secret con `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
7. Crea el archivo `.env.local` con `VITE_API_BASE_URL=http://localhost:8787`
8. Actualiza el JWT_SECRET en wrangler.toml [vars]
9. Abre dos terminales: una con `npx wrangler dev src/index.ts --local` y otra con `npm run dev`
10. Abre el navegador en http://localhost:3000 para verificar

El proyecto es una base de datos de empresas con autenticación. El backend es un Cloudflare Worker en src/index.ts y el frontend es React en src/.

Si hay errores de TypeScript en src/index.ts, corrige las importaciones. El archivo principal del worker necesita el paquete 'itty-router': ejecuta `npm install itty-router` si falta."

---
