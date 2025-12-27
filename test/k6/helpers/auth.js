import http from "k6/http";
import { check } from "k6";

/**
 * Helper de autenticação - Login de usuário
 * Retorna o token JWT para ser usado em requisições autenticadas
 *
 * @param {string} username - Nome do usuário
 * @param {string} password - Senha do usuário
 * @returns {string} Token JWT
 */
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

  return response.json("token");
}

/**
 * Helper para registrar novo usuário
 *
 * @param {string} username - Nome do usuário
 * @param {string} password - Senha do usuário
 * @param {Array} favorecidos - Lista de favorecidos (opcional)
 * @returns {Object} Resposta da requisição
 */
export function registerUser(username, password, favorecidos = []) {
  const url = `${__ENV.BASE_URL}/users/register`;

  const payload = JSON.stringify({
    username: username,
    password: password,
    favorecidos: favorecidos,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  return http.post(url, payload, params);
}
