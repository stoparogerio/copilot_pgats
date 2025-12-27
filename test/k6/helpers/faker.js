/**
 * Helper para geração de dados fake
 * Simula funcionalidades do Faker.js para K6
 */

/**
 * Gera um nome de usuário aleatório
 * @returns {string} Nome de usuário
 */
export function randomUsername() {
  const adjectives = [
    "happy",
    "clever",
    "brave",
    "swift",
    "bright",
    "calm",
    "eager",
    "fancy",
    "gentle",
    "jolly",
  ];
  const nouns = [
    "user",
    "tester",
    "developer",
    "engineer",
    "admin",
    "guest",
    "member",
    "client",
    "player",
    "agent",
  ];

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 10000);

  return `${adjective}_${noun}_${number}`;
}

/**
 * Gera uma senha aleatória
 * @param {number} length - Tamanho da senha
 * @returns {string} Senha aleatória
 */
export function randomPassword(length = 8) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return password;
}

/**
 * Gera um valor monetário aleatório
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number} Valor aleatório com 2 casas decimais
 */
export function randomAmount(min = 10, max = 1000) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

/**
 * Seleciona um item aleatório de um array
 * @param {Array} array - Array de itens
 * @returns {*} Item aleatório do array
 */
export function randomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Gera um email aleatório
 * @returns {string} Email aleatório
 */
export function randomEmail() {
  const domains = ["test.com", "example.com", "demo.com", "sample.com"];
  const username = randomUsername();
  const domain = randomFromArray(domains);

  return `${username}@${domain}`;
}
