#!/bin/bash
#
# Script de démarrage facile pour Invoice Renamer
# Lance l'interface web pour traiter les factures thaïlandaises
#

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║       Invoice Renamer - Démarrage de l'interface web        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Erreur: Node.js n'est pas installé"
    echo "   Installez Node.js depuis https://nodejs.org/"
    exit 1
fi

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ Erreur: npm n'est pas installé"
    exit 1
fi

echo "✓ Node.js $(node --version) détecté"
echo "✓ npm $(npm --version) détecté"
echo ""

# Vérifier si les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
    echo "✓ Dépendances installées"
    echo ""
fi

# Vérifier si le build existe
if [ ! -d "dist" ]; then
    echo "🔨 Compilation du projet..."
    npm run build
    echo "✓ Projet compilé"
    echo ""
fi

# Charger le fichier .env s'il existe (AVANT de vérifier la clé API)
if [ -f ".env" ]; then
    echo "✓ Chargement des variables d'environnement depuis .env"
    export $(grep -v '^#' .env | xargs)
    echo ""
fi

# Vérifier la clé API OpenRouter (APRÈS avoir chargé .env)
if [ -z "$OPENROUTER_API_KEY" ]; then
    echo "⚠️  ATTENTION: La variable OPENROUTER_API_KEY n'est pas définie"
    echo ""
    echo "   Pour utiliser OpenRouter (recommandé):"
    echo "   1. Obtenez une clé API sur https://openrouter.ai/"
    echo "   2. Exportez-la: export OPENROUTER_API_KEY='votre-clé'"
    echo ""
    echo "   Ou créez un fichier .env avec:"
    echo "   OPENROUTER_API_KEY=votre-clé-api"
    echo ""
    echo "   Alternative: Utilisez LM Studio en local (pas besoin de clé)"
    echo ""
    read -p "   Appuyez sur Entrée pour continuer quand même..."
    echo ""
fi

# Créer le répertoire temporaire si nécessaire
mkdir -p .temp/uploads

echo "🚀 Démarrage du serveur web..."
echo ""
echo "   Interface web: http://localhost:3000"
echo "   Page settings: http://localhost:3000/settings.html"
echo ""
echo "   Ctrl+C pour arrêter le serveur"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Lancer le serveur
npm run web
