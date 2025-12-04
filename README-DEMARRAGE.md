# 🚀 Démarrage Rapide - Invoice Renamer

Ce guide vous permet de démarrer l'application en quelques minutes.

## 📋 Prérequis

- **Node.js** 18+ ([télécharger](https://nodejs.org/))
- **Clé API OpenRouter** (recommandé) ou **LM Studio** pour local

## ⚡ Démarrage en 1 commande

```bash
./start.sh
```

C'est tout! Le script fait automatiquement:
- ✓ Vérification de Node.js
- ✓ Installation des dépendances
- ✓ Compilation du projet
- ✓ Lancement du serveur web

## 🌐 Accéder à l'interface

Une fois démarré, ouvrez votre navigateur:

- **Interface principale**: http://localhost:3000
- **Paramètres**: http://localhost:3000/settings.html

## 🔑 Configuration de la clé API

### Option 1: Variable d'environnement (rapide)

```bash
export OPENROUTER_API_KEY='votre-clé-api-ici'
./start.sh
```

### Option 2: Fichier .env (permanent)

Créez un fichier `.env` dans le répertoire du projet:

```bash
OPENROUTER_API_KEY=votre-clé-api-ici
OPENROUTER_MODEL=qwen/qwen3-vl-235b-a22b-instruct
```

Puis lancez:
```bash
./start.sh
```

### Option 3: LM Studio (local, sans API)

1. Téléchargez [LM Studio](https://lmstudio.ai/)
2. Chargez un modèle vision (ex: LLaVA, Qwen-VL)
3. Démarrez le serveur local (port 1234)
4. Dans les paramètres web, sélectionnez "LM Studio"

## 📖 Utilisation

### Interface Web

1. Glissez-déposez vos PDFs ou ZIPs dans la zone
2. Le traitement démarre automatiquement
3. Téléchargez le ZIP avec les fichiers renommés

### CLI (ligne de commande)

```bash
# Traiter un seul fichier
npm run dev process facture.pdf

# Traiter un répertoire
npm run dev process ./dossier-factures/

# Traiter un ZIP
npm run dev process archive-factures.zip

# Avec options
npm run dev process factures.zip --provider openrouter --dry-run
```

## 🎯 Modèles recommandés

Les meilleurs modèles pour l'OCR de factures thaïlandaises:

| Modèle | Qualité | Vitesse | Coût |
|--------|---------|---------|------|
| **Qwen3-VL-235B** | ⭐⭐⭐⭐⭐ | ⭐⭐ | $$ |
| **Qwen3-VL-30B** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $ |
| **Qwen2.5-VL-72B** | ⭐⭐⭐⭐ | ⭐⭐⭐ | $ |
| **Gemini 2.5 Flash** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $$ |
| **Claude Sonnet 4.5** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | $$$ |

## 🔧 Dépannage

### Le serveur ne démarre pas

```bash
# Nettoyez et réinstallez
rm -rf node_modules dist
npm install
npm run build
./start.sh
```

### Erreur "OPENROUTER_API_KEY not found"

Vérifiez votre clé API:
```bash
echo $OPENROUTER_API_KEY
```

Si vide, exportez-la:
```bash
export OPENROUTER_API_KEY='votre-clé'
```

### Port 3000 déjà utilisé

Arrêtez le processus existant:
```bash
lsof -ti:3000 | xargs kill -9
```

Ou modifiez le port dans `src/server/index.ts` (ligne 15):
```typescript
const PORT = 3001; // Au lieu de 3000
```

## 📁 Structure des fichiers renommés

Format: `YYYY-MM-DD-NomFournisseur.pdf`

Exemples:
- `2025-11-15-7-Eleven.pdf`
- `2024-03-20-Makro.pdf`
- `2025-01-05-Lotus.pdf`

## 🛑 Arrêter le serveur

Appuyez sur `Ctrl+C` dans le terminal.

## 💡 Astuces

- **Traitement par lots**: Glissez un ZIP contenant plusieurs PDFs
- **Multi-pages**: Les PDFs multi-pages sont automatiquement découpés
- **Ère bouddhiste**: Les dates thaï (พ.ศ.) sont automatiquement converties
- **Retry**: Les fichiers échoués peuvent être relancés individuellement

## 📞 Support

- Documentation complète: Voir le README.md principal
- Issues: [GitHub Issues](https://github.com/votre-repo/issues)
- Exemples: Dossier `examples/`

---

**Bon traitement de factures! 🎉**
