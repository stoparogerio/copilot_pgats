# API de Transferências e Usuários

Esta API permite o registro, login, consulta de usuários e transferências de valores entre usuários, com regras de negócio para aprendizado de testes e automação de APIs.

## Tecnologias

- Node.js
- Express
- Swagger (documentação)
- Banco de dados em memória (variáveis)

## Instalação

1. Clone o repositório ou copie os arquivos para seu ambiente.
2. Instale as dependências:
   ```sh
   npm install express swagger-ui-express
   ```
3. Inicie o servidor:
   ```sh
   node server.js
   ```

## Endpoints

Acesse a documentação interativa do Swagger em: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### Registro de Usuário

- **POST** `/users/register`
- Body: `{ "username": "string", "password": "string", "favorecidos": ["string"] }`

### Login

- **POST** `/users/login`
- Body: `{ "username": "string", "password": "string" }`

### Listar Usuários

- **GET** `/users`

### Transferências

- **POST** `/transfers`
- Body: `{ "from": "string", "to": "string", "amount": number }`
- **GET** `/transfers`

## Regras de Negócio

- Login exige usuário e senha.
- Não é permitido registrar usuários duplicados.
- Transferências para não favorecidos só são permitidas se o valor for menor que R$ 5.000,00.
- O saldo inicial de cada usuário é R$ 10.000,00.

## Testes

Para testar a API, utilize ferramentas como Postman, Insomnia ou scripts automatizados (ex: Supertest).

### Testes Funcionais (Mocha/Chai)

Execute os testes funcionais com:

```sh
npm test                    # Todos os testes
npm run test-rest-external  # Testes externos
npm run test-rest-controller # Testes de controller
```

### Testes de Performance (K6)

A API possui testes de performance abrangentes usando K6 com diversos conceitos aplicados.

#### Pré-requisitos

1. Instale o K6: [https://k6.io/docs/getting-started/installation/](https://k6.io/docs/getting-started/installation/)
2. Inicie o servidor: `npm run start-rest`

#### Executando Testes de Performance

```sh
# Teste de performance padrão (com stages configurados)
npm run k6:performance

# Teste em ambiente de homologação
npm run k6:performance:hml

# Smoke test (1 usuário por 30s) para modo de validar se não há nenhum problema de infra.
npm run k6:performance:smoke

# Load test (50 usuários por 5min)
npm run k6:performance:load

# Stress test (100 usuários por 10min)
npm run k6:performance:stress
```

#### Conceitos Aplicados nos Testes K6

##### 1. GROUPS

Organizam os testes em blocos lógicos para melhor rastreabilidade.

```javascript
// Arquivo: test/k6/user.performance.test.mjs
group("Login User", function () {
  token = login(email, password);
});
```

##### 2. HELPERS

Funções reutilizáveis importadas de módulos separados.

```javascript
// Arquivo: test/k6/helpers/auth.js
import { login, registerUser } from "./helpers/auth.js";

group("Login User", function () {
  const userData = randomFromArray(testData.users);
  token = login(userData.username, userData.password);
});
```

##### 3. THRESHOLDS

Critérios de sucesso que definem se o teste passou ou falhou.

```javascript
// Arquivo: test/k6/user.performance.test.mjs
export const options = {
  thresholds: {
    http_req_duration: ["p(95)<1000"],
    "http_req_duration{expected_response:true}": ["p(99)<5000"],
    http_req_failed: ["rate<0.60"],
    login_duration: ["p(90)<300"],
    success_rate: ["rate>0.51"],
    "http_req_duration{group:::Login User}": ["p(95)<400"],
    "http_req_duration{group:::Register User}": ["p(95)<1000"],
    "http_req_duration{group:::List Users}": ["p(95)<300"],
  },
};
```

##### 4. CHECKS

Validações que verificam se as respostas estão corretas.

```javascript
// Arquivo: test/k6/user.performance.test.mjs
const checkResult = check(response, {
  "Status é 2xx ou 400/422": (r) => r.status >= 200 && r.status < 500,
  "Response é válido": (r) => r.body && r.body.length > 0,
  "Response time menor que 1500ms": (r) => r.timings.duration < 1500,
});
```

##### 5. TRENDS

Métricas customizadas para coletar dados de tempo de resposta.

```javascript
// Arquivo: test/k6/user.performance.test.mjs
import { Trend } from "k6/metrics";

const loginTrend = new Trend("login_duration");

group("Login User", function () {
  const startTime = new Date();
  token = login(userData.username, userData.password);
  const duration = new Date() - startTime;
  loginTrend.add(duration);
});
```

##### 6. FAKER

Geração de dados aleatórios para testes mais realistas.

```javascript
// Arquivo: test/k6/helpers/faker.js
import {
  randomUsername,
  randomPassword,
  randomAmount,
} from "./helpers/faker.js";

group("Register User", function () {
  const newUsername = randomUsername();
  const newPassword = randomPassword(10);
  const response = registerUser(newUsername, newPassword);
});
```

##### 7. VARIÁVEIS DE AMBIENTE

Configurações externalizadas para diferentes ambientes.

```javascript
// Arquivo: test/k6/helpers/config.js
export function getBaseUrl() {
  return __ENV.BASE_URL || "http://localhost:3000";
}

// Uso no teste
const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const ENVIRONMENT = __ENV.ENVIRONMENT || "dev";
```

##### 8. STAGES

Perfil de carga progressivo para simular cenários reais.

```javascript
// Arquivo: test/k6/user.performance.test.mjs
export const options = {
  stages: [
    { duration: "30s", target: 10 }, // Ramp-up
    { duration: "1m", target: 50 }, // Carga média
    { duration: "2m", target: 50 }, // Platô
    { duration: "30s", target: 78 }, // Spike
    { duration: "1m", target: 78 }, // Platô
    { duration: "30s", target: 0 }, // Ramp-down
  ],
};
```

##### 9. REAPROVEITAMENTO DE RESPOSTA (Token JWT)

Token obtido no login é reutilizado em requisições subsequentes.

```javascript
// Arquivo: test/k6/user.performance.test.mjs
let token;

group("Login User", function () {
  token = login(userData.username, userData.password);
});

group("List Users", function () {
  const params = {
    headers: getAuthHeaders(token), // Reusa o token
  };
  const response = http.get(url, params);
});
```

##### 10. USO DE TOKEN DE AUTENTICAÇÃO

Inclusão de token JWT no header das requisições.

```javascript
// Arquivo: test/k6/helpers/config.js
export function getAuthHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// Arquivo: test/k6/user.performance.test.mjs
const params = {
  headers: getAuthHeaders(token),
};
const response = http.get(url, params);
```

##### 10.1 TRANSFERS E LIST TRANSFERS COM TOKEN

Ambos os grupos reaproveitam o token obtido no login para autorizar requisições de transferência e listagem:

```javascript
// Grupo Transfers
const params = {
  headers: {
    ...getJsonHeaders(),
    ...getAuthHeaders(token), // inclui Bearer token
  },
};
http.post(`${BASE_URL}/transfers`, payload, params);

// Grupo List Transfers
const paramsList = {
  headers: getAuthHeaders(token), // inclui Bearer token
};
http.get(`${BASE_URL}/transfers`, paramsList);
```

##### 11. DATA-DRIVEN TESTING

Testes baseados em dados externos (JSON).

```javascript
// Arquivo: test/k6/data/users.json
{
  "users": [
    {"username": "user_test_001", "password": "password123"},
    {"username": "user_test_002", "password": "password456"}
  ]
}

// Arquivo: test/k6/user.performance.test.mjs
const testData = JSON.parse(open('./data/users.json'));

export default function() {
    const userData = randomFromArray(testData.users);
    token = login(userData.username, userData.password);
}
```

#### Relatórios de Performance

Os relatórios são gerados automaticamente em formato HTML e JSON no diretório `test/k6/reports/`:

- **HTML**: Visualização gráfica interativa
- **JSON**: Dados completos para análise
- **Histórico**: Todos os relatórios são mantidos com timestamp

Formato dos arquivos:

```
test/k6/reports/{ambiente}_{timestamp}_summary.html
test/k6/reports/{ambiente}_{timestamp}_summary.json
```

Exemplo:

```
test/k6/reports/hml_2025-12-26T10-30-45-123Z_summary.html
```

## Observações

- Todos os dados são armazenados em memória e serão perdidos ao reiniciar o servidor.
- O endpoint `/api-docs` exibe a documentação Swagger.
