# Changelog - Invoice Renamer

## [Unreleased] - 2025-12-04

### ✨ Ajouté
- **Scripts de démarrage faciles**
  - `start.sh` pour Linux/macOS avec vérifications automatiques
  - `start.bat` pour Windows
  - `README-DEMARRAGE.md` guide complet en français
  - `QUICK-START.txt` aide-mémoire rapide
  - `.env.example` template de configuration

### 🔧 Améliorations critiques
- **Nettoyage des fichiers temporaires**
  - Les PNG temporaires utilisent maintenant `os.tmpdir()`
  - Cleanup automatique après conversion (même en cas d'erreur)
  - Élimine la fuite mémoire/disque

- **Timeout API**
  - Ajout de `AbortSignal.timeout(60000)` sur tous les appels API
  - Empêche les requêtes de bloquer indéfiniment
  - Appliqué à OpenRouter et LM Studio

- **Refactoring des providers**
  - Nouvelle classe `OpenAICompatibleProvider` pour mutualiser le code
  - Réduction de 95% de duplication entre OpenRouter et LM Studio
  - OpenRouterProvider: 322 lignes → 65 lignes (-80%)
  - LMStudioProvider: 309 lignes → 51 lignes (-83%)
  - Code plus maintenable et corrections facilitées

- **Validation des dates améliorée**
  - Ajout de validation avec `Date` constructor
  - Détection des dates invalides (ex: 30 février, 13e mois)
  - Messages d'erreur plus clairs

### 📦 Modèles mis à jour
- **Nouveaux modèles disponibles** (OpenRouter)
  - Qwen3-VL-235B (meilleur pour OCR, nouveau défaut)
  - Qwen3-VL-30B (rapide et précis)
  - Gemini 2.5 Flash (très rapide)
  - Gemini 3 Pro (dernière version Google)
  - Claude Sonnet 4.5 (haute qualité)
  - Claude Haiku 4.5 (rapide)
  - GPT-5.1 (dernier OpenAI)

- **Ancien défaut maintenu**
  - Qwen2.5-VL-72B toujours disponible (éprouvé pour thaï)

### 🐛 Corrections
- Correction des types manquants `@types/jest`
- Amélioration de la gestion d'erreurs API
- Validation stricte des réponses JSON

### 📊 Métriques
- Lignes de code: ~2054 → ~1850 (-10%)
- Couverture de tests: 7/7 passent
- Build: ✓ Sans erreurs
- Qualité TypeScript: Strict mode complet

### 🔒 Sécurité
- Validation des dates côté serveur
- Cleanup automatique des fichiers temp
- Timeout sur toutes les requêtes réseau

---

## Comment démarrer

### Linux/macOS
```bash
./start.sh
```

### Windows
```cmd
start.bat
```

Consultez `README-DEMARRAGE.md` pour le guide complet.
