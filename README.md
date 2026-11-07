# Encurtador de Link

Encurtador de links feito com Node.js, Express e MongoDB. Antes de redirecionar, mostra uma página intermediária com contagem regressiva de 5 segundos e um espaço para anúncio (opcional).

## Requisitos

- Node.js 20 ou mais recente
- Um banco MongoDB (por exemplo, o plano gratuito do MongoDB Atlas)

## Rodando localmente

```bash
cp server/.env.example server/.env   # depois edite MONGO_URI e o que mais precisar
npm run dev
```

Acesse `http://localhost:3000`.

## Testes

```bash
npm test
```

Os testes não precisam de banco de dados: usam um modelo falso em memória.

## Variáveis de ambiente

Localmente, ficam no arquivo `server/.env` (copie de `server/.env.example`). Na hospedagem, cadastre no painel do serviço: o `.env` é opcional e, se não existir, o app usa as variáveis do sistema.

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `MONGO_URI` | sim | String de conexão do MongoDB. |
| `PORT` | não | Porta HTTP (padrão `3000`). A maioria das hospedagens define sozinha. `APP_PORT` também é aceita. |
| `BASE_URL` | não | URL pública, sem barra no final (ex.: `https://meusite.com`). Se vazia, é deduzida de cada requisição. |
| `TRUST_PROXY` | não | Quantos proxies existem na frente do app (padrão `1`). Use `false` se não houver nenhum. Necessário para o rate limit identificar o IP certo. |
| `BLOCKED_HOSTS` | não | Domínios que não podem ser encurtados, separados por vírgula. Subdomínios também são bloqueados. |
| `AD_SCRIPT_SRC` | não | Endereço do script de anúncio, copiado do painel do provedor. Sem ele, nenhum anúncio é exibido. |
| `AD_ZONE_ID` | não | ID da zona do anúncio (vira o atributo `data-zone`). |

## Hospedagem

O projeto roda em qualquer serviço que execute Node.js (Render, Railway, um VPS etc.):

- **Comando de instalação:** `npm install` (o `postinstall` instala as dependências de `server/`)
- **Comando de início:** `npm start`
- **Health check:** `GET /healthz` (retorna `503` enquanto o banco estiver indisponível)- **Variáveis de ambiente:** cadastre no painel da hospedagem (pelo menos `MONGO_URI`). O arquivo `.env` é só para uso local e não deve ser enviado ao repositório.

Links expirados são apagados automaticamente pelo MongoDB através de um índice TTL em `expiresAt`.

## API

`POST /shorten`

```json
{ "url": "https://exemplo.com/pagina", "expiration": 7 }
```

`expiration` é opcional (em dias, de 1 a 365, padrão 30). Resposta `201`:

```json
{ "shortUrl": "https://meusite.com/Ab3_x9Zq", "expiresAt": "2026-11-14T12:00:00.000Z" }
```

`GET /:codigo` mostra a página de redirecionamento, `404` se o link não existir e `410` se tiver expirado.
