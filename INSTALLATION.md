# 📦 Installation et Configuration - Invoice Renamer

Guide complet pour installer et configurer Invoice Renamer.

---

## 🎯 Démarrage Ultra-Rapide (2 minutes)

### Pour les pressés

```bash
# 1. Copiez la config exemple
cp .env.example .env

# 2. Éditez .env et ajoutez votre clé API
nano .env  # ou vim, code, etc.

# 3. Lancez!
./start.sh
```

Rendez-vous sur http://localhost:3000 🎉

---

## 📋 Installation Détaillée

### Prérequis

#### Système
- **OS**: Linux, macOS ou Windows
- **RAM**: 2 GB minimum (4 GB recommandé)
- **Espace disque**: 500 MB

#### Logiciels
- **Node.js** 18.0.0 ou supérieur
- **npm** 9.0.0 ou supérieur

Vérifiez vos versions:
```bash
node --version  # Doit être >= v18.0.0
npm --version   # Doit être >= 9.0.0
```

Pas installé? Téléchargez depuis https://nodejs.org/

---

## 🔧 Configuration

### Option 1: Interface Web (Recommandé)

1. Lancez le serveur:
   ```bash
   ./start.sh
   ```

2. Ouvrez http://localhost:3000/settings.html

3. Configurez:
   - Provider préféré (OpenRouter ou LM Studio)
   - Modèle vision
   - Clé API (si OpenRouter)

### Option 2: Fichier .env

Créez `.env` à la racine du projet:

```bash
# Provider OpenRouter (cloud, recommandé)
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxx
OPENROUTER_MODEL=qwen/qwen3-vl-235b-a22b-instruct

# Provider LM Studio (local, optionnel)
LMSTUDIO_BASE_URL=http://localhost:1234/v1
LMSTUDIO_MODEL=qwen2-vl

# Optionnel
PORT=3000
DEBUG=false
```

---

## 🔑 Obtenir une Clé API OpenRouter

### Pourquoi OpenRouter?
- ✓ Accès à 10+ modèles vision de pointe
- ✓ Pas d'installation locale lourde
- ✓ Pricing transparent
- ✓ Excellent pour l'OCR thaïlandais

### Étapes

1. **Créez un compte**
   - Allez sur https://openrouter.ai/
   - Cliquez "Sign In" (Google/GitHub/Email)

2. **Ajoutez du crédit**
   - Minimum: $5 (≈ 500-1000 factures)
   - Méthodes: Carte, Crypto
   - Settings → Credits

3. **Créez une clé API**
   - Settings → Keys
   - "Create Key"
   - Copiez la clé (commence par `sk-or-v1-`)

4. **Configurez**
   ```bash
   export OPENROUTER_API_KEY='sk-or-v1-votre-clé'
   ```
   
   Ou dans `.env`:
   ```
   OPENROUTER_API_KEY=sk-or-v1-votre-clé
   ```

---

## 🏠 Alternative Locale: LM Studio

### Avantages
- ✓ Gratuit
- ✓ Pas besoin de connexion internet
- ✓ Données restent locales
- ✗ Plus lent
- ✗ Précision inférieure
- ✗ Nécessite GPU puissant

### Installation

1. **Téléchargez LM Studio**
   - https://lmstudio.ai/
   - Disponible pour Windows/Mac/Linux

2. **Chargez un modèle vision**
   - Dans LM Studio: "Search"
   - Recherchez: "qwen2-vl" ou "llava"
   - Téléchargez (ex: qwen2-vl-7b-instruct)

3. **Démarrez le serveur**
   - Onglet "Local Server"
   - Port: 1234 (défaut)
   - Click "Start Server"

4. **Configurez Invoice Renamer**
   Dans `.env`:
   ```
   LMSTUDIO_BASE_URL=http://localhost:1234/v1
   LMSTUDIO_MODEL=qwen2-vl-7b-instruct
   ```

   Ou dans l'interface web:
   - Settings → Provider: "LM Studio"

---

## 🚀 Lancement

### Linux/macOS
```bash
./start.sh
```

### Windows
```cmd
start.bat
```

### Manuellement
```bash
# Installer dépendances
npm install

# Compiler
npm run build

# Lancer serveur web
npm run web

# OU ligne de commande
npm run dev process fichier.pdf
```

---

## ✅ Vérification de l'Installation

### Test du serveur web

1. Lancez: `./start.sh`
2. Ouvrez: http://localhost:3000
3. Vérifiez l'indicateur de status (vert = OK)

### Test CLI

```bash
# Lister les providers disponibles
npm run dev providers

# Devrait afficher:
# Available providers: openrouter, lmstudio, mock
```

### Test de traitement

```bash
# Mode dry-run (ne renomme pas)
npm run dev process test.pdf --dry-run --verbose
```

---

## 🔍 Dépannage

### "Node.js not found"
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# macOS (Homebrew)
brew install node

# Windows
# Téléchargez l'installeur: https://nodejs.org/
```

### "OPENROUTER_API_KEY not found"
```bash
# Vérifiez la variable
echo $OPENROUTER_API_KEY

# Si vide, exportez-la
export OPENROUTER_API_KEY='votre-clé'

# Ou ajoutez dans .env
echo 'OPENROUTER_API_KEY=votre-clé' > .env
```

### "Port 3000 already in use"
```bash
# Tuez le processus
lsof -ti:3000 | xargs kill -9

# Ou changez le port dans .env
echo 'PORT=3001' >> .env
```

### "Module not found"
```bash
# Nettoyez et réinstallez
rm -rf node_modules package-lock.json
npm install
```

### "Build failed"
```bash
# Vérifiez TypeScript
npm run build

# Si erreurs, installez les dépendances dev
npm install --save-dev
```

### LM Studio ne se connecte pas
```bash
# Vérifiez que le serveur tourne
curl http://localhost:1234/v1/models

# Devrait retourner du JSON
# Si erreur: démarrez le serveur dans LM Studio
```

---

## 📁 Structure du Projet

```
tri/
├── src/               # Code source TypeScript
│   ├── cli.ts        # CLI principal
│   ├── server/       # Serveur web
│   ├── providers/    # Providers vision (OpenRouter, LM Studio)
│   ├── core/         # Logique traitement
│   └── utils/        # Utilitaires
├── public/           # Interface web
├── dist/             # Code compilé
├── .env              # Configuration (à créer)
├── start.sh          # Démarrage Linux/Mac
├── start.bat         # Démarrage Windows
└── README-DEMARRAGE.md  # Ce fichier
```

---

## 📊 Coûts (OpenRouter)

Estimation pour modèles recommandés:

| Modèle | Coût/image | Factures/$ |
|--------|------------|------------|
| Qwen3-VL-235B | ~$0.015 | ~65 |
| Qwen3-VL-30B | ~$0.008 | ~125 |
| Qwen2.5-VL-72B | ~$0.010 | ~100 |
| Gemini 2.5 Flash | ~$0.012 | ~85 |
| Claude Sonnet 4.5 | ~$0.025 | ~40 |

Pour 1000 factures:
- Budget: $10-25
- Temps: 30-60 minutes

LM Studio: **Gratuit** mais plus lent.

---

## 🆘 Support

### Documentation
- **Guide démarrage**: README-DEMARRAGE.md
- **Aide rapide**: QUICK-START.txt
- **Changelog**: CHANGELOG.md

### Problèmes
- Vérifiez les logs dans le terminal
- Mode verbose: `--verbose`
- GitHub Issues

---

**Installation terminée? Lancez `./start.sh` et commencez! 🎉**
