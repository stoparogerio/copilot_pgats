# Arquitetura do Projeto - API de Transferências e Usuários

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura de Diretórios](#estrutura-de-diretórios)
3. [Camadas da Aplicação](#camadas-da-aplicação)
4. [Arquitetura de Testes](#arquitetura-de-testes)
5. [Fluxo de Dados](#fluxo-de-dados)
6. [Tecnologias Utilizadas](#tecnologias-utilizadas)
7. [Padrões e Boas Práticas](#padrões-e-boas-práticas)

---

## 🎯 Visão Geral

Esta API RESTful foi desenvolvida para gerenciar usuários e transferências financeiras, seguindo princípios de Clean Architecture e separação de responsabilidades. O projeto utiliza Node.js com Express e implementa uma arquitetura em camadas (Controller, Service, Model).

### Objetivos do Projeto

- ✅ Fornecer uma API REST completa para operações de usuário e transferências
- ✅ Servir como base para estudos de testes automatizados (funcionais e performance)
- ✅ Demonstrar boas práticas de desenvolvimento e arquitetura de software
- ✅ Implementar autenticação JWT
- ✅ Documentação via Swagger/OpenAPI

---

## 📁 Estrutura de Diretórios

```
copilot_pgats/
│
├── app.js                          # Configuração principal da aplicação Express
├── server.js                       # Inicialização do servidor HTTP
├── package.json                    # Dependências e scripts NPM
├── swagger.json                    # Documentação OpenAPI/Swagger
├── README.md                       # Documentação geral do projeto
├── ARQUITETURA.md                  # Este arquivo
│
├── controller/                     # Camada de Controle (Controllers)
│   ├── userController.js          # Endpoints de usuário (register, login, list)
│   └── transferController.js      # Endpoints de transferência
│
├── service/                        # Camada de Serviço (Business Logic)
│   ├── userService.js             # Lógica de negócio de usuários
│   └── transferService.js         # Lógica de negócio de transferências
│
├── model/                          # Camada de Modelo (Data Access)
│   ├── userModel.js               # Modelo de dados de usuário (in-memory)
│   └── transferModel.js           # Modelo de dados de transferência (in-memory)
│
├── middleware/                     # Middlewares
│   └── authMiddleware.js          # Middleware de autenticação JWT
│
├── test/                          # Testes Automatizados
│   ├── helpers/                   # Helpers compartilhados para testes
│   │
│   ├── rest/                      # Testes REST (Mocha/Chai)
│   │   ├── controller/            # Testes unitários dos controllers
│   │   │   ├── userController.test.js
│   │   │   ├── userController.unit.test.js
│   │   │   ├── transferController.test.js
│   │   │   └── transferController.unit.test.js
│   │   │
│   │   └── external/              # Testes de integração (API externa)
│   │       ├── user.external.test.js
│   │       └── transfer.external.test.js
│   │
│   └── k6/                        # Testes de Performance (K6)
│       ├── user.performance.test.js  # Teste principal de performance
│       │
│       ├── helpers/               # Helpers para testes K6
│       │   ├── auth.js           # Helper de autenticação (login, register)
│       │   ├── faker.js          # Gerador de dados fake
│       │   └── config.js         # Configurações centralizadas
│       │
│       ├── data/                 # Dados para Data-Driven Testing
│       │   └── users.json        # Massa de dados de usuários
│       │
│       ├── reports/              # Relatórios de execução
│       │   ├── README.md         # Documentação dos relatórios
│       │   └── {ambiente}_{timestamp}_summary.html
│       │
│       ├── .env                  # Variáveis de ambiente (local)
│       └── .env.example          # Exemplo de variáveis de ambiente
│
└── mochawesome-report/           # Relatórios de testes Mocha
    ├── mochawesome.html
    ├── mochawesome.json
    └── assets/
```

---

## 🏗️ Camadas da Aplicação

### 1. **Controller Layer** (Controladores)

**Responsabilidade**: Receber requisições HTTP, validar entrada, chamar serviços e retornar respostas.

**Arquivos**:

- `controller/userController.js`
- `controller/transferController.js`

**Características**:

- Manipula objetos `req` (request) e `res` (response)
- Validação básica de entrada
- Delega lógica de negócio para a camada Service
- Retorna status HTTP apropriados

**Exemplo de Fluxo**:

```
HTTP Request → Controller → Service → Model → Database (in-memory)
                    ↓
              HTTP Response
```

---

### 2. **Service Layer** (Serviços)

**Responsabilidade**: Implementar a lógica de negócio da aplicação.

**Arquivos**:

- `service/userService.js`
- `service/transferService.js`

**Características**:

- Validações de regras de negócio
- Orquestração de chamadas ao Model
- Criptografia de senhas (bcrypt)
- Geração de tokens JWT
- Regras de transferência (favorecidos, limites)

**Regras de Negócio Implementadas**:

- ✅ Não permitir usuários duplicados
- ✅ Validar credenciais no login
- ✅ Saldo inicial de R$ 10.000,00
- ✅ Transferências para não-favorecidos limitadas a R$ 5.000,00
- ✅ Validação de saldo suficiente

---

### 3. **Model Layer** (Modelos)

**Responsabilidade**: Persistência e acesso a dados.

**Arquivos**:

- `model/userModel.js`
- `model/transferModel.js`

**Características**:

- Armazenamento em memória (arrays)
- CRUD de usuários e transferências
- Abstrações de acesso a dados
- Simulação de banco de dados

**Estrutura de Dados**:

```javascript
// Usuário
{
  id: 'uuid',
  username: 'string',
  password: 'hash',
  balance: 10000,
  favorecidos: ['username1', 'username2']
}

// Transferência
{
  id: 'uuid',
  from: 'username',
  to: 'username',
  amount: 100.50,
  timestamp: '2025-12-26T10:30:00Z'
}
```

---

### 4. **Middleware Layer** (Middlewares)

**Responsabilidade**: Interceptar requisições para processamento adicional.

**Arquivos**:

- `middleware/authMiddleware.js`

**Características**:

- Validação de token JWT
- Proteção de rotas autenticadas
- Extração de dados do usuário do token

---

## 🧪 Arquitetura de Testes

### Pirâmide de Testes

```
        /\
       /  \  E2E (External Tests)
      /____\
     /      \  Integration Tests
    /________\
   /          \  Unit Tests
  /______________\
       Base
```

### 1. **Testes Unitários** (Mocha/Chai)

**Localização**: `test/rest/controller/*unit.test.js`

**Características**:

- Testam unidades isoladas (funções, métodos)
- Usam mocks e stubs (Sinon.js)
- Rápidos e focados
- Sem dependências externas

**Ferramentas**:

- Mocha (test runner)
- Chai (assertions)
- Sinon (mocks/stubs)

---

### 2. **Testes de Integração** (Mocha/Chai/Supertest)

**Localização**: `test/rest/external/*.test.js`

**Características**:

- Testam fluxos completos da API
- Requisições HTTP reais
- Validam integração entre camadas
- Verificam comportamento end-to-end

**Ferramentas**:

- Supertest (HTTP assertions)
- Chai (validações)

---

### 3. **Testes de Performance** (K6)

**Localização**: `test/k6/`

**Características**:

- Testes de carga, estresse e spike
- Métricas detalhadas de performance
- Thresholds para critérios de sucesso
- Relatórios HTML com histórico

#### Conceitos Implementados

| Conceito          | Descrição                     | Arquivo                               |
| ----------------- | ----------------------------- | ------------------------------------- |
| **Groups**        | Organização lógica dos testes | `user.performance.test.js`            |
| **Helpers**       | Funções reutilizáveis         | `helpers/auth.js`, `helpers/faker.js` |
| **Thresholds**    | Critérios de sucesso/falha    | `user.performance.test.js` (options)  |
| **Checks**        | Validações de resposta        | `user.performance.test.js`            |
| **Trends**        | Métricas customizadas         | `user.performance.test.js` (Trend)    |
| **Faker**         | Geração de dados aleatórios   | `helpers/faker.js`                    |
| **Env Variables** | Configurações externas        | `.env`, `helpers/config.js`           |
| **Stages**        | Perfil de carga progressivo   | `user.performance.test.js` (stages)   |
| **Token Reuse**   | Reaproveitamento JWT          | `user.performance.test.js` (token)    |
| **Auth**          | Autenticação JWT              | `helpers/auth.js`                     |
| **Data-Driven**   | Testes baseados em dados      | `data/users.json`                     |

#### Estrutura Modular K6

```
test/k6/
├── user.performance.test.js    # Arquivo principal (orquestra os testes)
├── helpers/                    # Módulos reutilizáveis
│   ├── auth.js                # Login, registro
│   ├── faker.js               # Geração de dados
│   └── config.js              # Configurações
├── data/                      # Massa de dados
│   └── users.json            # Dados para data-driven
└── reports/                   # Relatórios históricos
    └── {env}_{timestamp}_summary.html
```

---

## 🔄 Fluxo de Dados

### Fluxo de Registro de Usuário

```
1. Cliente → POST /users/register
             ↓
2. userController.register()
             ↓
3. userService.register()
   - Valida se usuário já existe
   - Criptografa senha (bcrypt)
             ↓
4. userModel.create()
   - Armazena em memória
             ↓
5. Retorna → 201 Created
```

### Fluxo de Login

```
1. Cliente → POST /users/login
             ↓
2. userController.login()
             ↓
3. userService.login()
   - Busca usuário
   - Valida senha (bcrypt.compare)
   - Gera token JWT
             ↓
4. Retorna → 200 OK + { token }
```

### Fluxo de Transferência

```
1. Cliente → POST /transfers + JWT Token
             ↓
2. authMiddleware.verify()
   - Valida token
             ↓
3. transferController.create()
             ↓
4. transferService.create()
   - Valida favorecido/limite
   - Verifica saldo
   - Atualiza saldos
             ↓
5. transferModel.create()
   - Registra transferência
             ↓
6. Retorna → 201 Created
```

---

## 💻 Tecnologias Utilizadas

### Backend

| Tecnologia         | Versão | Propósito              |
| ------------------ | ------ | ---------------------- |
| Node.js            | -      | Runtime JavaScript     |
| Express            | 4.17.1 | Framework web          |
| bcryptjs           | 3.0.2  | Criptografia de senhas |
| jsonwebtoken       | 9.0.2  | Autenticação JWT       |
| swagger-ui-express | 5.0.1  | Documentação da API    |

### Testes Funcionais

| Tecnologia  | Versão | Propósito                |
| ----------- | ------ | ------------------------ |
| Mocha       | 11.7.1 | Test runner              |
| Chai        | 4.5.0  | Biblioteca de assertions |
| Sinon       | 21.0.0 | Mocks e stubs            |
| Supertest   | 7.1.4  | Testes de API HTTP       |
| Mochawesome | 7.1.4  | Relatórios HTML          |

### Testes de Performance

| Tecnologia  | Versão | Propósito       |
| ----------- | ------ | --------------- |
| K6          | -      | Load testing    |
| K6 Reporter | latest | Relatórios HTML |

---

## 🎨 Padrões e Boas Práticas

### Arquiteturais

✅ **Separation of Concerns**: Cada camada tem responsabilidade única  
✅ **Dependency Injection**: Controllers recebem services, services recebem models  
✅ **Single Responsibility**: Cada módulo faz uma coisa bem feita  
✅ **DRY (Don't Repeat Yourself)**: Reutilização via helpers e services

### Segurança

✅ **Senhas criptografadas**: Bcrypt com salt  
✅ **Autenticação JWT**: Tokens assinados e verificados  
✅ **Validação de entrada**: Verificações no controller e service  
✅ **CORS habilitado**: Controle de acesso cross-origin

### Testes

✅ **Pirâmide de Testes**: Muitos unitários, alguns integração, poucos E2E  
✅ **Test Isolation**: Cada teste é independente  
✅ **Arrange-Act-Assert**: Padrão AAA nos testes  
✅ **Data-Driven**: Massa de dados separada do código  
✅ **Relatórios**: HTML para visualização fácil

### Performance

✅ **Thresholds**: Critérios claros de performance  
✅ **Stages**: Simulação de carga progressiva  
✅ **Métricas customizadas**: Trends para métricas específicas  
✅ **Histórico**: Todos os relatórios salvos com timestamp

### Código

✅ **ESLint**: Padronização de código (potencial)  
✅ **Modularização**: Código organizado em módulos  
✅ **Comentários**: Documentação inline quando necessário  
✅ **Nomenclatura**: Nomes claros e descritivos

---

## 📊 Métricas e Observabilidade

### Métricas de Performance (K6)

**Métricas Nativas**:

- `http_req_duration`: Tempo total da requisição
- `http_req_failed`: Taxa de falha
- `http_reqs`: Total de requisições
- `vus`: Usuários virtuais ativos
- `iterations`: Iterações completadas

**Métricas Customizadas**:

- `login_duration`: Tempo específico de login
- `register_duration`: Tempo de registro
- `list_users_duration`: Tempo de listagem
- `transfer_duration`: Tempo de transferência
- `success_rate`: Taxa de sucesso geral
- `login_count`: Contador de logins
- `register_count`: Contador de registros

### Relatórios

**Funcionais (Mochawesome)**:

- Localização: `mochawesome-report/`
- Formato: HTML interativo
- Inclui: Testes passados/falhados, duração, stack traces

**Performance (K6)**:

- Localização: `test/k6/reports/`
- Formato: HTML + JSON
- Inclui: Gráficos, thresholds, checks, métricas
- Histórico: Arquivos com timestamp mantidos

---

## 🚀 Ambientes

### Desenvolvimento (dev)

```bash
BASE_URL=http://localhost:3000
ENVIRONMENT=dev
```

### Homologação (hml)

```bash
BASE_URL=http://hml-api.example.com
ENVIRONMENT=hml
```

### Produção (prod)

```bash
BASE_URL=http://api.example.com
ENVIRONMENT=prod
```

---

## 📝 Scripts Disponíveis

### Servidor

```bash
npm run start-rest              # Inicia servidor REST
```

### Testes Funcionais

```bash
npm test                        # Todos os testes Mocha
npm run test-rest-external      # Testes de integração
npm run test-rest-controller    # Testes de controller
```

### Testes de Performance

```bash
npm run k6:performance          # Teste padrão (stages configurados)
npm run k6:performance:hml      # Teste em HML
npm run k6:performance:smoke    # Smoke test (1 VU, 30s)
npm run k6:performance:load     # Load test (50 VUs, 5min)
npm run k6:performance:stress   # Stress test (100 VUs, 10min)
```

---

## 🔮 Evoluções Futuras

- [ ] Integração com banco de dados real (MongoDB, PostgreSQL)
- [ ] Cache com Redis
- [ ] Rate limiting
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] Monitoramento (Prometheus + Grafana)
- [ ] Logs estruturados (Winston)
- [ ] GraphQL API
- [ ] WebSockets para notificações
- [ ] Testes de mutação

---

## 📚 Referências

- [Express.js Documentation](https://expressjs.com/)
- [K6 Documentation](https://k6.io/docs/)
- [Mocha Documentation](https://mochajs.org/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**Última Atualização**: 26 de Dezembro de 2025  
**Versão**: 1.0.0  
**Autor**: PGATS - Automação de Testes na Camada de Serviço
