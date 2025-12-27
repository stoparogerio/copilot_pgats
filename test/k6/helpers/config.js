/**
 * Configurações centralizadas para os testes K6
 */

/**
 * Retorna a URL base da API a partir da variável de ambiente
 * @returns {string} URL base da API
 */
export function getBaseUrl() {
  return __ENV.BASE_URL || "http://localhost:3000";
}

/**
 * Retorna o ambiente de execução
 * @returns {string} Ambiente (dev, hml, prod)
 */
export function getEnvironment() {
  return __ENV.ENVIRONMENT || "dev";
}

/**
 * Configuração de headers padrão para requisições JSON
 * @returns {Object} Headers padrão
 */
export function getJsonHeaders() {
  return {
    "Content-Type": "application/json",
  };
}

/**
 * Configuração de headers com autenticação
 * @param {string} token - Token JWT
 * @returns {Object} Headers com autenticação
 */
export function getAuthHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}
