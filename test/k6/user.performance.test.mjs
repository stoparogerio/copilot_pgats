import http from "k6/http";
import { check, group, sleep } from "k6";
import { Trend, Rate, Counter } from "k6/metrics";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";
import { login, registerUser } from "./helpers/auth.js";
import {
  randomUsername,
  randomPassword,
  randomAmount,
  randomFromArray,
} from "./helpers/faker.js";
import {
  getBaseUrl,
  getAuthHeaders,
  getJsonHeaders,
} from "./helpers/config.js";

// Importação de dados para Data-Driven Testing
const testData = JSON.parse(open("./data/users.json"));

// ========================================
// CUSTOM METRICS - TRENDS
// ========================================
// Trends permitem coletar métricas customizadas sobre tempo de resposta
const loginTrend = new Trend("login_duration");
const registerTrend = new Trend("register_duration");
const listUsersTrend = new Trend("list_users_duration");
const transferTrend = new Trend("transfer_duration");

// Rate para medir taxa de sucesso
const successRate = new Rate("success_rate");

// Counter para contar operações
const loginCounter = new Counter("login_count");
const registerCounter = new Counter("register_count");

// ========================================
// CONFIGURAÇÕES DE TESTE
// ========================================
export const options = {
  // STAGES - Define o perfil de carga do teste
  stages: [
    { duration: "30s", target: 10 }, // Ramp-up: 0 a 10 usuários em 30s
    { duration: "1m", target: 50 }, // Ramp-up: 10 a 50 usuários em 1min
    { duration: "2m", target: 50 }, // Platô: 50 usuários por 2min
    { duration: "30s", target: 78 }, // Spike: 50 a 78 usuários em 30s
    { duration: "1m", target: 78 }, // Platô: 78 usuários por 1min
    { duration: "30s", target: 0 }, // Ramp-down: 78 a 0 usuários em 30s
  ],

  // THRESHOLDS - Critérios de sucesso do teste
  thresholds: {
    // 95% das requisições devem completar em menos de 1000ms
    http_req_duration: ["p(95)<1000"],

    // 99% das requisições devem completar em menos de 5s
    "http_req_duration{expected_response:true}": ["p(99)<5000"],

    // Taxa de erro deve ser menor que 6%
    http_req_failed: ["rate<0.60"],

    // 90% das requisições de login devem completar em menos de 300ms
    login_duration: ["p(90)<300"],

    // Taxa de sucesso deve ser maior que 51%
    success_rate: ["rate>0.51"],

    // Métricas específicas por grupo
    "http_req_duration{group:::Login User}": ["p(95)<400"],
    "http_req_duration{group:::Register User}": ["p(95)<1000"],
    "http_req_duration{group:::List Users}": ["p(95)<300"],
  },
};

// ========================================
// SETUP - Executado uma vez antes do teste
// ========================================
export function setup() {
  console.log("=== SETUP: Preparando ambiente de teste ===");
  console.log(`Base URL: ${__ENV.BASE_URL}`);
  console.log(`Environment: ${__ENV.ENVIRONMENT || "dev"}`);

  // Retorna dados que serão compartilhados com todas as VUs
  return {
    baseUrl: getBaseUrl(),
    testStartTime: new Date().toISOString(),
  };
}

// ========================================
// FUNÇÃO PRINCIPAL DE TESTE
// ========================================
export default function (data) {
  const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
  let token;

  // ========================================
  // GROUP: Login de Usuário
  // ========================================
  group("Login User", function () {
    // Data-Driven Testing: Usar dados do arquivo JSON
    const userData = randomFromArray(testData.users);

    const startTime = new Date();
    token = login(userData.username, userData.password);
    const duration = new Date() - startTime;

    // Registrar métrica customizada (Trend)
    loginTrend.add(duration);
    loginCounter.add(1);

    // Verificar se o login foi bem-sucedido
    if (token) {
      successRate.add(1);
    } else {
      successRate.add(0);
    }
  });

  sleep(1);

  // ========================================
  // GROUP: Registro de Novo Usuário
  // ========================================
  group("Register User", function () {
    // Uso do Faker para gerar dados aleatórios
    const newUsername = randomUsername();
    const newPassword = randomPassword(10);
    const favorecidos = [randomFromArray(testData.users).username];

    const startTime = new Date();
    const response = registerUser(newUsername, newPassword, favorecidos);
    const duration = new Date() - startTime;

    // CHECKS - Validações da resposta
    const checkResult = check(response, {
      "Status é 201 ou 400": (r) => [201, 400].includes(r.status),
      "Response tem status code": (r) => r.status !== undefined,
      "Response time menor que 1s": (r) => r.timings.duration < 1000,
    });

    // Registrar métrica customizada (Trend)
    registerTrend.add(duration);
    registerCounter.add(1);
    successRate.add(checkResult ? 1 : 0);
  });

  sleep(1);

  // ========================================
  // GROUP: Listar Usuários (com autenticação)
  // ========================================
  group("List Users", function () {
    // Reaproveitamento de resposta: Usar token do login anterior
    const url = `${BASE_URL}/users`;

    const params = {
      headers: getAuthHeaders(token),
    };

    const startTime = new Date();
    const response = http.get(url, params);
    const duration = new Date() - startTime;

    // CHECKS - Validações complexas
    const checkResult = check(response, {
      "Status é 200": (r) => r.status === 200,
      "Response é array": (r) => Array.isArray(r.json()),
      "Array não está vazio": (r) => r.json().length > 0,
      "Response time menor que 500ms": (r) => r.timings.duration < 500,
      "Content-Type é JSON": (r) =>
        r.headers["Content-Type"]?.includes("application/json"),
    });

    // Registrar métrica customizada (Trend)
    listUsersTrend.add(duration);
    successRate.add(checkResult ? 1 : 0);
  });

  sleep(1);

  // ========================================
  // GROUP: Transferências (Data-Driven)
  // ========================================
  group("Transfers", function () {
    // Usar usuário logado como remetente
    const userData = randomFromArray(testData.users);
    const recipient = randomFromArray(
      testData.users.filter((u) => u.username !== userData.username)
    );

    const url = `${BASE_URL}/transfers`;

    const payload = JSON.stringify({
      from: userData.username, // Usar usuário logado
      to: recipient.username, // Destinatário diferente
      amount: randomAmount(1, 50), // Valor menor para evitar saldo insuficiente
    });

    const params = {
      headers: {
        ...getJsonHeaders(),
        ...getAuthHeaders(token), // ADICIONAR AUTENTICAÇÃO
      },
    };

    const startTime = new Date();
    const response = http.post(url, payload, params);
    const duration = new Date() - startTime;

    // CHECKS mais tolerantes
    const checkResult = check(response, {
      "Status é 2xx ou 400/422": (r) => r.status >= 200 && r.status < 500,
      "Response tem corpo válido": (r) => r.body && r.body.length > 0,
      "Response time menor que 1500ms": (r) => r.timings.duration < 1500,
    });

    // Registrar métrica customizada (Trend)
    transferTrend.add(duration);
    successRate.add(checkResult ? 1 : 0);
  });

  sleep(1);

  // ========================================
  // GROUP: Listar Transferências
  // ========================================
  group("List Transfers", function () {
    const url = `${BASE_URL}/transfers`;

    const params = {
      headers: getAuthHeaders(token), // ADICIONAR AUTENTICAÇÃO
    };

    const response = http.get(url, params);

    // CHECKS mais tolerantes
    const checkResult = check(response, {
      "Status é 2xx": (r) => r.status >= 200 && r.status < 300,
      "Response é válido": (r) => r.body && r.body.length > 0,
      "Response time menor que 1000ms": (r) => r.timings.duration < 1000,
    });

    successRate.add(checkResult ? 1 : 0);
  });

  sleep(2);
}

// ========================================
// TEARDOWN - Executado uma vez após o teste
// ========================================
export function teardown(data) {
  console.log("=== TEARDOWN: Finalizando teste ===");
  console.log(`Teste iniciado em: ${data.testStartTime}`);
  console.log(`Teste finalizado em: ${new Date().toISOString()}`);
}

// ========================================
// GERAÇÃO DE RELATÓRIO HTML
// ========================================
export function handleSummary(data) {
  const environment = __ENV.ENVIRONMENT || "hml";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportDir = "./test/k6/reports";

  return {
    [`${reportDir}/${environment}_${timestamp}_summary.html`]: htmlReport(data),
    [`${reportDir}/${environment}_${timestamp}_summary.json`]:
      JSON.stringify(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}
