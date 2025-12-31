# Debugging Dashboard - Painel de Informações

## Status Atual
- ✓ Todos os 10 endpoints da API funcionam perfeitamente
- ✓ MongoDB está conectado e retornando dados
- ⚠️ Painel em Unraid continua em branco

## Por que o Painel está vazio?

Possíveis causas:

### 1. Servidor não foi redeployado
Se você fez deploy no repositório mas o servidor em Unraid ainda está rodando a versão antiga:

**Solução:**
```bash
# No Unraid, reconstrua o container
docker-compose -f docker/docker-compose.yml up --build --force-recreate

# Ou reinicie o container
docker restart etnodb-app
```

### 2. Google Charts não carrega
Se o CDN do Google Charts estiver inacessível:

**Verificar:**
1. Abra o navegador (F12)
2. Vá para **Network**
3. Procure por `loader.js` (https://www.gstatic.com/charts/loader.js)
4. Se o status for 404 ou 0, há problema de conectividade

### 3. Erros de JavaScript
O painel agora tem logs detalhados para debugar:

**Para verificar:**
1. Abra o painel: https://etnodb.biodiversidade.online/painel
2. Pressione F12 para abrir Developer Tools
3. Vá para a aba **Console**
4. Procure por `=== Dashboard Load Start ===`
5. Verifique se há mensagens de erro

### 4. Problemas de CORS
Se os endpoints retornam erro 500 por CORS:

**Logs a procurar:**
- `Community count error:`
- `Reference count error:`
- `Plants error:`
- Etc.

## Logging Adicionado

O dashboard.js agora loga todos os passos:

```
=== Dashboard Load Start ===
Dashboard filters: {...}
Loading dashboard data...
Loading summary cards...
✓ Summary cards loaded
Loading maps...
✓ Maps loaded
Loading charts...
✓ Charts loaded
Loading tables...
✓ Tables loaded
=== Dashboard Load Complete ===
```

Se você vê `=== Dashboard Load Complete ===`, o painel funcionou!

## Testes Manuais

Para testar os endpoints diretamente:

```bash
# Teste o health check
curl https://etnodb.biodiversidade.online/health

# Teste um endpoint
curl 'https://etnodb.biodiversidade.online/painel/api/stats/community-count'

# Teste com filtro
curl 'https://etnodb.biodiversidade.online/painel/api/stats/community-count?estado=Bahia'
```

## Verificando nos Logs do Docker

```bash
# Ver logs do container
docker logs etnodb-app

# Ver logs em tempo real
docker logs -f etnodb-app

# Procurar por erros de MongoDB
docker logs etnodb-app | grep -i "mongodb\|connection\|error"
```

## Checklist de Diagnóstico

- [ ] Servidor foi redeployado após o push?
- [ ] F12 → Console mostra `=== Dashboard Load Start ===`?
- [ ] F12 → Network mostra loader.js carregando?
- [ ] `curl /health` retorna JSON com status ok?
- [ ] Logs do Docker mostram conexão com MongoDB?
- [ ] Painel de Busca funciona (comprova que backend está ok)?

## Se nada funcionar

1. Redeploye o container
2. Limpe o cache do navegador (Ctrl+Shift+Del)
3. Recarregue a página (Ctrl+F5)
4. Verifique os logs do Docker
5. Copie a mensagem de erro completa e investigue

## Melhorias Implementadas

- ✓ Logs detalhados em cada etapa do carregamento
- ✓ Validação melhorada de respostas da API
- ✓ Tratamento completo de valores null/undefined em tabelas
- ✓ Placeholders claros quando não há dados
- ✓ Mensagens de erro visíveis ao usuário
- ✓ Health endpoint para verificar status
- ✓ Try-catch em todas as funções de renderização
