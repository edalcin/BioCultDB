# Integração BioCultTermos → BioCultDB (Unidade de Fontes Secundárias)

> Documento de referência para o agente de IA (Claude) que implementará esta integração.
> Produzido em sessão de `grill-with-docs` (grilling + domain modeling) em 2026-07-12.
> **Nenhum código foi alterado ao produzir este documento** — é plano, não implementação.
>
> Decisão arquitetural de origem: `Arquitetura-BioCultural/docs/architecture-decisions/ADR-004` e `ADR-005`.
> Decisão operacional desta integração: `BioCultDB/docs/decisions/ADR-001-integracao-bioculttermos.md`
> (leia primeiro — este documento é o checklist executável dela).

## 1. O que já existe (não reinventar)

Uma sessão anterior já construiu o scaffold técnico completo da unidade dual-app. **Isto já existe no
repositório, testado localmente, mas nunca publicado/deployado em produção**:

| Arquivo | Papel |
|---|---|
| `docker/Dockerfile.unidade` | Build multi-stage: compila BioCultDB + BioCultTermos (submodule), imagem final `node:20-alpine`, non-root `nodejs` (uid 1001), `dumb-init` como PID 1 |
| `docker/docker-compose.unidade.yml` | Compose de exemplo/dev com as 5 portas e envs de exemplo (**valores de exemplo não usáveis direto em produção, ver §3**) |
| `docker/start-unit.sh` | Entrypoint: sobe `biocultdb/backend/src/server.js` e `bioculttermos/backend/src/start.js` como processos irmãos, forwarda `SIGTERM`, fail-fast (se um crash, derruba o outro) |
| `bioculttermos/` (git submodule → `github.com/edalcin/BioCultTermos`) | Código real: SKOS-XL, servidor público (4000, sem auth) + admin (4001, HTTP Basic + bcrypt), `AcquisitionService` que lê `biocultdb_records` do mesmo arquivo SQLite |

O que falta é **conectar esse scaffold à produção real** — é isso que este documento planeja.

## 2. Estado atual de produção (confirmado nesta sessão)

Container Unraid `BioCultDB` (renomeado de `etnoDB`), rodando ao vivo em `192.168.1.10`:

```bash
docker run -d --name='BioCultDB' --net='bridge' --pids-limit 2048 \
  -e TZ="America/Sao_Paulo" \
  -e HOST_OS="Unraid" -e HOST_HOSTNAME="Asilo" -e HOST_CONTAINERNAME="BioCultDB" \
  -e 'NODE_ENV'='production' \
  -e 'SQLITE_DB_PATH'='/data/biocultdb.sqlite' \
  -l net.unraid.docker.managed=dockerman \
  -l net.unraid.docker.webui='http://192.168.1.10:3093' \
  -l net.unraid.docker.icon='https://raw.githubusercontent.com/edalcin/etnoDB/main/docs/etnodbLogoTrans300.png' \
  -p '3091:3001/tcp' -p '3092:3002/tcp' -p '3093:3003/tcp' \
  -v '/mnt/user/Storage/appsdata/biocultdb/data/':'/data':'rw' \
  'ghcr.io/edalcin/biocultdb:latest'
```

- Imagem `ghcr.io/edalcin/biocultdb:latest` publicada por `.github/workflows/docker-publish.yml` a partir de
  `docker/Dockerfile` — **single-app, sem submodule, sem BioCultTermos**.
- `SQLITE_DB_PATH=/data/biocultdb.sqlite` — arquivo real, populado com referências, comunidades, plantas.
- Zero autenticação em qualquer porta (3091/3092/3093). Controle só por firewall/rede do Unraid.
- Volume bind mount `/mnt/user/Storage/appsdata/biocultdb/data/` → `/data` (**não** `/mnt/user/appdata/...`
  como o `docs/UNRAID_INSTALLATION.md` genérico sugere — esse doc está desatualizado quanto ao path real).

## 3. Decisões tomadas (grilling 2026-07-12)

Resumo executável — a justificativa completa de cada uma está na ADR-001. Onde o scaffold existente
(`docker-compose.unidade.yml`) usa um valor de **exemplo** que diverge da decisão real, isso está marcado.

| Decisão | Valor | Nota |
|---|---|---|
| Caminho do SQLite | `SQLITE_DB_PATH=/data/biocultdb.sqlite` | **Diverge do exemplo no compose** (`/data/unidade.sqlite`). Não renomear o arquivo. |
| Autenticação BioCultTermos admin | `ADMIN_USERNAME` + `ADMIN_PASSWORD` | **Diverge do exemplo no compose** (`ADMIN_USERS` JSON bcrypt). Ver `bioculttermos/backend/src/config/index.js:22-28` — ambos os formatos são suportados pelo código, só a escolha operacional muda. |
| Dados iniciais BioCultTermos | Tabelas `etnotermos_*` vazias no boot | Sem migração — vocabulário candidato nasce do `AcquisitionService` lendo `biocultdb_records` já populado. |
| Mapeamento de portas existentes | `3091:3001`, `3092:3002`, `3093:3003` | Mantido, sem mudança. |
| Mapeamento de portas novas | `4000:4000`, `4001:4001` | Sem offset — igual interno e externo. |
| Publicação da imagem | `ghcr.io/edalcin/biocultdb:latest` passa a ser a imagem dual-app | Sem tag/imagem legada paralela. `docker/Dockerfile` (single-app) vira dev-only, não é mais usado para deploy. |
| Estratégia de corte | Substituição in-place do container `BioCultDB` | Backup do arquivo antes, indisponibilidade de segundos/minutos aceitável. |
| Primeira aquisição de termos | Automática (cron 3h ou disparo manual pós-deploy) | `ACQUISITION_CRON_SCHEDULE` default `0 3 * * *`, não precisa setar. |
| Auth do BioCultDB (3001/3002) | **Fora de escopo**, não muda | Decisão futura separada, se necessária. |
| Repositório BioCultTermos standalone | Congelado como produto | Continua recebendo commits **via o submodule** (mecânica de git), mas não é mais desenvolvido/deployado isoladamente — ver §7. |

## 4. Mudanças necessárias (passo a passo)

### 4.1 CI/CD — `.github/workflows/docker-publish.yml`

Estado atual (`docker-publish.yml:22-23,50-51`): `actions/checkout@v4` sem `submodules`, build com
`file: ./docker/Dockerfile`.

Mudar para:

1. `actions/checkout@v4` com `submodules: recursive` (o submodule `bioculttermos` já está pushado em
   `github.com/edalcin/BioCultTermos`, checkout público funciona sem credencial extra).
2. `docker/build-push-action@v5` com `file: ./docker/Dockerfile.unidade` (em vez de `./docker/Dockerfile`).
3. Manter `context: .` (o Dockerfile.unidade já assume contexto = raiz do repo, incluindo `bioculttermos/`).
4. Manter a mesma tag `ghcr.io/edalcin/biocultdb:latest` — não criar imagem/tag paralela.
5. Verificar o passo "Image size check" (`docker-publish.yml:60-64`) continua fazendo sentido — a imagem
   dual-app é maior que a single-app (dois `node_modules`, dois CSS compilados); não é motivo para
   reverter a decisão, só para calibrar expectativa de tamanho.

### 4.2 Recriação do container em produção (Unraid)

Pré-requisito: a imagem `ghcr.io/edalcin/biocultdb:latest` já publicada pelo CI atualizado (§4.1).

1. **Backup**: copiar `biocultdb.sqlite` (e `biocultdb.sqlite-wal`/`-shm` se existirem, modo WAL) de
   `/mnt/user/Storage/appsdata/biocultdb/data/` para um local de backup, com o container ainda rodando
   (WAL permite cópia a quente) ou parado (mais seguro, escolha do operador).
2. **Registrar o digest da imagem atual** (ponto de rollback, já que `:latest` é uma tag flutuante):
   ```bash
   docker inspect BioCultDB --format='{{.Image}}'
   ```
   Guardar esse digest. Se o corte falhar, o rollback é recriar o container apontando para ESSE digest
   específico, não para `:latest` (que já vai apontar para a imagem nova, ruim).
3. **Parar e remover** o container `BioCultDB` atual (o volume bind mount preserva os dados, intocado).
4. **Recriar** o container (via interface Unraid ou `docker run` equivalente) com:
   - Mesma imagem: `ghcr.io/edalcin/biocultdb:latest` (agora dual-app)
   - Mesmo nome, rede, volume, `TZ`, `HOST_*` labels
   - Mesmas env vars existentes: `NODE_ENV=production`, `SQLITE_DB_PATH=/data/biocultdb.sqlite`
   - **+2 env vars novas**: `ADMIN_USERNAME=etnotermos`, `ADMIN_PASSWORD=<senha real, nunca commitar>`
   - **+2 portas novas**: `4000:4000/tcp`, `4001:4001/tcp`
   - Atualizar o label `net.unraid.docker.icon`/`webui` se desejado (opcional, cosmético)
5. **Subir** o container.
6. **Verificar saúde**:
   - `curl http://192.168.1.10:3093/health` → BioCultDB (Apresentação) — inalterado, já funcionava
   - `curl http://192.168.1.10:4000/health` → BioCultTermos público
   - `curl -u etnotermos:<senha> http://192.168.1.10:4001/health` → BioCultTermos admin (espera 200; sem
     credencial espera 401)
   - Checar logs do container por `[start-unit] Starting BioCultDB...` e `[start-unit] Starting
     BioCultTermos...` (ambos os processos subiram)
7. **Disparar a primeira aquisição** manualmente (não esperar até 3h):
   ```bash
   curl -u etnotermos:<senha> -X POST http://192.168.1.10:4001/acquisition/run
   ```
   Confirmar em `GET /acquisition/status` (ou na dashboard admin) que termos `candidate` foram criados a
   partir dos registros já existentes em `biocultdb_records`.
8. **Rollback** (se necessário, a qualquer ponto após o passo 3): recriar o container `BioCultDB` com a
   imagem do digest registrado no passo 2, envs/portas antigas (sem as 2 novas), volume intocado — os
   dados do BioCultDB nunca foram tocados, só a imagem/portas/env mudam.

### 4.3 O que NÃO muda

- `docker/Dockerfile` e `docker/docker-compose.yml` (single-app) continuam existindo, como conveniência
  de desenvolvimento local do BioCultDB isolado (sem precisar inicializar o submodule). Não são mais
  usados para build de produção.
- Nenhuma alteração em `backend/src/shared/database.js` do BioCultDB nem no schema `biocultdb_records` —
  o BioCultTermos só lê essa tabela, nunca escreve (`bioculttermos/backend/src/shared/database.js:9-12`).
- Nenhuma autenticação adicionada às portas 3001/3002 (3091/3092 externas) do BioCultDB — fora de escopo
  (ADR-001, item 8).

## 5. Verificação pós-corte (checklist de aceite)

- [ ] `docker logs BioCultDB` mostra ambos os processos subindo sem erro (`server.js` e `start.js`)
- [ ] `GET :3093/` (Apresentação) continua respondendo normalmente — nenhuma regressão no BioCultDB
- [ ] `GET :3091/` e `:3092/` (Aquisição/Curadoria) continuam respondendo normalmente
- [ ] `GET :4000/health` responde `{"status":"ok","service":"public","port":4000}`
- [ ] `GET :4001/health` sem credencial → `401`; com credencial correta → `200`
- [ ] Após `POST :4001/acquisition/run`, existem linhas em `etnotermos` com `status='candidate'`
      (verificável via dashboard admin `:4001/` ou consulta direta ao arquivo `biocultdb.sqlite`)
- [ ] `PRAGMA table_info` / `sqlite_master` mostram `biocultdb_records*` e `etnotermos*` coexistindo no
      mesmo arquivo (ver nota de bug conhecido em §8)
- [ ] Reiniciar o container (`docker restart BioCultDB`) não gera `duplicate column name` nem qualquer erro
      de schema (ver §8 — bug já corrigido, mas é o cenário que o expôs)

## 6. Backup e recuperação operacional

- Backup = copiar o arquivo `/mnt/user/Storage/appsdata/biocultdb/data/biocultdb.sqlite` (mais os
  arquivos `-wal`/`-shm` se o container estiver rodando em modo WAL no momento da cópia). Um único
  arquivo cobre BioCultDB **e** BioCultTermos agora — não há mais dois backups separados a coordenar.
- Recomendação: script de backup periódico (cron do host Unraid, fora do container) fazendo
  `sqlite3 biocultdb.sqlite ".backup backup-$(date +%F).sqlite"` (backup consistente mesmo com o banco
  em uso, via API nativa do SQLite) — não implementado nesta sessão, fica como próximo passo operacional
  sugerido, não bloqueante para o corte.

## 7. Fluxo de desenvolvimento do submodule (daqui para frente)

O repositório `BioCultTermos` (`github.com/edalcin/BioCultTermos`) fica **congelado como produto**:
ninguém mais roda `BioCultTermos/docker/docker-compose.yml` (single-service standalone) nem trata esse
repo como uma entrega independente com seu próprio roadmap/release.

Isso **não** significa que o repositório para de receber commits — por mecânica de git submodule, ele
continua sendo o remoto de onde o código de `BioCultDB/bioculttermos/` vem. O fluxo correto para qualquer
mudança futura no BioCultTermos:

```bash
cd BioCultDB/bioculttermos
# editar código normalmente
git add -A && git commit -m "..."
git push origin main            # vai para github.com/edalcin/BioCultTermos

cd ..                           # volta para a raiz do BioCultDB
git add bioculttermos           # registra o novo SHA do submodule
git commit -m "chore: bump bioculttermos submodule to <sha curto>"
git push origin main            # CI (docker-publish.yml) builda a imagem com o código novo
```

Nenhum desenvolvimento deve ser feito clonando `BioCultTermos` separadamente fora de `BioCultDB/bioculttermos/`
— isso divergiria do commit pinado pelo submodule sem ninguém perceber.

## 8. Bug conhecido já corrigido (contexto para o implementador)

`shared/database.js` de ambos os projetos (BioCultDB e BioCultTermos) tem uma função
`ensureGeneratedColumn` (`bioculttermos/backend/src/shared/database.js:91-104`) que existe por causa de
um bug real encontrado durante a migração v3.1: `PRAGMA table_info()` **não reflete** colunas
`GENERATED ALWAYS AS (...) VIRTUAL` adicionadas via `ALTER TABLE` (confirmado em SQLite 3.49.2 /
better-sqlite3 11.x — `sqlite_master.sql` tem a coluna, `table_info` não lista). Isso causava
`duplicate column name` em toda segunda conexão ao mesmo arquivo (restart do servidor, ou — relevante
aqui — os dois apps abrindo o mesmo arquivo em sequência). O fix já está em produção nos dois repos:
detectar a coluna via `try/catch` na própria `ALTER TABLE`, não via `table_info`. Não precisa reabrir
esse problema; só é relevante saber que ele existiu, porque o cenário desta integração (duas aplicações
abrindo o mesmo arquivo, cada uma criando seu próprio schema no boot) é exatamente o que o expôs
originalmente.

## 9. Fora de escopo (não implementar sem novo pedido explícito)

- Autenticação nas portas 3001/3002 (3091/3092 externas) do BioCultDB.
- Migração/importação de dados de uma instância standalone do BioCultTermos (não existe nenhuma em
  produção hoje).
- Integração com BioCultRelatos (padrão análogo, mas BioCultRelatos ainda está em fase inicial de
  desenvolvimento — ver `Arquitetura-BioCultural/README.md:251-272`). Quando o código do BioCultRelatos
  existir, este documento serve de modelo, mas a unidade "Comunidade Tradicional" é um container
  diferente, com seu próprio arquivo SQLite — não o mesmo `biocultdb.sqlite`.
- Script de backup automatizado (mencionado em §6 como sugestão, não como requisito desta integração).
- Multi-usuário admin no BioCultTermos (`ADMIN_USERS`) — hoje um único usuário (`ADMIN_USERNAME`/`ADMIN_PASSWORD`)
  é suficiente; migrar para `ADMIN_USERS` é reversível e trivial no futuro se necessário.

## 10. Glossário

| Termo | Significado |
|---|---|
| **Unidade Federada** | Unidade de implantação da Arquitetura BioCultural v3.1: um container, um arquivo SQLite compartilhado, uma ou mais ferramentas (ex.: BioCultDB + BioCultTermos = "Unidade de Fontes Secundárias"). Definido em ADR-004/ADR-005. |
| **`SQLITE_DB_PATH`** | Env var que aponta para o arquivo SQLite compartilhado dentro do container (`/data/biocultdb.sqlite` em produção). Lida por ambas as ferramentas. |
| **WAL (Write-Ahead Logging)** | Modo de journal do SQLite (`journal_mode=WAL`) que permite leitores não bloquearem escritores — necessário porque duas aplicações (BioCultDB e BioCultTermos) escrevem no mesmo arquivo. |
| **JSON1 / `json_extract`** | Extensão SQLite para armazenar/consultar documentos JSON em colunas `TEXT`; base do modelo de dados de ambas as ferramentas (ADR-005 DA2). |
| **Coluna gerada (`GENERATED ALWAYS AS ... VIRTUAL`)** | Coluna calculada a partir do JSON (`doc`) para permitir índice/filtro sem reprocessar o JSON inteiro a cada query. Ver bug conhecido em §8. |
| **FTS5** | Extensão de busca textual full-text do SQLite (`tokenize='unicode61 remove_diacritics 2'`, ranking `bm25()`), usada tanto por `biocultdb_records_fts` quanto por `etnotermos_fts`. |
| **`biocultdb_records`** | Tabela do BioCultDB (referências científicas, comunidades, plantas). Propriedade exclusiva do BioCultDB — o BioCultTermos só lê, nunca escreve. |
| **`etnotermos` / `etnotermos_fts` / `etnotermos_acquisition_log` / `etnotermos_audit_log`** | Tabelas do BioCultTermos no mesmo arquivo. Propriedade exclusiva do BioCultTermos. |
| **SKOS-XL** | *Simple Knowledge Organization System eXtension for Labels* (padrão W3C) — modelo de conceito/rótulo usado pelo BioCultTermos para vocabulário controlado multilíngue (`prefLabel`, `altLabel`, `broader`/`narrower`/`related`). |
| **`AcquisitionService`** | Serviço do BioCultTermos (`bioculttermos/backend/src/services/AcquisitionService.js`) que lê `biocultdb_records`, extrai valores de 5 campos monitorados (tipo de comunidade, nome vernacular, nome científico, tipo de uso, atividade econômica) e cria conceitos `candidate` no `etnotermos`; também semeia o vocabulário estático de referência (`docs/tipoUso.txt`, via `bioculttermos/backend/src/data/referenceTerms.js`) mesmo sem ocorrência ainda em `biocultdb_records`. Disparado por cron (`ACQUISITION_CRON_SCHEDULE`) ou manualmente (`POST /acquisition/run`). |
| **`candidate` / `active` / `deprecated`** | Ciclo de vida de um conceito SKOS-XL no BioCultTermos: criado automaticamente como `candidate` pelo `AcquisitionService`, promovido a `active` por um curador/terminólogo (porta 4001), ou marcado `deprecated` (com `replacedBy` opcional). |
| **HTTP Basic Auth + bcrypt** | Mecanismo de autenticação da porta 4001 (admin). Middleware `requireAuth` (`bioculttermos/backend/src/lib/auth/basicAuth.js`) decodifica o header `Authorization: Basic ...` e compara com hash bcrypt. |
| **`ADMIN_USERNAME` / `ADMIN_PASSWORD`** | Par de env vars (Opção B de `config/index.js:22-28`) para um único usuário admin, senha em texto plano hasheada no boot. Opção escolhida nesta integração (vs. `ADMIN_USERS` JSON multi-usuário). |
| **`start-unit.sh`** | Script entrypoint do container dual-app: sobe os dois processos Node como filhos, propaga `SIGTERM`, e derruba ambos se qualquer um crashar sozinho ("fail-fast", nunca deixa a unidade "meio no ar"). |
| **`dumb-init`** | Processo `PID 1` minimalista usado no container para repassar sinais corretamente aos processos filhos (necessário porque Node não é um bom PID 1 por padrão). |
| **Submodule (git)** | Mecanismo do git para incluir um repositório dentro de outro, pinado a um commit específico. `BioCultDB/bioculttermos` é um submodule apontando para `github.com/edalcin/BioCultTermos`. |
| **Corte / cutover** | Momento em que o container de produção é substituído pela nova versão (dual-app). Ver checklist §4.2. |
| **Unidade de Fontes Secundárias** | Nome da unidade federada BioCultDB + BioCultTermos (dados extraídos de literatura científica — "fontes secundárias" — em oposição a "fontes primárias" registradas diretamente com comunidades, papel do futuro BioCultRelatos). |
