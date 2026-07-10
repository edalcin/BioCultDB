# Corrigir Painel - Instruções para Unraid

## Problema Atual
- Painel carregando mas sem dados
- Erro 404 ao carregar CSS e JavaScript
- Servidor em Unraid rodando versão antiga

## Solução: Redeployer o Container

### Opção 1: Reconstruir do Zero (Mais Seguro)
```bash
# No Unraid, execute:
cd /path/to/BioCultDB
docker-compose -f docker/docker-compose.yml down
docker-compose -f docker/docker-compose.yml up --build

# Ou se preferir background:
docker-compose -f docker/docker-compose.yml up -d --build
```

### Opção 2: Forçar Reconstrução
```bash
docker-compose -f docker/docker-compose.yml up --build --force-recreate -d
```

### Opção 3: Apenas Reiniciar
Se os arquivos já estão no container:
```bash
docker restart etnodb-app
```

## Verificar se Funcionou

### 1. Testar via Browser
```
https://etnodb.biodiversidade.online/__debug/paths
```

Você deve ver:
```json
{
  "rootDir": "/app",
  "presentationStylesDir": "/app/frontend/src/presentation/styles",
  "scriptsDir": "/app/frontend/src/presentation/scripts",
  "dirExists": {
    "presentationStyles": true,
    "scripts": true
  },
  "files": {
    "presentationStyles": ["cards.css", "dashboard.css"],
    "scripts": ["dashboard.js"]
  }
}
```

### 2. Testar no Docker
```bash
# Ver logs do container
docker logs etnodb-app | tail -50

# Procurar por erros
docker logs etnodb-app | grep -i "error\|404"

# Verificar estrutura de arquivos
docker exec etnodb-app ls -la /app/frontend/src/presentation/styles/
docker exec etnodb-app ls -la /app/frontend/src/presentation/scripts/
```

### 3. Testar via cURL
```bash
# Test static files
curl -v https://etnodb.biodiversidade.online/styles/presentation/cards.css
curl -v https://etnodb.biodiversidade.online/scripts/dashboard.js

# Deve retornar status 200, não 404
```

### 4. Verificar Browser Console
1. Acesse https://etnodb.biodiversidade.online/painel
2. Pressione F12
3. Vá para Console
4. Procure por `=== Dashboard Load Start ===`
5. Se vir `=== Dashboard Load Complete ===`, funcionou!

## Se Ainda Não Funcionar

### Cenário 1: Arquivos Não Existem no Container
```bash
# Verificar
docker exec etnodb-app bash /app/verify-container-setup.sh
```

Se os arquivos não estão, o problema é que o git não fez push ou o Docker não está copiando os arquivos.

**Solução:**
- Verifique se os arquivos estão no repositório remoto
- Reconstrua sem cache: `docker-compose up --build --no-cache`

### Cenário 2: Logs Mostram Erro de Mongo
```bash
docker logs etnodb-app | grep -i mongo
```

Se há erro de MongoDB:
- Verifique MONGO_URI no Docker
- Teste conexão: `docker exec etnodb-app node check-database.js`

### Cenário 3: Ports Não Estão Listening
```bash
docker ps
```

Se container não está rodando:
```bash
docker-compose -f docker/docker-compose.yml logs
```

## Checklist Final

- [ ] Rodou `docker-compose up --build`?
- [ ] Esperou pelo menos 30 segundos para iniciar?
- [ ] Acessou `/__debug/paths` e viu os arquivos?
- [ ] Abriu F12 e viu `Dashboard Load Complete`?
- [ ] CSS está carregando (sem erro 404)?
- [ ] JavaScript está executando?
- [ ] Painel mostra dados?

## Se Tudo Falhar

Execute este script e envie o output:
```bash
docker logs etnodb-app > /tmp/etnodb-logs.txt
docker exec etnodb-app bash /app/verify-container-setup.sh > /tmp/etnodb-verify.txt

# Copie os arquivos para análise
cat /tmp/etnodb-logs.txt
cat /tmp/etnodb-verify.txt
```

## Commits Realizados

Essas correções foram feitas:
1. `a33d09f` - Corrige caminhos de arquivos estáticos para produção
2. `15d1bd1` - Diagnóstico e correções finais
3. `61e49ef` - Melhora robustez do Painel
4. `0228f75` - Corrige carregamento do Painel
5. `a1e5b2d` - Diagnóstico inicial

Todos estão no repositório remoto: https://github.com/edalcin/BioCultDB

## Resumo

O problema é que o servidor Unraid está rodando uma versão antiga do código. As correções foram feitas no código, mas o container precisa ser reconstruído para usar a versão nova.

Executar:
```bash
docker-compose -f docker/docker-compose.yml up --build --force-recreate -d
```

E depois testar no navegador. Se ainda não funcionar, use os scripts de debug acima.
