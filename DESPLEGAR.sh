#!/bin/bash
echo ""
echo "================================================"
echo "  DESPLIEGUE - Dr. Nardulli - Google Cloud Run"
echo "================================================"
echo ""
read -p "1. Pega tu clave GEMINI_API_KEY y pulsa Enter: " API_KEY
[[ -z "$API_KEY" ]] && echo "ERROR: clave vacía." && exit 1

read -p "2. Escribe tu Google Cloud Project ID y pulsa Enter: " PROJECT_ID
[[ -z "$PROJECT_ID" ]] && echo "ERROR: Project ID vacío." && exit 1

echo ""
echo "Configurando proyecto..."
gcloud config set project "$PROJECT_ID" || exit 1

echo ""
echo "Desplegando (5-8 minutos)..."
gcloud run deploy asistente-prep-colonoscopia \
  --source . \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --build-arg "GEMINI_API_KEY=$API_KEY" \
  --set-env-vars "GEMINI_API_KEY=$API_KEY" \
  --port 8080

echo ""
echo "✅ Listo. Abre la 'Service URL' de arriba en tu navegador."
