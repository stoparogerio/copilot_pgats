const { users } = require("../model/userModel");
const { transfers } = require("../model/transferModel");

/**
 * Realiza uma transferência entre usuários.
 * @param {Object} params
 * @param {string} params.from - Usuário remetente
 * @param {string} params.to - Usuário destinatário
 * @param {number} params.amount - Valor da transferência
 * @returns {Object} Transferência realizada
 */
function transfer({ from, to, amount }) {
  // Validação dos campos obrigatórios
  if (!from || !to || typeof amount !== "number" || amount <= 0) {
    throw new Error("Campos obrigatórios: from, to, amount (number)");
  }

  // Busca usuários
  const sender = users.find((u) => u.username === from);
  const recipient = users.find((u) => u.username === to);

  if (!sender || !recipient) {
    throw new Error("Usuário não encontrado");
  }

  // Verifica saldo
  if (sender.saldo < amount) {
    throw new Error("Saldo insuficiente");
  }

  // Regra de favorecido
  const isFavorecido = sender.favorecidos.includes(to);
  if (!isFavorecido && amount >= 5000) {
    throw new Error("Transferências acima de R$ 5.000,00 só para favorecidos");
  }

  // Realiza transferência
  sender.saldo -= amount;
  recipient.saldo += amount;

  const transferObj = {
    from,
    to,
    amount,
    date: new Date(),
  };
  transfers.push(transferObj);

  return transferObj;
}

/**
 * Lista todas as transferências realizadas.
 * @returns {Array}
 */
function listTransfers() {
  return transfers;
}

module.exports = {
  transfer,
  listTransfers,
};
