# Usar imagen completa de Node (no alpine) para evitar problemas de compilación
FROM node:20 AS builder

WORKDIR /app

# Copiar package.json con dependencias limpias (sin better-sqlite3)
COPY package.json ./

# Instalar dependencias (sin package-lock para mayor flexibilidad)
RUN npm install --legacy-peer-deps

# Copiar código fuente
COPY . .

# Compilar la app - la clave API se inyecta aquí
ARG GEMINI_API_KEY=""
ENV GEMINI_API_KEY=$GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$GEMINI_API_KEY

RUN npm run build

# --- Servidor de producción (imagen ligera) ---
FROM node:20-slim AS runner

WORKDIR /app

# Solo instalar express para servir archivos
RUN npm install express

# Traer archivos compilados del builder
COPY --from=builder /app/dist ./dist
COPY server.cjs ./

EXPOSE 8080
CMD ["node", "server.cjs"]
