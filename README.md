# PreçoCerto — Frontend mobile

App mobile (React Native + Expo + TypeScript) para comparar preços de produtos entre estabelecimentos, montar lista de compras e registrar compras. Consome a API REST do [backend PreçoCerto](../Backend-comparaPreço) (Java + Spring Boot).

O contrato completo da API consumida está documentado em [`API-CONTRACT.md`](./API-CONTRACT.md).

## Rodando o projeto

Pré-requisitos: Node.js 20+, o [app Expo Go](https://expo.dev/go) no celular (ou um emulador Android/iOS), e o backend rodando (veja `API-CONTRACT.md`).

```bash
npm install
cp .env.example .env   # ajuste EXPO_PUBLIC_API_URL se necessário
npx expo start
```

Escaneie o QR code com o Expo Go, ou pressione `a`/`i` no terminal para abrir num emulador Android/iOS.

### Apontando para o backend

A URL da API vem de `EXPO_PUBLIC_API_URL` (arquivo `.env`, veja `.env.example`). Sem essa variável, o app tenta um default por plataforma (`http://10.0.2.2:8080` no emulador Android, `http://localhost:8080` nos demais) — mas em **dispositivo físico** você precisa apontar para o IP da sua máquina na rede local (ex: `http://192.168.0.10:8080`), já que "localhost" no celular é o próprio celular.

Para trocar de ambiente (dev/staging/produção), basta usar um `.env` diferente com outra `EXPO_PUBLIC_API_URL` antes de buildar/rodar.

## Estrutura

```
src/
  components/   componentes reutilizáveis (ui/ genéricos + específicos por domínio)
  config/       configuração de ambiente (URL da API)
  contexts/     estado global (sessão de auth, lista de compras)
  hooks/        hooks compartilhados (estados de loading/erro/vazio, comparação de lista)
  navigation/   stacks e tabs (React Navigation)
  schemas/      schemas zod que espelham os DTOs do backend (fonte dos tipos TS)
  screens/      telas, organizadas por área
  services/api/ cliente HTTP único (axios) + um módulo por recurso da API
  theme/        design tokens (cores, espaçamento, tipografia)
  utils/        formatação, storage seguro do token, validação
```

Toda chamada HTTP passa por `src/services/api/client.ts` (injeta o JWT, trata 401 derrubando a sessão) e as respostas são validadas em runtime contra os schemas em `src/schemas/api.ts` antes de chegar nas telas.

## O que ainda não é real

Duas telas existem propositalmente como estrutura preparada, sem simular dados que a API não fornece:

- **Nota fiscal**: a captura de foto funciona, mas o backend ainda não tem endpoint de upload/OCR — o app explica isso ao usuário e oferece registrar a compra manualmente (isso sim, 100% funcional).
- **Estabelecimentos próximos**: card desabilitado na Home; o backend não tem endpoint de geolocalização "por perto" ainda.

A comparação de preço da **lista de compras inteira** por estabelecimento é real, mas calculada no app: como o backend não tem endpoint de "carrinho", buscamos a comparação de cada produto (`GET /api/products/{id}/prices`) e somamos por estabelecimento no cliente.
