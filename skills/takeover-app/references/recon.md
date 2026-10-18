# P0 recon - the first hour in an unknown repo

Read only. The goal is a `.ai/takeover/recon.md` a stranger could act on: what the app
is built from, where requests enter, what it calls, where it talks to a model, how it
ships, and which settings it needs - every claim with a `file:line` or a command output.
Prefer `git ls-files` over a directory walk: it skips `node_modules`, build output and
anything ignored, which on a vibecoded repo is most of the disk.

**Env rule, before anything else:** names, never values. Never `cat`, `type`, `Get-Content`
or `grep` a `.env*` file for its content; never print `process.env` or `os.environ`. The
commands below extract variable NAMES only.

## 1. Stack and size

```
git ls-files | wc -l
git ls-files | sed -n 's/.*\.\([A-Za-z0-9]*\)$/\1/p' | sort | uniq -c | sort -rn | head -15
git log --oneline | wc -l
git log --format='%ad' --date=short | sort | sed -n '1p;$p'
git shortlog -sn --all | head -10
```

Then the manifests - each one names the ecosystem and its framework:

| Ecosystem | Manifest | Read for |
| --- | --- | --- |
| Node / TS | `package.json` (every one: `git ls-files '*package.json'`) | `scripts`, `dependencies` (framework: next, react, vue, svelte, express, fastify, nest, hono, remix, astro), `engines`, workspaces |
| .NET | `*.csproj`, `*.sln`, `global.json`, `Directory.Packages.props` | `TargetFramework`, `PackageReference` (AspNetCore, EntityFrameworkCore, Azure.*), project references |
| Python | `pyproject.toml`, `requirements*.txt`, `Pipfile`, `setup.cfg` | framework (django, fastapi, flask), ORM (sqlalchemy, django), python version |
| Java / Kotlin | `pom.xml`, `build.gradle(.kts)` | spring-boot starters, JPA/Hibernate, java version |
| Go | `go.mod` | module, router (gin, echo, chi), sql driver |

```
git ls-files '*package.json' | grep -v node_modules | xargs -I{} node -e "const p=require('./{}');console.log('{}',Object.keys({...p.dependencies,...p.devDependencies}).join(' '))"
git ls-files '*.csproj' | xargs grep -h '<PackageReference' | sed 's/.*Include="\([^"]*\)".*/\1/' | sort -u
git ls-files 'pyproject.toml' 'requirements*.txt' | xargs cat
```

Size per top-level directory (source only), the denominator P2's coverage will use:

```
git ls-files | grep -E '\.(ts|tsx|js|jsx|mjs|cs|py|java|kt|go|vue|svelte|sql)$' | cut -d/ -f1 | sort | uniq -c | sort -rn
```

## 2. Entry points, routes and API handlers

| Stack | Where routes live | Command |
| --- | --- | --- |
| Next.js app router | `app/**/page.tsx`, `app/**/route.ts` | `git ls-files \| grep -E '(^\|/)app/.*/(page\|route)\.(t\|j)sx?$'` |
| Next.js pages router | `pages/**`, `pages/api/**` | `git ls-files \| grep -E '(^\|/)pages/'` |
| Express / Fastify / Hono / Nest | `app.get(`, `router.post(`, `@Get(` | `git grep -nE "\.(get\|post\|put\|patch\|delete)\(\s*['\"]/\|@(Get\|Post\|Put\|Patch\|Delete)\("` |
| ASP.NET Core | controllers, minimal APIs | `git grep -nE '\[(Http(Get\|Post\|Put\|Patch\|Delete)\|Route)\b\|Map(Get\|Post\|Put\|Patch\|Delete)\('` |
| FastAPI / Flask / Django | decorators, `urls.py` | `git grep -nE '@(app\|router)\.(get\|post\|put\|patch\|delete)\(\|@app\.route\(\|path\(\|re_path\('` |
| Spring | annotations | `git grep -nE '@(Get\|Post\|Put\|Patch\|Delete\|Request)Mapping'` |
| Background work | cron, queues, webhooks | `git grep -nE 'cron\|schedule\|BackgroundService\|IHostedService\|celery\|bull\|queue\|webhook'` |

For each route record: method, path, handler `file:line`, and whether it checks a session
or role before it reads or writes (`auth`, `getServerSession`, `[Authorize]`,
`Depends(get_current_user)`, middleware matchers). An unauthenticated write is a P6 tier-0
candidate; note it now.

## 3. Outbound calls

```
git grep -nE "fetch\(|axios\.|got\(|ky\.|HttpClient|RestTemplate|WebClient|requests\.(get|post)|httpx\.|urllib|http\.NewRequest"
git grep -nE "https?://[a-zA-Z0-9.-]+\.[a-z]{2,}" -- ':!*.md' ':!*.lock' ':!package-lock.json' | grep -vE 'localhost|example\.com|schema|w3\.org'
```

Per call site: the host (or the env NAME that holds it), timeout set or not, retry or
not, and whether it runs on a request path. Payment, banking, e-mail and storage SDKs
count (`stripe`, `adyen`, `plaid`, `@sendgrid`, `nodemailer`, `@aws-sdk`, `@azure/storage-blob`).

## 4. LLM touchpoints

SDKs, wrappers, and raw HTTPS calls to model endpoints - vibecoded apps often have all three:

```
git grep -nE "from ['\"](openai|@anthropic-ai/sdk|@azure/openai|@google/generative-ai|@google/genai|ai|@ai-sdk/[a-z-]+|langchain|@langchain/[a-z-]+|llamaindex|cohere-ai|@mistralai/[a-z-]+|groq-sdk|ollama)['\"]"
git grep -nE "^(import|from) (openai|anthropic|langchain|llama_index|google\.generativeai|google\.genai|cohere|mistralai|litellm)"
git grep -nE "Azure\.AI\.OpenAI|OpenAIClient|ChatClient|Microsoft\.SemanticKernel|Microsoft\.Extensions\.AI"
git grep -nE "api\.openai\.com|api\.anthropic\.com|openai\.azure\.com|generativelanguage\.googleapis\.com|api\.mistral\.ai|api\.groq\.com|openrouter\.ai|/v1/chat/completions|/v1/messages|/openai/deployments/"
git grep -nE "chat\.completions\.create|messages\.create|responses\.create|generateText|streamText|generateObject|invoke\(|ChatOpenAI|ChatAnthropic"
```

Per touchpoint: `file:line`, provider and model (or the env NAME), what goes into the
prompt (user text? a customer record? - PII in a prompt is a money-privacy finding),
timeout and max tokens, retries, whether usage is logged or traced (`langfuse`,
`helicone`, `langsmith`, OpenTelemetry), and whether the key is server-side only (a key
behind `NEXT_PUBLIC_` / `VITE_` / `REACT_APP_` reaches the browser: tier 0).

## 5. Auth, persistence, migrations

```
git grep -nlE "next-auth|@auth/|@clerk/|@supabase/|firebase|auth0|passport|Microsoft\.Identity|AddAuthentication|AddJwtBearer|django\.contrib\.auth|fastapi_users|spring-boot-starter-security"
git ls-files | grep -iE '(^|/)(migrations?|prisma|drizzle|alembic|flyway|liquibase|supabase/migrations|Migrations)/' | cut -d/ -f1-3 | sort -u
git ls-files | grep -iE 'schema\.prisma|drizzle\.config|alembic\.ini|DbContext|knexfile|ormconfig|typeorm'
```

Record the engine, the ORM, whether migrations are versioned and how they run (a
`migrate` script, a startup hook, by hand), and money columns' types (`float`/`double`/
`real` for an amount is a money-privacy finding; `decimal`/`numeric`/integer cents is not).

## 6. CI and delivery

```
git ls-files | grep -E '^\.github/workflows/|azure-pipelines\.ya?ml$|\.gitlab-ci\.yml$|Jenkinsfile$|bitbucket-pipelines\.yml$|\.circleci/|Dockerfile|docker-compose|vercel\.json|netlify\.toml|fly\.toml|render\.yaml|app\.yaml|\.azure/|bicep|\.tf$'
```

Per pipeline: trigger, steps (lint, typecheck, test, build, deploy), whether a red check
blocks the merge (branch protection is not visible in the repo - say "unknown"), secret
scanning and dependency audit present or not, and where it deploys.

## 7. Environment variable NAMES

```
git ls-files | grep -E '(^|/)\.env[^/]*\.(example|sample|template)$|(^|/)\.env\.example$' | xargs -r grep -hoE '^[A-Z][A-Z0-9_]*' | sort -u
git grep -hoE "process\.env\.[A-Z][A-Z0-9_]*|import\.meta\.env\.[A-Z][A-Z0-9_]*|os\.environ(\.get)?\(['\"][A-Z][A-Z0-9_]*|os\.getenv\(['\"][A-Z][A-Z0-9_]*|Environment\.GetEnvironmentVariable\(\"[A-Z][A-Z0-9_]*|Configuration\[\"[A-Za-z0-9_:]*" | sed -E "s/.*[.(\[\"']//" | sort -u
git ls-files | grep -E '(^|/)\.env($|\.local$|\.production$|\.development$)'
```

The third command lists `.env` files that are TRACKED - each one is a finding (tier 0
`secret` if it holds a credential; check by the variable names in it, `git show
HEAD:<file> | cut -d= -f1`, never by printing it). Names the code reads that no example
file declares are a boot risk for P1.

## 8. Write it down

`.ai/takeover/recon.md`, sections in this order: Stack (one line + manifests), Size (per
root), Entry points (routes table), Outbound calls, LLM touchpoints, Auth and data, CI and
delivery, Env names (declared / read / undeclared), Early findings (each with `file:line`
and a provisional tier), and Unknowns (what recon could not settle, and which phase will).
