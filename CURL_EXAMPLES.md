# Exemplos de cURL - Novos Endpoints

## Variáveis de exemplo
```bash
# Substitua pelos valores reais do seu ambiente
BASE_URL="http://localhost:3000"
JWT_TOKEN="seu-jwt-token-aqui"
RANKING_ID="ranking-123"
RANKING_ITEM_ID="item-456"
USER_ID="user-789"
BLOCKED_USER_ID="user-999"
CRITERIA_ID_1="criteria-111"
CRITERIA_ID_2="criteria-222"
```

---

## 1. Criar múltiplos scores de uma vez (Bulk Score Creation)

```bash
curl -X POST "${BASE_URL}/rankings/${RANKING_ID}/items/${RANKING_ITEM_ID}/scores/bulk" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -d '{
    "scores": [
      {
        "rankingCriteriaId": "criteria-111",
        "score": 8.5
      },
      {
        "rankingCriteriaId": "criteria-222",
        "score": 7.2
      },
      {
        "rankingCriteriaId": "criteria-333",
        "score": 9.0
      }
    ]
  }'
```

**Resposta esperada:**
```json
{
  "message": "3 score(s) processado(s) com sucesso",
  "results": [
    {
      "id": "new-criteria-111",
      "action": "created",
      "rankingItemId": "item-456",
      "userId": "user-789",
      "rankingCriteriaId": "criteria-111",
      "score": 8.5,
      "createdAt": "2024-09-24T12:00:00.000Z",
      "updatedAt": "2024-09-24T12:00:00.000Z"
    },
    {
      "id": "score-123",
      "action": "updated",
      "rankingItemId": "item-456",
      "userId": "user-789",
      "rankingCriteriaId": "criteria-222",
      "score": 7.2,
      "createdAt": "2024-09-24T12:00:00.000Z",
      "updatedAt": "2024-09-24T12:00:00.000Z"
    }
  ],
  "summary": {
    "created": 2,
    "updated": 1,
    "total": 3
  }
}
```

---

## 2. Desativar conta do usuário (Soft Delete)

**Sem motivo (opcional):**
```bash
curl -X DELETE "${BASE_URL}/user/${USER_ID}" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

**Com motivo de desativação:**
```bash
curl -X DELETE "${BASE_URL}/user/${USER_ID}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -d '{
    "reason": "Não estou mais usando o aplicativo"
  }'
```

**Resposta esperada:**
```json
{
  "message": "Conta desativada com sucesso ✅"
}
```

**Nota:** 
- O `USER_ID` deve ser o mesmo do usuário autenticado (token JWT)
- O campo `reason` é opcional e pode ter até 500 caracteres

---

## 3. Denunciar um ranking por abuso

```bash
curl -X POST "${BASE_URL}/rankings/${RANKING_ID}/report" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -d '{
    "description": "Este ranking contém conteúdo ofensivo e impróprio que viola as diretrizes da comunidade."
  }'
```

**Resposta esperada:**
```json
{
  "id": "report-123",
  "targetType": "RANKING",
  "status": "PENDING",
  "description": "Este ranking contém conteúdo ofensivo e impróprio que viola as diretrizes da comunidade.",
  "rankingId": "ranking-123",
  "reportedById": "user-789",
  "createdAt": "2024-09-24T12:00:00.000Z",
  "updatedAt": "2024-09-24T12:00:00.000Z"
}
```

---

## 4. Denunciar um item de ranking por abuso

```bash
curl -X POST "${BASE_URL}/rankings/${RANKING_ID}/items/${RANKING_ITEM_ID}/report" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -d '{
    "description": "Este item contém informações falsas e conteúdo inadequado."
  }'
```

**Resposta esperada:**
```json
{
  "id": "report-456",
  "targetType": "RANKING_ITEM",
  "status": "PENDING",
  "description": "Este item contém informações falsas e conteúdo inadequado.",
  "rankingItemId": "item-456",
  "reportedById": "user-789",
  "createdAt": "2024-09-24T12:00:00.000Z",
  "updatedAt": "2024-09-24T12:00:00.000Z"
}
```

---

## 5. Bloquear um usuário

```bash
curl -X POST "${BASE_URL}/user/blocks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -d '{
    "blockedUserId": "user-999"
  }'
```

**Resposta esperada:**
```json
{
  "id": "block-123",
  "blockerId": "user-789",
  "blockedUserId": "user-999",
  "createdAt": "2024-09-24T12:00:00.000Z"
}
```

**Erros possíveis:**
- `400`: "Você não pode bloquear você mesmo 😅"
- `400`: "Usuário não encontrado 😕"
- `400`: "Usuário já bloqueado 🙅‍♂️"

---

## 6. Desbloquear um usuário

```bash
curl -X DELETE "${BASE_URL}/user/blocks/${BLOCKED_USER_ID}" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

**Resposta esperada:**
```json
{
  "message": "Usuário desbloqueado com sucesso ✅"
}
```

**Erros possíveis:**
- `400`: "Usuário não está bloqueado 🤷"

---

## 7. Listar usuários bloqueados

```bash
curl -X GET "${BASE_URL}/user/blocks" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

**Resposta esperada:**
```json
[
  {
    "id": "block-123",
    "blockedUserId": "user-999",
    "blockedUser": {
      "id": "user-999",
      "name": "Usuário Bloqueado",
      "email": "bloqueado@example.com",
      "avatar": {
        "url": "https://example.com/avatar.jpg"
      }
    },
    "createdAt": "2024-09-24T12:00:00.000Z"
  },
  {
    "id": "block-456",
    "blockedUserId": "user-888",
    "blockedUser": {
      "id": "user-888",
      "name": "Outro Usuário",
      "email": "outro@example.com",
      "avatar": null
    },
    "createdAt": "2024-09-24T11:00:00.000Z"
  }
]
```

---

## Exemplo completo com valores reais

```bash
# 1. Criar múltiplos scores
curl -X POST "http://localhost:3000/rankings/clx123/items/clx456/scores/bulk" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "scores": [
      {"rankingCriteriaId": "clx111", "score": 8.5},
      {"rankingCriteriaId": "clx222", "score": 7.2}
    ]
  }'

# 2. Bloquear usuário
curl -X POST "http://localhost:3000/user/blocks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"blockedUserId": "clx999"}'

# 3. Listar bloqueados
curl -X GET "http://localhost:3000/user/blocks" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 4. Denunciar ranking
curl -X POST "http://localhost:3000/rankings/clx123/report" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"description": "Conteúdo ofensivo"}'

# 5. Desativar conta (com motivo)
curl -X DELETE "http://localhost:3000/user/clx789" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"reason": "Não estou mais usando o aplicativo"}'
```

---

## Notas importantes

1. **Autenticação**: Todos os endpoints (exceto alguns públicos) requerem o header `Authorization: Bearer <token>`
2. **Content-Type**: Endpoints POST/PATCH requerem `Content-Type: application/json`
3. **IDs**: Substitua os IDs de exemplo pelos IDs reais do seu banco de dados
4. **JWT Token**: Obtenha o token através do endpoint de login (`POST /user/signin`)
5. **Validações**: 
   - Scores devem ser números (float)
   - Descrição de denúncia: máximo 500 caracteres
   - Não é possível bloquear a si mesmo
   - Apenas o próprio usuário pode desativar sua conta

