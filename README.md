# DeepAgent Control Center

Plateforme UI/UX (Next.js + TypeScript) pour piloter `deepagents` visuellement :
- exécution one-shot
- sessions en arrière-plan + logs
- gestion agents (catalogue, rôle, modèle, prompt système)
- gestion crons (expression, agent cible, prompt, run immédiat)
- gestion providers (catalogue de configuration)
- gestion templates (ajout/modification/suppression)
- réglages globaux (modèle, shell allow list, auto-approve)
- gestion threads et skills

## 1) Pré-requis
- Node.js 20+
- `deepagents` installé sur le serveur
- Variables d'environnement DeepAgents (API keys modèle)

## 2) Installation locale
```bash
npm install
cp .env.example .env.local
# définir ADMIN_PASSWORD
npm run dev
```

Ouvrir: http://localhost:3000

## 3) Build production
```bash
npm run build
npm run start
```

## 4) Déploiement Vercel
```bash
npm i -g vercel
vercel
vercel --prod
```
Configurer `ADMIN_PASSWORD` dans les variables d'environnement Vercel.

## 5) Sécurité
- Auth par mot de passe admin unique (`ADMIN_PASSWORD`)
- Cookie HTTP-only
- APIs protégées par middleware
- **Important**: mettre l'app derrière un accès restreint (IP allowlist, VPN ou SSO) en production critique
- Les commandes DeepAgents lancent des processus système : surveiller permissions et shell allow list

## 6) Structure
- `app/(protected)/dashboard` : pilotage principal
- `app/(protected)/templates` : CRUD templates
- `app/(protected)/settings` : paramètres globaux
- `app/(protected)/threads` : `deepagents threads`
- `app/(protected)/skills` : `deepagents skills`
- `app/api/**` : wrappers backend
- `data/*.json` : persistance locale

## 7) Limites MVP
- Sessions arrière-plan conservées en mémoire (redémarrage = reset)
- Cron scheduler en mémoire (parfait sur VPS `next start`; en Vercel serverless, comportement non garanti)
- Pas de RBAC multi-utilisateur
- parsing des sorties CLI principalement textuel
