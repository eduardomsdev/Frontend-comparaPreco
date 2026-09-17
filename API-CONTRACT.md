# PreçoCerto — Contrato da API (backend)

Este arquivo documenta a API do backend (`../Backend-comparaPreço`) pra quem for construir o frontend, sem precisar ler o código Java. Repositórios são separados: este projeto só consome a API, não a implementa.

Se algo aqui parecer desatualizado, o código-fonte é a referência final: `../Backend-comparaPreço/src/main/java/com/precocerto/backend/dto/` (formato dos dados) e `.../controller/` (rotas).

## Rodando o backend localmente

```bash
cd ../Backend-comparaPreço
docker compose up -d          # sobe o Postgres
./mvnw spring-boot:run        # API em http://localhost:8080
```

Swagger UI interativo: `http://localhost:8080/swagger-ui.html` (tem botão "Authorize" pra colar o token JWT e testar rotas protegidas direto por lá).

Base URL: `http://localhost:8080` (sem prefixo de versão, ex: `/api/products`, não `/api/v1/products`).

## Autenticação

JWT via header `Authorization: Bearer <token>`. Token expira em 24h (sem refresh token nessa versão — ao expirar, o usuário precisa logar de novo).

### `POST /api/auth/register` — público

```json
// request
{ "name": "string", "email": "string", "password": "string (mín. 8 caracteres)" }

// response 201
{ "id": 1, "name": "string", "email": "string", "role": "USER", "createdAt": "2026-09-17T18:00:00" }
```
`role` é sempre `"USER"` no cadastro — não existe forma de virar `ADMIN` pela API. `409` se o e-mail já existir.

### `POST /api/auth/login` — público

```json
// request
{ "email": "string", "password": "string" }

// response 200
{ "token": "eyJhbGc...", "expiresInMs": 86400000 }
```
`401` genérico ("E-mail ou senha inválidos") tanto pra e-mail inexistente quanto senha errada — a API nunca revela qual dos dois. Não dá pra usar isso pra descobrir se um e-mail está cadastrado.

### `GET /api/users/me` — autenticado

```json
{ "id": 1, "name": "string", "email": "string", "role": "USER", "createdAt": "2026-09-17T18:00:00" }
```
Bom endpoint pra validar se o token ainda é válido / carregar o perfil ao abrir o app.

## Formato de erro (padrão em toda a API)

```json
{
  "timestamp": "2026-09-17T18:00:00",
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "Existem dados inválidos",
  "details": { "email": "E-mail inválido" }   // presente só em erro de validação
}
```

Códigos de `error` usados: `VALIDATION_ERROR` (400), `MALFORMED_REQUEST` (400, JSON mal formado ou enum inválido), `INVALID_PARAMETER` (400, ex. id não numérico na URL), `UNAUTHORIZED` (401, token ausente/inválido/expirado), `INVALID_CREDENTIALS` (401, login errado), `FORBIDDEN` (403), `NOT_FOUND` (404), `EMAIL_ALREADY_EXISTS` (409), `INTERNAL_ERROR` (500, nunca inclui stack trace).

## Establishments

| Rota | Auth | Descrição |
|---|---|---|
| `GET /api/establishments` | público | lista tudo |
| `GET /api/establishments/{id}` | público | um item |
| `POST /api/establishments` | autenticado | cria |
| `PUT /api/establishments/{id}` | autenticado | atualiza (substitui tudo) |
| `DELETE /api/establishments/{id}` | autenticado | remove, retorna 204 |

```json
// request (POST/PUT)
{
  "name": "string",
  "address": "string | null",
  "city": "string",
  "state": "PR",              // sigla UF, 2 letras (normalizado pra maiúsculo no servidor)
  "zipCode": "80000-000 | null",
  "latitude": null,
  "longitude": null,
  "type": "SUPERMERCADO"
}

// response
{
  "id": 1, "name": "string", "address": "string", "city": "string", "state": "PR",
  "zipCode": "string", "latitude": null, "longitude": null,
  "type": "SUPERMERCADO", "createdAt": "2026-09-17T18:00:00"
}
```

`type` (enum `EstablishmentType`): `SUPERMERCADO`, `FARMACIA`, `LANCHONETE`, `RESTAURANTE`, `POSTO`, `OUTRO`.

## Products

| Rota | Auth | Descrição |
|---|---|---|
| `GET /api/products` | público | lista tudo |
| `GET /api/products/search?name=` | público | busca por nome (ignora acento/maiúsculas) |
| `GET /api/products/{id}` | público | um item |
| `GET /api/products/{id}/prices` | público | **comparação de preços** (ver seção Prices) |
| `POST /api/products` | autenticado | cria |
| `PUT /api/products/{id}` | autenticado | atualiza |
| `DELETE /api/products/{id}` | autenticado | remove, retorna 204 |

```json
// request (POST/PUT)
{ "name": "string", "brand": "string | null", "category": "ALIMENTOS", "unit": "KG", "description": "string | null" }

// response
{ "id": 1, "name": "string", "brand": "string", "category": "ALIMENTOS", "unit": "KG", "description": "string", "createdAt": "..." }
```

`category` (enum `ProductCategory`): `ALIMENTOS`, `BEBIDAS`, `LIMPEZA`, `HIGIENE`, `HORTIFRUTI`, `OUTROS`.
`unit` (enum `Unit`): `KG`, `G`, `L`, `ML`, `UN`.

A busca (`?name=`) normaliza o termo (sem acento, case-insensitive) então "joao" encontra "João".

## Prices

Só criação — não existe update/delete (é histórico, cada envio vira uma linha nova).

### `POST /api/prices` — autenticado

```json
// request
{ "productId": 1, "establishmentId": 1, "price": 22.90, "collectedAt": null }
// response 201
{ "id": 1, "productId": 1, "establishmentId": 1, "price": 22.90, "collectedAt": "...", "source": "USUARIO" }
```
`collectedAt` é opcional (default = agora). `source` sempre vem `"USUARIO"` quando criado por este endpoint (o enum `PriceSource` também tem `NOTA_FISCAL`, `API`, `ADMIN`, mas nenhum é atribuível pela API pública ainda).

### `GET /api/products/{id}/prices` — público (é o endpoint de comparação)

```json
{
  "productId": 1,
  "productName": "Arroz 5kg",
  "bestPrice": { "establishmentId": 1, "establishmentName": "Supermercado A", "price": 22.90, "collectedAt": "...", "source": "ADMIN" },
  "prices": [
    { "establishmentId": 1, "establishmentName": "Supermercado A", "price": 22.90, "collectedAt": "...", "source": "ADMIN" },
    { "establishmentId": 2, "establishmentName": "Supermercado B", "price": 24.50, "collectedAt": "...", "source": "ADMIN" }
  ]
}
```
Já vem pronto pra exibir: `prices` tem só a observação **mais recente por estabelecimento** (não o histórico bruto), ordenado do mais barato pro mais caro, com `bestPrice` = primeiro item (ou `null` se o produto não tiver nenhum preço ainda — não é erro, é lista vazia). **Não inclui quem enviou o preço** (sem `userId` em lugar nenhum desta resposta, de propósito).

## Purchases

Todas exigem autenticação, e são sempre restritas ao usuário logado — não existe rota pra ver compra de outra pessoa.

### `POST /api/purchases`

```json
// request
{
  "establishmentId": 1,
  "purchaseDate": null,
  "items": [
    { "productId": 1, "quantity": 2, "unitPrice": 21.50 }
  ]
}
```
`purchaseDate` opcional (default = agora). `totalPrice` de cada item e `totalValue` da compra **são calculados pelo servidor** (quantidade × preço unitário) — não precisa (e não adianta) mandar esses campos.

### `GET /api/purchases` — lista só as compras do usuário logado

### `GET /api/purchases/{id}`

```json
{
  "id": 1, "establishmentId": 1, "establishmentName": "string",
  "purchaseDate": "...", "totalValue": 57.85, "imageUrl": null,
  "status": "MANUAL",
  "items": [
    { "id": 1, "productId": 1, "productName": "string", "quantity": 2, "unitPrice": 21.50, "totalPrice": 43.00 }
  ]
}
```
Pedir o id de uma compra que não é sua devolve **404** (não 403) — do jeito que a API deliberadamente não distingue "não existe" de "não é sua", trate os dois casos do frontend do mesmo jeito (ex: mensagem genérica "compra não encontrada").

`status` (enum `PurchaseStatus`): `MANUAL`, `PENDING_OCR`, `CONFIRMED`. `imageUrl` existe no schema mas **ainda não há endpoint de upload** — hoje sempre vem `null`. OCR de nota fiscal ainda não foi implementado.

## O que ainda não existe (não desenhe telas assumindo isso)

- Upload de foto de nota fiscal / OCR
- Edição ou exclusão de compra depois de criada
- Lista de compras com comparação entre múltiplos estabelecimentos (montar carrinho e ver onde sai mais barato no total)
- Refresh token (ao expirar o JWT, só logando de novo)
- Papéis/permissões diferenciadas (qualquer usuário logado pode criar/editar/apagar establishment e product — não é só admin)
