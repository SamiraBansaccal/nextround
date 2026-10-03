# Phase 2 : « Bring your own AI » (chacun apporte son IA)

**But de la phase :** toutes les fonctionnalités d'IA des phases suivantes passent par **une seule couche**, qui sait avec quelle IA parler, qui paie, comment protéger les clés et comment survivre aux modèles faibles.

**À voir en ligne :** https://nextround-gamma.vercel.app/settings

## 1. Un seul client, au format « OpenAI-compatible »

`lib/ai/client.ts` parle le format **chat completions** d'OpenAI : `POST {base_url}/chat/completions` avec une clé et un nom de modèle. Presque tous les fournisseurs l'acceptent, donc une seule fonction suffit pour tous.

| Fournisseur | Base URL | Où elle a été vérifiée |
|---|---|---|
| OpenRouter | `https://openrouter.ai/api/v1` | Doc OpenRouter (quickstart) |
| OpenAI | `https://api.openai.com/v1` | SDK officiel `openai-node` (la doc web bloque les requêtes automatiques) |
| Mistral | `https://api.mistral.ai/v1` | Doc API Mistral |
| Groq | `https://api.groq.com/openai/v1` | Doc Groq « OpenAI compatibility » |

Les quatre exposent `GET /models`, vérifié : 401 sans clé, sauf OpenRouter qui est public. C'est ce qu'utilise le bouton **Load models** de la page Réglages.

Les erreurs du fournisseur sont transformées en **messages génériques** (`lib/ai/errors.ts`) : « clé refusée », « modèle inconnu », « trop de requêtes »… On ne montre et on ne journalise jamais la réponse brute, car certains fournisseurs y recopient une partie de la clé.

## 2. Qui paie ? (`lib/ai/config.ts`)

| Situation | IA utilisée | Limites |
|---|---|---|
| L'utilisateur a enregistré sa clé | **Sa** clé, son fournisseur, son modèle | Celles de son fournisseur ; NextRound n'en ajoute pas |
| Pas de clé, mais c'est **le propriétaire** (`OWNER_GITHUB_LOGIN`) | La clé de l'instance (OpenRouter, modèle gratuit) | 8 requêtes par minute, 40 par jour |
| Pas de clé, pas propriétaire | Aucune : « Add your AI key in Settings to use AI features » | — |

**La voix suit la même logique :** la clé ElevenLabs de l'utilisateur, sinon celle de l'instance pour le propriétaire, sinon la voix **du navigateur**, gratuite. Le mode vocal lui-même arrive en Phase 5.

Toutes les fonctionnalités appelleront `aiJson(ctx, { schema, system, user })` (`lib/ai/index.ts`). Elle choisit l'IA, applique les limites si c'est la clé de l'instance, et renvoie du JSON validé.

## 3. Les clés des utilisateurs

- **Chiffrées** avec AES-256-GCM (`lib/crypto.ts`). Chaque chiffrement tire un IV aléatoire, donc la même clé donne un résultat différent à chaque fois. Le « tag » GCM détecte toute modification : une valeur trafiquée en base ne se déchiffre pas.
- La clé de chiffrement est `APP_ENCRYPTION_KEY` (32 octets aléatoires, créée par `setup-env.mjs`). **Il ne faut jamais la changer** : les clés déjà enregistrées deviendraient illisibles.
- **Jamais renvoyées au navigateur.** Le serveur ne transmet que `PublicAiSettings` : le fournisseur, le modèle, « a une clé » et les **4 derniers caractères** (`••••a3F9`). Le texte en clair n'existe que côté serveur, au moment de l'appel.
- **Jamais journalisées :** aucun `console.log` de clé, et les erreurs sont génériques.
- Changer de fournisseur sans donner de nouvelle clé **efface** l'ancienne, qui appartenait à l'autre fournisseur.

## 4. « Custom base URL » désactivée sur l'instance publique

Si n'importe qui pouvait saisir une adresse, il pourrait faire appeler **par notre serveur** des machines internes, par exemple `http://169.254.169.254` (l'adresse des métadonnées d'un hébergeur cloud). C'est une attaque **SSRF**. Donc :

- seuls les 4 presets sont acceptés ;
- l'URL est **décidée par le serveur** à partir du nom du fournisseur ; celle envoyée par le navigateur est ignorée ;
- la vérification est faite **deux fois** : à l'enregistrement et à chaque appel (`assertAllowedBaseUrl`) ;
- un auto-hébergeur l'active avec `ALLOW_CUSTOM_LLM_BASE_URL=true`, par exemple pour Ollama sur `http://localhost:11434/v1`.

## 5. Survivre aux modèles faibles ou gratuits (`lib/ai/json.ts`)

1. On demande **uniquement du JSON**.
2. On extrait le JSON, même entouré de texte ou de balises ```` ```json ````.
3. On le **valide avec zod** : bons champs, bons types, listes non vides…
4. S'il n'est pas valide, on **relance une fois** en disant au modèle exactement ce qui ne va pas (« skills : la liste doit contenir au moins un élément »).
5. S'il échoue encore : « This model could not return valid output — try another model. »

La réponse du modèle est une **donnée non fiable** : elle est analysée et validée, jamais exécutée, et toujours affichée comme du texte.

## 6. Limites sur la clé de l'instance (`lib/ai/usage.ts`)

- **Pourquoi :** les modèles gratuits d'OpenRouter sont limités à 50 requêtes par jour pour le compte (doc OpenRouter). Avec 40 par jour et 8 par minute, on garde une marge.
- **Où :** les compteurs sont dans Postgres (table `usage_counters`, par utilisateur, par jour, par minute). Les limites tiennent même avec plusieurs serveurs Vercel en parallèle.
- **Pour qui :** seulement pour les appels faits avec les clés de l'instance. Chaque essai compte, relance comprise.

## 7. Le modèle par défaut de l'instance

Le 3 octobre 2026, OpenRouter listait 17 modèles gratuits. Trois candidats ont été testés avec une petite demande en JSON :

| Modèle | Résultat |
|---|---|
| `google/gemma-4-31b-it:free` | 429 : saturé chez le fournisseur |
| `qwen/qwen3.8-27b:free` | JSON valide en 1,0 s |
| `nvidia/nemotron-3-super-120b-a12b:free` | JSON valide en 0,6 s |

Choix : **Qwen par défaut, Nemotron en secours**. Le champ `models` d'OpenRouter essaie automatiquement le suivant si le premier échoue. On peut les changer sans toucher au code avec `INSTANCE_LLM_MODEL` et `INSTANCE_LLM_FALLBACK_MODELS`.

## 8. La page Réglages

| Élément | Fichier | Rôle |
|---|---|---|
| Page | `app/(app)/settings/page.tsx` | Lit les réglages publics et l'état de l'IA, et passe les actions aux composants |
| Actions serveur | `app/(app)/settings/actions.ts` | Enregistrer, tester, charger les modèles, retirer une clé. Chacune revérifie la session et valide l'entrée avec zod |
| Formulaire IA | `components/settings/ai-settings-form.tsx` | Fournisseur, modèle (avec liste), clé masquée, boutons **Save**, **Test connection** et **Remove key** |
| Formulaire voix | `components/settings/voice-settings-form.tsx` | Clé ElevenLabs facultative |
| Carte d'état | `components/ai/ai-status-card.tsx` | « Ta clé », « clé de l'instance » ou « Add your AI key in Settings… » ; aussi affichée sur le tableau de bord |

**Test connection** envoie une seule petite requête (« réponds OK ») avec l'IA que l'utilisateur utiliserait **vraiment**, y compris la clé de l'instance pour le propriétaire.

## 9. Les tests (`npm test` : 29 tests)

| Fichier | Ce qu'il vérifie |
|---|---|
| `tests/crypto.test.ts` | Aller-retour du chiffrement ; jamais de texte en clair ; IV différent à chaque fois ; valeur modifiée ou mauvaise clé refusée ; masquage aux 4 derniers caractères |
| `tests/ai-json.test.ts` | JSON valide du premier coup ; JSON entouré de texte ; **une** relance qui contient l'erreur ; abandon avec le bon message |
| `tests/ai-config.test.ts` | Sans clé, message « Add your AI key » ; repli du propriétaire sur la clé de l'instance ; priorité à la clé de l'utilisateur ; logique de la voix ; seuls les 4 derniers caractères sortent ; un autre utilisateur ne voit rien ; URL interne ou localhost refusée ; limite par minute et plafond par jour, remis à zéro le lendemain |
| `tests/isolation.test.ts` | (Phase 1) Isolation des données entre utilisateurs |

## 10. Reprendre le projet avec ses propres comptes

Le dépôt ne contient **aucune** valeur liée aux comptes de la personne à l'origine du projet : tout passe par des variables d'environnement. Le script `scripts/bootstrap.mjs` crée tout le stack sur **les comptes de la personne qui le lance** :

```bash
npm run bootstrap -- --owner <ton-login-github> --dry-run   # affiche les commandes sans rien faire
npm run bootstrap -- --owner <ton-login-github>             # les exécute
```

Il fait : `stripe projects init`, les 11 `stripe projects add`, `env --pull`, `setup-env`, la migration, l'activation de GitHub chez Clerk, puis l'envoi des variables et le déploiement sur Vercel. Les étapes déjà faites sont sautées, donc on peut le relancer sans risque.

Par défaut, chaque fournisseur **affiche ses conditions** et c'est la personne qui accepte. `--accept-tos` les accepte sans demander.

**Ce qui a été testé :** le mode `--dry-run`, sur un clone neuf (tout est à créer) et sur le projet de référence (tout est sauté). Sur un clone neuf, Stripe Projects répond bien « aucun projet », et `init --preflight` passe. L'exécution complète sur un second jeu de comptes est prévue en Phase 8.

## 11. Limites connues

- La clé ElevenLabs n'est pas testée à l'enregistrement : elle le sera avec le mode vocal (Phase 5).
- Avec une URL personnalisée (Ollama), le champ clé est obligatoire : on peut y mettre n'importe quel texte.
- Les modèles gratuits peuvent être saturés (429). Le modèle de secours limite le problème sans le supprimer.
