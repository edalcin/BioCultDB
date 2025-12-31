# Troubleshooting - Painel de Informações Vazio

## Diagnóstico Realizado

Foi identificado que:
- ✓ MongoDB contém **14 referências aprovadas** e **33 comunidades**
- ✓ Todos os dados necessários estão presentes no banco
- ✓ As queries e endpoints estão configurados corretamente
- ⚠️ O painel está mostrando dados vazios em produção (Unraid)

## Possíveis Causas

### 1. **MONGO_URI Incorreta ou Não Configurada**
Se a variável de ambiente `MONGO_URI` não está sendo passada corretamente para o Docker em Unraid, o servidor não consegue conectar ao MongoDB.

**Solução:**
- Verifique se a `MONGO_URI` está corretamente configurada no Docker do Unraid
- A URI deve estar no formato: `mongodb://usuario:senha@host:porta/?authSource=banco`
- Não use `localhost` ou `127.0.0.1` - use o IP interno do servidor MongoDB

### 2. **Firewall/Acesso ao MongoDB**
O container do aplicativo pode não conseguir acessar o MongoDB por problemas de rede.

**Solução:**
- Verifique se o MongoDB está acessível na porta 27017
- Confira as credenciais de acesso (usuário e senha)
- Teste a conexão manualmente usando mongosh ou ferramentas similares

### 3. **Erros Silenciosos na API**
O servidor pode estar retornando erros 500 nas chamadas dos endpoints.

**Solução:**
- Abra o **Console do Navegador** (F12) enquanto visualiza o painel
- Procure por mensagens de erro nas abas **Console** e **Network**
- Verifique se as requisições estão retornando status 200 ou outro código
- Procure por logs do servidor nos registros do Docker

## Como Diagnosticar

### 1. Verificar a Saúde da Aplicação
Acesse o endpoint de health check da aplicação:
```
http://seu-servidor:3003/health
```

Você deve receber uma resposta JSON como:
```json
{
  "status": "ok",
  "timestamp": "2025-12-31T12:00:00.000Z",
  "database": {
    "connected": true,
    "name": "etnodb",
    "collection": "etnodb"
  },
  "references": {
    "total": 14,
    "approved": 14,
    "pending": 0,
    "rejected": 0
  }
}
```

Se receber erro de conexão (503), o problema é a conexão com MongoDB.

### 2. Verificar Console do Navegador
1. Abra o painel em seu navegador
2. Pressione F12 para abrir Developer Tools
3. Vá para a aba **Console**
4. Procure por mensagens de erro vermelhas
5. Procure por logs informativos que começam com "Fetching:"

### 3. Verificar Logs do Docker
Execute em seu Unraid:
```bash
docker logs etnodb-app
```

Procure por:
- Mensagens de conexão ao MongoDB
- Erros de aggregation pipelines
- Mensagens de timeout

## Correções Implementadas

### 1. Endpoint de Health Check
Adicionado endpoint `GET /health` que retorna:
- Status da conexão com MongoDB
- Contagem de referências por status
- Timestamp

### 2. Melhor Logging em JavaScript
Adicionados logs detalhados no dashboard.js:
- Console messages mostrando cada fetch realizado
- Status HTTP de cada requisição
- Erros específicos por endpoint

### 3. Tratamento de Erros Aprimorado
- Verificação de status HTTP em cada fetch
- Mensagens de erro específicas por tipo de dado
- Debugging facilitado

## Próximos Passos

1. **Verifique o endpoint `/health`** - Isso dirá se o MongoDB está acessível
2. **Abra o console do navegador** (F12) - Procure por erros ou URLs falhando
3. **Verifique os logs do Docker** - Procure por mensagens de erro
4. **Teste a URI do MongoDB manualmente** - Se possível, use ferramentas como mongosh

## Dados Disponíveis

Confirmado via diagnóstico direto:
- Total de referências: 14
- Referências aprovadas: 14
- Comunidades únicas: 33
- Anos de publicação: 10 diferentes
- Plantas com nome científico: 5+ (amostra)
- Top autores: disponíveis
- Distribuição por estado: disponível

Todos os dados necessários para popular o painel estão presentes no banco de dados.
