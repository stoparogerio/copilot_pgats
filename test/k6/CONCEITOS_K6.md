# Conceitos K6 Aplicados - Referência Rápida

Este documento apresenta todos os conceitos K6 implementados no projeto com exemplos práticos de código.

---

## 📚 Índice de Conceitos

1. [Groups](#1-groups)
2. [Helpers](#2-helpers)
3. [Thresholds](#3-thresholds)
4. [Checks](#4-checks)
5. [Trends](#5-trends)
6. [Faker](#6-faker)
7. [Variáveis de Ambiente](#7-variáveis-de-ambiente)
8. [Stages](#8-stages)
9. [Reaproveitamento de Resposta](#9-reaproveitamento-de-resposta)
10. [Token de Autenticação](#10-token-de-autenticação)
11. [Data-Driven Testing](#11-data-driven-testing)

---

## 1. GROUPS

**Conceito**: Organizar testes em blocos lógicos para melhor rastreabilidade e métricas agrupadas.

**Localização**: `test/k6/user.performance.test.mjs`

**Código**:

```javascript
import { group } from "k6";

export default function () {
  group("Login User", function () {
    // Testes de login aqui
    token = login(email, password);
  });

  group("Register User", function () {
    // Testes de registro aqui
    const response = registerUser(username, password);
  });
}
```

**Benefícios**:

- Métricas específicas por grupo
- Organização clara dos testes
- Facilita análise de relatórios

---

## 2. HELPERS

**Conceito**: Funções reutilizáveis em módulos separados para evitar duplicação de código.

**Localização**: `test/k6/helpers/auth.js`

**Código**:

```javascript
// Arquivo: helpers/auth.js
export function login(username, password) {
  const url = `${__ENV.BASE_URL}/users/login`;

  const payload = JSON.stringify({
    username: username,
    password: password,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = http.post(url, payload, params);
  return response.json("token");
}

// Arquivo: user.performance.test.mjs
import { login } from "./helpers/auth.js";

export default function () {
  const token = login("user123", "password123");
}
```

**Benefícios**:

- Código limpo e organizado
- Reutilização em múltiplos testes
- Fácil manutenção

---

## 3. THRESHOLDS

**Conceito**: Critérios de sucesso que determinam se o teste passou ou falhou.

**Localização**: `test/k6/user.performance.test.mjs`

**Código**:

```javascript
export const options = {
  thresholds: {
    // 95% das requisições devem completar em menos de 1000ms
    http_req_duration: ["p(95)<1000"],

    // 99% das requisições esperadas devem completar em menos de 5s
    "http_req_duration{expected_response:true}": ["p(99)<5000"],

    // Taxa de erro deve ser menor que 60%
    http_req_failed: ["rate<0.60"],

    // 90% das requisições de login devem completar em menos de 300ms
    login_duration: ["p(90)<300"],

    // Taxa de sucesso deve ser maior que 51%
    success_rate: ["rate>0.51"],

    // Thresholds específicos por grupo
    "http_req_duration{group:::Login User}": ["p(95)<400"],
    "http_req_duration{group:::Register User}": ["p(95)<1000"],
    "http_req_duration{group:::List Users}": ["p(95)<300"],
  },
};
```

**Percentis Comuns**:

- `p(90)`: 90% das requisições
- `p(95)`: 95% das requisições
- `p(99)`: 99% das requisições

---

## 4. CHECKS

**Conceito**: Validações que verificam se as respostas estão corretas (não afetam o resultado final do teste).

**Localização**: `test/k6/user.performance.test.mjs`

**Código**:

```javascript
import { check } from "k6";

const checkResult = check(response, {
  "Status é 2xx ou 400/422": (r) => r.status >= 200 && r.status < 500,
  "Response é válido": (r) => r.body && r.body.length > 0,
  "Response time menor que 1500ms": (r) => r.timings.duration < 1500,
});
```

**Diferença entre Checks e Thresholds**:

- **Checks**: Validações individuais (não falham o teste)
- **Thresholds**: Critérios globais (falham o teste se não atendidos)

---

## 5. TRENDS

**Conceito**: Métricas customizadas para coletar dados de tempo de resposta específicos.

**Localização**: `test/k6/user.performance.test.mjs`

**Código**:

```javascript
import { Trend } from "k6/metrics";

// Definir trends
const loginTrend = new Trend("login_duration");
const registerTrend = new Trend("register_duration");
const listUsersTrend = new Trend("list_users_duration");

export default function () {
  group("Login User", function () {
    const startTime = new Date();
    token = login(userData.username, userData.password);
    const duration = new Date() - startTime;

    // Adicionar valor ao trend
    loginTrend.add(duration);
  });
}
```

**Outras Métricas Customizadas**:

```javascript
import { Rate, Counter, Gauge } from "k6/metrics";

const successRate = new Rate("success_rate"); // Taxa
const loginCounter = new Counter("login_count"); // Contador
const activeUsers = new Gauge("active_users"); // Medidor
```

---

## 6. FAKER

**Conceito**: Geração de dados aleatórios para tornar os testes mais realistas.

**Localização**: `test/k6/helpers/faker.js`

**Código**:

```javascript
// Arquivo: helpers/faker.js
export function randomUsername() {
  const adjectives = ["happy", "clever", "brave", "swift"];
  const nouns = ["user", "tester", "developer", "engineer"];

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 10000);

  return `${adjective}_${noun}_${number}`;
}

export function randomPassword(length = 8) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Arquivo: user.performance.test.mjs
import { randomUsername, randomPassword } from "./helpers/faker.js";

export default function () {
  const username = randomUsername(); // clever_developer_7234
  const password = randomPassword(12); // aB3xK9mQ2pL5
  registerUser(username, password);
}
```

---

## 7. VARIÁVEIS DE AMBIENTE

**Conceito**: Externalizar configurações para diferentes ambientes (dev, hml, prod).

**Localização**: `test/k6/.env`, `test/k6/helpers/config.js`

**Código**:

```javascript
// Arquivo: .env
BASE_URL=http://localhost:3000
ENVIRONMENT=dev

// Arquivo: helpers/config.js
export function getBaseUrl() {
    return __ENV.BASE_URL || 'http://localhost:3000';
}

export function getEnvironment() {
    return __ENV.ENVIRONMENT || 'dev';
}

// Arquivo: user.performance.test.mjs
export default function() {
    const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
    console.log(`Testando em: ${BASE_URL}`);
}
```

**Uso via CLI**:

```bash
k6 run --env BASE_URL=http://staging.com --env ENVIRONMENT=hml test/k6/user.performance.test.mjs
```

---

## 8. STAGES

**Conceito**: Definir perfil de carga progressivo para simular cenários realistas.

**Localização**: `test/k6/user.performance.test.mjs`

**Código**:

```javascript
export const options = {
  stages: [
    { duration: "30s", target: 10 }, // Ramp-up: 0 → 10 usuários em 30s
    { duration: "1m", target: 50 }, // Ramp-up: 10 → 50 usuários em 1min
    { duration: "2m", target: 50 }, // Platô: 50 usuários por 2min
    { duration: "30s", target: 78 }, // Spike: 50 → 78 usuários em 30s
    { duration: "1m", target: 78 }, // Platô: 78 usuários por 1min
    { duration: "30s", target: 0 }, // Ramp-down: 78 → 0 em 30s
  ],
};
```

**Perfis de Teste**:

```javascript
// Smoke Test
stages: [{ duration: "30s", target: 1 }];

// Load Test
stages: [
  { duration: "1m", target: 50 },
  { duration: "5m", target: 50 },
  { duration: "1m", target: 0 },
];

// Stress Test
stages: [
  { duration: "2m", target: 100 },
  { duration: "5m", target: 200 },
  { duration: "2m", target: 0 },
];
```

---

## 9. REAPROVEITAMENTO DE RESPOSTA

**Conceito**: Reutilizar dados de uma resposta (ex: token JWT) em requisições subsequentes.

**Localização**: `test/k6/user.performance.test.mjs`

**Código**:

```javascript
export default function () {
  let token; // Variável para armazenar o token
  let userData;

  // 1. Obter token no login
  group("Login User", function () {
    userData = randomFromArray(testData.users);
    token = login(userData.username, userData.password); // Armazena token
  });

  sleep(1);

  // 2. Reutilizar token em outras requisições
  group("Transfers", function () {
    const url = `${BASE_URL}/transfers`;
    const payload = JSON.stringify({
      from: userData.username,
      to: randomFromArray(testData.users).username,
      amount: randomAmount(1, 50),
    });
    const params = {
      headers: {
        ...getJsonHeaders(),
        ...getAuthHeaders(token),
      },
    };
    http.post(url, payload, params);
  });

  group("List Transfers", function () {
    const url = `${BASE_URL}/transfers`;
    const params = { headers: getAuthHeaders(token) };
    http.get(url, params);
  });
}
```

---

## 10. TOKEN DE AUTENTICAÇÃO

**Conceito**: Usar token JWT para autenticar requisições.

**Localização**: `test/k6/helpers/auth.js`, `test/k6/helpers/config.js`

**Código**:

```javascript
// Arquivo: helpers/auth.js
export function login(username, password) {
  const url = `${__ENV.BASE_URL}/users/login`;

  const payload = JSON.stringify({
    username: username,
    password: password,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = http.post(url, payload, params);

  check(response, {
    "Login realizado com sucesso": (r) => r.status === 200,
    "Token retornado": (r) => r.json("token") !== undefined,
  });

  return response.json("token"); // Retorna o token JWT
}

// Arquivo: helpers/config.js
export function getAuthHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`, // Token no header
  };
}

// Arquivo: user.performance.test.mjs
const token = login("user123", "password123");

const params = {
  headers: getAuthHeaders(token),
};

const response = http.get(`${BASE_URL}/protected-route`, params);
```

---

## 11. DATA-DRIVEN TESTING

**Conceito**: Usar dados externos (JSON) para executar testes com múltiplos conjuntos de dados.

**Localização**: `test/k6/data/users.json`, `test/k6/user.performance.test.mjs`

**Código**:

```javascript
// Arquivo: data/users.json
{
  "users": [
    {
      "username": "user_test_001",
      "password": "password123",
      "favorecidos": ["user_test_002"]
    },
    {
      "username": "user_test_002",
      "password": "password456",
      "favorecidos": ["user_test_001"]
    }
  ],
  "transfers": [
    {
      "from": "user_test_001",
      "to": "user_test_002",
      "amount": 100.50
    }
  ]
}

// Arquivo: user.performance.test.mjs
import { randomFromArray, randomAmount } from './helpers/faker.js';

// Importar dados
const testData = JSON.parse(open('./data/users.json'));

export default function() {
  // Usar dados do JSON para login
  const userData = randomFromArray(testData.users);
  token = login(userData.username, userData.password);

  // Usar dados dinâmicos para transferência (evita saldo insuficiente)
  const sender = randomFromArray(testData.users);
  const recipient = randomFromArray(testData.users.filter(u => u.username !== sender.username));
  transfer(sender.username, recipient.username, randomAmount(1, 50));
}
```

**Benefícios**:

- Massa de dados centralizada
- Facilita manutenção
- Permite testes com múltiplos cenários

---

## 🎯 Exemplo Completo Integrado

```javascript
import http from "k6/http";
import { check, group, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";
import { login } from "./helpers/auth.js";
import { randomUsername, randomFromArray } from "./helpers/faker.js";
import { getAuthHeaders } from "./helpers/config.js";

const testData = JSON.parse(open("./data/users.json"));
const loginTrend = new Trend("login_duration");
const successRate = new Rate("success_rate");

export const options = {
  stages: [
    { duration: "1m", target: 50 },
    { duration: "2m", target: 50 },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  let token;

  group("Login User", function () {
    const userData = randomFromArray(testData.users);
    const startTime = new Date();
    token = login(userData.username, userData.password);
    loginTrend.add(new Date() - startTime);
  });

  sleep(1);

  group("List Users", function () {
    const url = `${__ENV.BASE_URL}/users`;
    const response = http.get(url, { headers: getAuthHeaders(token) });

    const checkResult = check(response, {
      "Status é 200": (r) => r.status === 200,
      "Response é array": (r) => Array.isArray(r.json()),
    });

    successRate.add(checkResult ? 1 : 0);
  });
}
```

---

## 📊 Resumo dos Arquivos

| Conceito      | Arquivo Principal                                          |
| ------------- | ---------------------------------------------------------- |
| Groups        | `user.performance.test.mjs`                                |
| Helpers       | `helpers/auth.js`, `helpers/faker.js`, `helpers/config.js` |
| Thresholds    | `user.performance.test.mjs` (options)                      |
| Checks        | `user.performance.test.mjs`                                |
| Trends        | `user.performance.test.mjs` (metrics)                      |
| Faker         | `helpers/faker.js`                                         |
| Env Variables | `.env`, `helpers/config.js`                                |
| Stages        | `user.performance.test.mjs` (options.stages)               |
| Token Reuse   | `user.performance.test.mjs` (token variable)               |
| Auth          | `helpers/auth.js`, `helpers/config.js`                     |
| Data-Driven   | `data/users.json`                                          |

---

**Última Atualização**: 26 de Dezembro de 2025
