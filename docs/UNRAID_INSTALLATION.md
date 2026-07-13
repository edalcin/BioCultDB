# Guia de Instalação do BioCultDB no Unraid

**Documentação de Deployment do BioCultDB via Interface Web do Unraid**

---

## Pré-requisitos

Antes de começar, certifique-se de que:

- ✅ Unraid server está instalado e executando
- ✅ Docker está habilitado no Unraid (padrão)
- ✅ Conectividade de rede entre containers está configurada
- ✅ Você tem acesso à interface web do Unraid (porta 80/443)

---

## Seção 2: Adicionar Container BioCultDB

### Passo 2.1: Acessar Interface Docker do Unraid

1. Abra seu navegador: `http://<ip-do-unraid>/`
2. No menu, clique em **"Docker"** → **"Docker Containers"**
3. Clique em **"Add Container"**

### Passo 2.2: Configuração Básica

Você verá a tela "Add Container" com os seguintes campos:

#### Campo 1: Template
- **Descrição**: Modelo pré-configurado para o container
- **Ação**: Deixe em branco (selecionaremos configuração manual)
- **Valor**: `(deixe vazio ou selecione "Custom")`

#### Campo 2: Name
- **Descrição**: Nome do container no Unraid
- **Ação**: Digite o nome
- **Valor**: `BioCultDB`

#### Campo 3: Repository
- **Descrição**: Imagem Docker a ser usada
- **Ação**: Digite a URL completa do repositório
- **Valor**: `ghcr.io/edalcin/biocultdb:latest`

**Exemplo de preenchimento:**
```
Repository: ghcr.io/edalcin/biocultdb:latest
```

### Passo 2.3: Configuração de Rede

#### Network Type
- **Descrição**: Como o container se conecta à rede
- **Ação**: Selecione do dropdown
- **Valor**: `bridge`

Clique em **"Show more settings..."** para expandir opções adicionais.

---

### Passo 2.4: Mapeamento de Portas

Você precisa mapear 5 portas (3 para o BioCultDB, 2 para o BioCultTermos).

Clique em **"Add another Path, Port, Variable, Label or Device"** (botão azul com `+`) e repita este processo **5 vezes**:

#### Porta 1: Aquisição (Data Entry)
```
Container Port: 3001
Host Port: 3001
Protocol: tcp
Description: Aquisição - Entrada de dados
```

#### Porta 2: Curadoria (Data Curation)
```
Container Port: 3002
Host Port: 3002
Protocol: tcp
Description: Curadoria - Edição de dados
```

#### Porta 3: Apresentação (Public Search - HOME)
```
Container Port: 3003
Host Port: 3003
Protocol: tcp
Description: Apresentação - Busca pública (Home)
```

#### Porta 4: BioCultTermos Público
```
Container Port: 4000
Host Port: 4000
Protocol: tcp
Description: BioCultTermos - Vocabulário público (sem autenticação)
```

#### Porta 5: BioCultTermos Admin (Curadoria de Termos)
```
Container Port: 4001
Host Port: 4001
Protocol: tcp
Description: BioCultTermos - Curadoria de termos (HTTP Basic Auth)
```

**Como adicionar cada porta:**
1. Clique no botão azul **"+"**
2. Preencha os valores acima
3. Clique em **"Add another..."** para a próxima porta

---

### Passo 2.5: Variáveis de Ambiente

Clique novamente em **"Add another Path, Port, Variable, Label or Device"** para adicionar **variáveis de ambiente**.

**Como adicionar cada variável:**
1. Clique no botão azul **"+"**
2. Selecione o tipo: **"Variable"** (não "Path" ou "Port")
3. Preencha `Key` e `Value`
4. Clique em **"Add another..."** para a próxima variável

#### Variável 1: SQLITE_DB_PATH (OBRIGATÓRIA)
```
Key: SQLITE_DB_PATH
Value: /data/biocultdb.sqlite
```

**Explicação**:
- Define o caminho do arquivo de banco de dados SQLite dentro do container
- Valor padrão: `/data/biocultdb.sqlite`
- O arquivo é criado automaticamente na primeira execução, se ainda não existir

**Importante — Armazenamento Persistente**: Para não perder os dados ao recriar o container, mapeie também um **Path** (não uma Variable) apontando para o diretório `/data`:
1. Clique em **"Add another Path, Port, Variable, Label or Device"**
2. Selecione o tipo **"Path"**
3. Preencha:
   ```
   Container Path: /data
   Host Path: /mnt/user/Storage/appsdata/biocultdb/data/
   Read Only: No
   ```

Veja também a [Seção 8: Armazenamento Persistente](#armazenamento-persistente) para o formato completo.

#### Variável 2: Node Environment (OBRIGATÓRIA)
```
Key: NODE_ENV
Value: production
```

**Explicação**:
- Define a aplicação em modo produção
- Otimiza performance e segurança
- Valores aceitos: `production` (padrão) ou `development`

#### Variável 3: BioCultTermos Admin Username (OBRIGATÓRIA)
```
Key: ADMIN_USERNAME
Value: etnotermos
```

**Explicação**:
- Usuário HTTP Basic Auth para a interface de curadoria do BioCultTermos (porta 4001)
- Sugestão: `etnotermos`
- Único usuário admin (sem múltiplos usuários)

#### Variável 4: BioCultTermos Admin Password (OBRIGATÓRIA)
```
Key: ADMIN_PASSWORD
Value: <defina uma senha forte>
```

**Explicação**:
- Senha HTTP Basic Auth para a porta 4001 (curadoria de termos)
- Hasheada em memória no boot da aplicação
- **Nunca commitar a senha real** — defina-a apenas na interface do Unraid

#### Variável 5: Porta Aquisição (OPCIONAL)
```
Key: PORT_ACQUISITION
Value: 3001
```

**Explicação**:
- Porta interna para interface de entrada de dados
- Padrão: `3001`
- Só alterar se conflitar com outra aplicação

#### Variável 6: Porta Curadoria (OPCIONAL)
```
Key: PORT_CURATION
Value: 3002
```

**Explicação**:
- Porta interna para interface de edição de dados
- Padrão: `3002`
- Só alterar se conflitar com outra aplicação

#### Variável 7: Porta Apresentação (OPCIONAL)
```
Key: PORT_PRESENTATION
Value: 3003
```

**Explicação**:
- Porta interna para interface pública (home page)
- Padrão: `3003`
- Só alterar se conflitar com outra aplicação

---

### Passo 2.6: Configurações Adicionais Opcionais

#### CPU/Memory Limits (Opcional)
Se quiser limitar recursos:

```
CPU Cores: 2
Memory: 512
```

#### Privileged Mode (Não recomendado)
- Deixe como **OFF** (modo padrão é suficiente)

#### Console Shell (Padrão)
- Deixe como **Shell**

---

### Passo 2.7: Revisar Configuração

Antes de clicar em "Apply", sua configuração deve parecer com isto:

```
Name: BioCultDB
Repository: ghcr.io/edalcin/biocultdb:latest
Network Type: bridge

Port Mappings:
├── 3001 → 3001 (Aquisição)
├── 3002 → 3002 (Curadoria)
├── 3003 → 3003 (Apresentação)
├── 4000 → 4000 (BioCultTermos público)
└── 4001 → 4001 (BioCultTermos admin)

Environment Variables (Obrigatórias):
├── SQLITE_DB_PATH: /data/biocultdb.sqlite
├── NODE_ENV: production
├── ADMIN_USERNAME: etnotermos
└── ADMIN_PASSWORD: <senha real, definida no Unraid>

Environment Variables (Opcionais - apenas se usar portas diferentes):
├── PORT_ACQUISITION: 3001
├── PORT_CURATION: 3002
└── PORT_PRESENTATION: 3003
```

**Resumo de Variáveis de Ambiente:**

| Variável | Obrigatória? | Padrão | Descrição |
|----------|--------------|--------|-----------|
| `SQLITE_DB_PATH` | ✅ Sim | `/data/biocultdb.sqlite` | Caminho do arquivo de banco de dados SQLite (requer volume persistente) |
| `NODE_ENV` | ✅ Sim | `production` | Modo de execução |
| `ADMIN_USERNAME` | ✅ Sim | — | Usuário HTTP Basic Auth do BioCultTermos admin (porta 4001) |
| `ADMIN_PASSWORD` | ✅ Sim | — | Senha HTTP Basic Auth do BioCultTermos admin (porta 4001) — nunca committar |
| `PORT_ACQUISITION` | ❌ Não | `3001` | Porta de entrada de dados |
| `PORT_CURATION` | ❌ Não | `3002` | Porta de edição/aprovação |
| `PORT_PRESENTATION` | ❌ Não | `3003` | Porta pública (home) |

---

### Passo 2.8: Criar o Container

1. Clique no botão **"Apply"** (canto inferior direito)
2. Aguarde o container ser criado e iniciado
3. Você verá uma notificação: `"Container BioCultDB created successfully"`

---

## Seção 3: Acessar a Aplicação

### Verificar Status

Na página **"Docker Containers"**, procure por `BioCultDB`:

```
Container: BioCultDB
Status: ✅ running (verde)
Repository: ghcr.io/edalcin/biocultdb:latest
Uptime: seconds ago
```

### Acessar os Contextos

Após o container estar **running**, acesse a aplicação:

#### 🏠 Apresentação (Home Page - Interface Pública)
```
http://<ip-do-unraid>:3003/
```

**Funcionalidade**:
- Busca de plantas e comunidades
- Logo do projeto centralizado
- Interface principal e pública
- **Recomendado para acesso público**

#### 📥 Aquisição (Entrada de Dados)
```
http://<ip-do-unraid>:3001/
```

**Funcionalidade**:
- Formulário para inserir dados secundários de artigos científicos
- Referências, comunidades e plantas
- **Restringir a pesquisadores**

#### ✏️ Curadoria (Edição e Aprovação)
```
http://<ip-do-unraid>:3002/
```

**Funcionalidade**:
- Revisar dados submetidos
- Editar e validar informações
- Aprovar/rejeitar referências
- **Restringir a curadores**

#### 📖 BioCultTermos — Vocabulário Público
```
http://<ip-do-unraid>:4000/
```

**Funcionalidade**:
- Consulta pública ao vocabulário controlado SKOS-XL (termos ativos)
- Sem autenticação

#### 🔑 BioCultTermos — Curadoria de Termos (Admin)
```
http://<ip-do-unraid>:4001/
```

**Funcionalidade**:
- Promove conceitos `candidate` (gerados pelo `AcquisitionService` a partir dos registros do BioCultDB) para `active`
- Protegido por HTTP Basic Auth (`ADMIN_USERNAME`/`ADMIN_PASSWORD`)
- **Restringir a curadores de vocabulário**

---

## Seção 4: Segurança e Acesso

### Controle de Acesso Recomendado

A porta **4001** (BioCultTermos admin) é a única protegida por autenticação (HTTP Basic, via `ADMIN_USERNAME`/`ADMIN_PASSWORD`). As demais — 3001, 3002, 3003 (BioCultDB) e 4000 (BioCultTermos público) — **não têm autenticação integrada**; configure acesso em nível de infraestrutura:

#### Opção A: Firewall do Unraid

1. No Unraid, vá para **"Settings"** → **"Firewall"**
2. Configure regras:
   - ✅ Porta 3003 (Apresentação): Permitir todos
   - 🔒 Portas 3001, 3002: Restringir a IPs confiáveis

#### Opção B: Reverse Proxy (Recomendado)

Se você usa um reverse proxy como **nginx** ou **Traefik** no Unraid:

```nginx
# Apresentação (público)
server {
  listen 443 ssl;
  server_name biocultdb.example.com;
  location / {
    proxy_pass http://localhost:3003;
  }
}

# Aquisição (privado)
server {
  listen 443 ssl;
  server_name biocultdb-acquisition.example.com;
  auth_basic "Restricted";
  location / {
    proxy_pass http://localhost:3001;
  }
}

# Curadoria (privado)
server {
  listen 443 ssl;
  server_name biocultdb-curation.example.com;
  auth_basic "Restricted";
  location / {
    proxy_pass http://localhost:3002;
  }
}
```

#### Opção C: VPN/Rede Local Apenas

Configure seu firewall para:
- Expor apenas porta 3003 (Apresentação) para internet
- Manter portas 3001 e 3002 restritas à rede local

---

## Seção 5: Verificação de Saúde

### Logs do Container

Para verificar se tudo está funcionando:

1. Na página **Docker Containers**, clique em **`BioCultDB`**
2. Clique em **"View Logs"** (ícone de documento/logs)
3. Procure por mensagens como:
   ```
   Opening SQLite database at /data/biocultdb.sqlite
   Successfully connected to SQLite
   Acquisition server listening on port 3001
   Curation server listening on port 3002
   Presentation server listening on port 3003
   ```

### Verificar Armazenamento SQLite

Se os logs mostrarem erros ao abrir o banco de dados:

1. Verifique se o volume/path `/data` foi mapeado corretamente (Seção 2.5)
2. Confirme que o diretório existe e é gravável dentro do container:
   ```bash
   docker exec BioCultDB ls -la /data
   docker exec BioCultDB touch /data/.write-test && echo "OK: gravável" && docker exec BioCultDB rm /data/.write-test
   ```
3. Rode o script de verificação incluído na imagem, que já checa `SQLITE_DB_PATH` e a gravabilidade do diretório:
   ```bash
   docker exec BioCultDB bash -c 'bash /app/verify-container-setup.sh'
   ```

---

## Seção 6: Backup e Manutenção

### Backup de Dados SQLite

O BioCultDB usa SQLite em modo WAL (Write-Ahead Log). Para um backup consistente sem precisar parar o container, use `.backup` (via `sqlite3`), que captura um snapshot íntegro mesmo com o banco em uso — copiar o arquivo `.sqlite` diretamente enquanto a aplicação escreve nele arrisca corromper o backup.

```bash
# Opção 1 (recomendada): snapshot consistente com a aplicação rodando
docker exec BioCultDB sqlite3 /data/biocultdb.sqlite ".backup '/data/biocultdb-$(date +%Y%m%d).sqlite'"
docker cp BioCultDB:/data/biocultdb-$(date +%Y%m%d).sqlite /mnt/user/backups/

# Opção 2: copiar o arquivo diretamente com a aplicação parada
docker stop BioCultDB
cp /mnt/user/Storage/appsdata/biocultdb/data/biocultdb.sqlite /mnt/user/backups/biocultdb-$(date +%Y%m%d).sqlite
docker start BioCultDB
```

### Atualizar BioCultDB

Para atualizar para nova versão:

1. Remova o container `BioCultDB`:
   - Em **Docker Containers**, clique em `BioCultDB` → **"Delete"**

2. Puxe a nova imagem:
   - Clique em **"Docker Hub"**
   - Pesquise `ghcr.io/edalcin/biocultdb`
   - Clique em **"Pull"**

3. Re-crie o container (repita Seção 2)

---

## Seção 7: Troubleshooting

### Problema: Container para/não inicia

**Verificar logs:**
```bash
docker logs BioCultDB
```

**Causas comuns:**
- ❌ Volume `/data` não está montado ou `SQLITE_DB_PATH` incorreto
- ❌ Porta já está em uso (altere Host Port)
- ❌ Variáveis de ambiente incorretas

### Problema: Aplicação lenta

**Verificar recursos:**
1. Em **Docker Containers**, clique em `BioCultDB`
2. Vá para **"Stats"** para ver CPU e memória
3. Se necessário, aumente limits (Seção 2.6)

### Problema: Erro ao abrir o banco de dados SQLite

**Verificar variável SQLITE_DB_PATH e o volume `/data`:**

1. Clique em `BioCultDB` → **"Edit"**
2. Procure por variável `SQLITE_DB_PATH`
3. Confirme que está como: `/data/biocultdb.sqlite`
4. Procure pela seção **Path** e confirme que `Container Path: /data` está mapeado para um `Host Path` válido e gravável
5. Clique **"Apply"** e reinicie o container

### Problema: Conexão recusada

**Possíveis causas:**
1. Firewall bloqueando portas
   - Verifique **Settings → Firewall** no Unraid

2. Container ainda iniciando
   - Aguarde 30 segundos e tente novamente

3. Container não está rodando
   - Verifique status em **Docker Containers**
   - Clique no container para ver logs

---

## Seção 8: Configurações Avançadas

### Customizar Portas e Variáveis de Ambiente

**Cenário**: Você quer usar portas diferentes das padrões.

#### Editar Variáveis Existentes

1. Em **Docker Containers**, clique no container **`BioCultDB`**
2. Clique em **"Edit"**
3. Procure por **"Environment Variables"** (seção com seus KEY=VALUE)
4. Clique na variável que quer alterar (ex: `SQLITE_DB_PATH`)
5. Atualize o valor conforme necessário
6. Clique em **"Apply"** para salvar

#### Exemplo: Alterar Porta de Apresentação

Se a porta 3003 está sendo usada por outra aplicação:

1. Clique em **Edit** no container `BioCultDB`
2. Na seção **Port Mappings**, altere:
   - De: `Container Port 3003 → Host Port 3003`
   - Para: `Container Port 3003 → Host Port 4003`
3. Na seção **Environment Variables**, altere:
   - Adicione/altere: `PORT_PRESENTATION = 4003`
4. Clique em **Apply**
5. Acesse: `http://<ip-unraid>:4003/` (nova porta)

### Armazenamento Persistente

Para persistir dados fora do container:

1. Clique em BioCultDB → **"Edit"**
2. Clique em **"Add another Path, Port, Variable..."**
3. Selecione tipo **"Path"**:
   ```
   Container Path: /data
   Host Path: /mnt/user/Storage/appsdata/biocultdb/data
   Read Only: No
   ```

### Adicionar Novas Variáveis de Ambiente

Se precisar adicionar outras variáveis no futuro:

1. Clique em BioCultDB → **"Edit"**
2. Clique em **"Add another Path, Port, Variable, Label or Device"**
3. Selecione tipo **"Variable"**
4. Preencha:
   ```
   Key: NOME_DA_VARIAVEL
   Value: valor_desejado
   ```
5. Clique em **Apply**

---

## Seção 9: Resumo de Portas

| Contexto | Porta | URL | Acesso | Descrição |
|----------|-------|-----|--------|-----------|
| **Apresentação** | 3003 | `http://unraid:3003/` | 🌐 Público | Home page, busca pública |
| **Aquisição** | 3001 | `http://unraid:3001/` | 🔒 Restrito | Entrada de dados |
| **Curadoria** | 3002 | `http://unraid:3002/` | 🔒 Restrito | Edição e aprovação |

---

## Seção 10: Próximos Passos

Depois da instalação:

1. **Acessar apresentação**: `http://<ip-unraid>:3003/`
2. **Inserir primeiro artigo**: Use `http://<ip-unraid>:3001/`
3. **Revisar dados**: Use `http://<ip-unraid>:3002/`
4. **Configurar segurança**: Restrinja acesso às portas 3001 e 3002
5. **Configurar backup**: Crie tarefas agendadas para backup de dados

---

## Contato e Suporte

Para questões sobre instalação ou uso:

- **Issues**: [GitHub Repository Issues](../../issues)
- **Desenvolvedor**: Eduardo Dalcin <edalcin@jbrj.gov.br>
- **Documentação**: Veja [README.md](../README.md)

---

**Última atualização**: 2026-07-13
**Versão**: BioCultDB 1.0
