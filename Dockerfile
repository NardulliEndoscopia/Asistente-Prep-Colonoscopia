# ── Etapa 1: construir la app ──────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para el build)
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación para producción
# La variable GEMINI_API_KEY se inyecta en tiempo de ejecución, no en build.
# Para que vite pueda compilar sin error, pasamos un placeholder.
RUN GEMINI_API_KEY=placeholder npm run build

# ── Etapa 2: servidor de producción ────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Solo instalar dependencias de producción necesarias para el servidor
RUN npm install express dotenv --save

# Copiar los archivos compilados desde la etapa anterior
COPY --from=builder /app/dist ./dist

# Copiar el servidor Express
COPY server.cjs ./server.cjs

# Puerto que usa Cloud Run
EXPOSE 8080

# Arrancar el servidor
CMD ["node", "server.cjs"]
