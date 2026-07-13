# ADR-001: Integração operacional do BioCultTermos na Unidade de Fontes Secundárias

## Status

**Aceito e Implementado** — Aceito em Julho 2026, corte em produção executado e verificado em
2026-07-13 (checklist completo, 6 bugs de estabilização pós-corte corrigidos — ver
`integracao.md` §11).

## Contexto

A Arquitetura BioCultural v3.1 (ver `Arquitetura-BioCultural/docs/architecture-decisions/ADR-004-federated-architecture.md`
e `ADR-005-sqlite-json-persistence.md`) já define, no nível arquitetural, que a "Unidade de Fontes
Secundárias" é **um único container** rodando BioCultDB (portas 3001–3003) e BioCultTermos (portas
4000–4001) sobre **um único arquivo SQLite compartilhado**, com BioCultTermos integrado como git submodule
em `./bioculttermos`.

Uma sessão de trabalho anterior (commit `100c1d9`, "feat: empacota Unidade de Fontes Secundarias em
container unico") já produziu o *scaffold* técnico para essa unidade:

- `docker/Dockerfile.unidade` — build multi-stage dual-app
- `docker/docker-compose.unidade.yml` — compose de exemplo/dev com as 5 portas
- `docker/start-unit.sh` — entrypoint que sobe os dois processos Node com fail-fast e shutdown gracioso
- Submodule `bioculttermos` com código real (SKOS-XL, dual-port, `AcquisitionService`)

Esse scaffold, porém, **nunca foi conectado à produção real**. O container que roda hoje em
`192.168.1.10` (nome Unraid `etnoDB`) usa a imagem `ghcr.io/edalcin/biocultdb:latest`, publicada por
`.github/workflows/docker-publish.yml` a partir de `docker/Dockerfile` (single-app, sem submodule,
sem BioCultTermos) — ver `docker-publish.yml:50-51` (`context: .`, `file: ./docker/Dockerfile`). Além
disso, os exemplos no scaffold (`SQLITE_DB_PATH=/data/unidade.sqlite`, `ADMIN_USERS` JSON com bcrypt)
divergem de valores reais já em uso em produção (`SQLITE_DB_PATH=/data/biocultdb.sqlite`, credencial
admin em texto plano fornecida pelo usuário). Esta ADR registra as decisões operacionais tomadas em
sessão de grilling (2026-07-12) para fechar essa lacuna entre scaffold e produção, complementando —
não substituindo — a ADR-005 (que permanece a decisão arquitetural de referência).

### Estado real de produção confirmado nesta sessão

Comando `docker run` fornecido pelo usuário, atualmente ativo:

```
docker run -d --name='etnoDB' --net='bridge' --pids-limit 2048 \
  -e TZ="America/Sao_Paulo" \
  -e HOST_OS="Unraid" -e HOST_HOSTNAME="Asilo" -e HOST_CONTAINERNAME="etnoDB" \
  -e 'NODE_ENV'='production' \
  -e 'SQLITE_DB_PATH'='/data/biocultdb.sqlite' \
  -l net.unraid.docker.managed=dockerman \
  -l net.unraid.docker.webui='http://192.168.1.10:3093' \
  -p '3091:3001/tcp' -p '3092:3002/tcp' -p '3093:3003/tcp' \
  -v '/mnt/user/Storage/appsdata/biocultdb/data/':'/data':'rw' \
  'ghcr.io/edalcin/biocultdb:latest'
```

Sem nenhuma variável de autenticação — hoje 3001/3002/3003 (mapeados externamente para 3091/3092/3093)
não têm auth alguma, controle é só por firewall/rede no Unraid.

## Decisão

1. **Caminho do SQLite permanece `/data/biocultdb.sqlite`.** Não renomear para `unidade.sqlite`. A env
   var `SQLITE_DB_PATH` já é o mecanismo de configuração (lida idêntica por `BioCultDB/backend/src/shared/config.js`
   e `bioculttermos/backend/src/config/index.js:37`); basta continuar apontando as duas ferramentas para o
   arquivo que já existe e já está populado. Zero migração, zero risco de órfão de dados. O valor
   `/data/unidade.sqlite` hardcoded em `docker/docker-compose.unidade.yml:29` é só exemplo — nunca deve
   ser usado como está no Unraid.
2. **Autenticação do BioCultTermos admin (4001) via `ADMIN_USERNAME` + `ADMIN_PASSWORD`** (texto plano,
   hash bcrypt gerado no boot — `bioculttermos/backend/src/config/index.js:22-28`), não via `ADMIN_USERS`
   (JSON pré-hasheado). Mesmo padrão operacional de uma env var por valor já usado por `SQLITE_DB_PATH`
   e `NODE_ENV` no Unraid. Um único usuário administrador por ora.
3. **Tabelas `etnotermos_*` começam vazias.** Não há instância standalone do BioCultTermos em produção
   com dados reais a migrar. O vocabulário candidato é constituído a partir de dados **já existentes** em
   `biocultdb_records` (produção populada), via `AcquisitionService` — essa leitura cruzada é a própria
   razão de ser da integração.
4. **Mapeamento de portas**: 3091/3092/3093 → 3001/3002/3003 (offset já em uso, mantido). Portas novas
   4000 e 4001 mapeadas 1:1 sem offset (`4000:4000`, `4001:4001`), conforme solicitado.
5. **CI/CD publica uma única imagem.** `docker-publish.yml` passa a fazer checkout com submodules
   (`submodules: true` ou `recursive`) e build de `docker/Dockerfile.unidade` em vez de `docker/Dockerfile`,
   mantendo a mesma tag `ghcr.io/edalcin/biocultdb:latest`. Sem imagem/tag legada paralela — a imagem
   publicada passa a ser sempre a unidade dual-app. `docker/Dockerfile` e `docker/docker-compose.yml`
   (single-app) são preservados apenas como conveniência de desenvolvimento local rápido (iterar só no
   BioCultDB sem precisar do submodule inicializado) — não são mais o caminho de deploy.
6. **Corte em produção por substituição in-place** do container `etnoDB` existente: backup do arquivo
   SQLite, parar/remover o container, recriar com a mesma imagem/volume/env vars atuais + 2 portas novas
   + 2 env vars novas, subir. Indisponibilidade de segundos/poucos minutos, aceitável.
7. **Primeira execução do `AcquisitionService` é automática**, seja pelo cron padrão
   (`ACQUISITION_CRON_SCHEDULE=0 3 * * *`) seja disparada manualmente logo após o deploy via
   `POST /acquisition/run` (autenticado) para não esperar até 3h.
8. **Autenticação do próprio BioCultDB (3001/3002) fica fora de escopo.** Esta integração não adiciona
   auth às portas do BioCultDB — permanece como está hoje (controle por firewall/rede). Decisão futura
   separada, se necessária.
9. **Fluxo de desenvolvimento do submodule**: o repositório `BioCultTermos` standalone fica congelado
   como *produto* — ninguém mais sobe `docker-compose.yml`/`etnotermos.Dockerfile` dele isoladamente, nem
   ele recebe roadmap próprio. Porém, por mecânica de git submodule, qualquer alteração de código
   continua sendo commitada a partir de `BioCultDB/bioculttermos/` e pushada para
   `github.com/edalcin/BioCultTermos` (o remoto do submodule), seguida de um bump do ponteiro do
   submodule + commit em `BioCultDB`. Ver seção "Fluxo de desenvolvimento" em `integracao.md`.

## Consequências

### Positivas

- Zero risco de perda de dados: nenhum arquivo é renomeado ou movido, só ganha tabelas novas.
- Uma imagem, um pipeline, um container — alinhado à diretriz do projeto de simplicidade/tamanho de
  Docker (nenhuma imagem "meia-integração" paralela para manter).
- Rollback trivial: arquivo SQLite intocado durante todo o corte (bind mount), reverter é só recriar o
  container antigo.

### Negativas

- Imagem `:latest` é uma tag flutuante — antes do corte é preciso registrar o digest atual da imagem em
  produção (`docker inspect etnoDB --format='{{.Image}}'`) como ponto de rollback, já que um novo `docker
  pull ghcr.io/edalcin/biocultdb:latest` após um deploy ruim traria a MESMA imagem ruim, não a anterior.
  - *Mitigação*: documentado como passo explícito do checklist de corte em `integracao.md`.
- `docker/Dockerfile` (single-app) e `docker/Dockerfile.unidade` (dual-app) coexistem no repositório —
  risco de o single-app ficar esquecido/desatualizado com o tempo.
  - *Mitigação*: `docker/Dockerfile` documentado explicitamente como "dev-only, nunca mais é o caminho de
    deploy"; revisitar na próxima ADR se isso causar confusão real.

## Referências

- `Arquitetura-BioCultural/docs/architecture-decisions/ADR-004-federated-architecture.md`
- `Arquitetura-BioCultural/docs/architecture-decisions/ADR-005-sqlite-json-persistence.md`
- `BioCultDB/integracao.md` (checklist operacional detalhado desta decisão)
- `BioCultDB/docker/Dockerfile.unidade`, `docker/docker-compose.unidade.yml`, `docker/start-unit.sh`
- `BioCultDB/bioculttermos/backend/src/config/index.js`, `shared/database.js`
- `BioCultDB/.github/workflows/docker-publish.yml`

## Data de Revisão

Corte de produção concluído com sucesso em 2026-07-13 (revisão original desta cláusula). Próxima
revisão: se/quando BioCultRelatos precisar de um padrão análogo de unidade (comunidade tradicional
 + BioCultTermos).
