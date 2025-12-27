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
   npm install
   ```
3. Inicie o servidor:
   ```sh
   npm run start-rest
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

Para rodar os testes automatizados:

```sh
# Rodar todos os testes
npm test

# Rodar apenas testes de controller
npm run test-rest-controller

# Rodar apenas testes externos (via HTTP)
npm run test-rest-external
```

Para testar a API manualmente, utilize ferramentas como Postman, Insomnia ou scripts automatizados (ex: Supertest).

## Observações

- Todos os dados são armazenados em memória e serão perdidos ao reiniciar o servidor.
- O endpoint `/api-docs` exibe a documentação Swagger.
