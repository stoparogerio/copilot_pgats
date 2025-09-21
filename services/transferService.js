const { users } = require("../models/userModel");
const { transfers } = require("../models/transferModel");

function transfer({ from, to, amount }) {
  const sender = users.find((u) => u.username === from);
  const recipient = users.find((u) => u.username === to);
  if (!sender || !recipient) throw new Error("Usuário não encontrado");
  if (sender.saldo < amount) throw new Error("Saldo insuficiente");
  const isFavorecido = sender.favorecidos.includes(to);
  if (!isFavorecido && amount >= 5000) {
    throw new Error("Transferências acima de R$ 5.000,00 só para favorecidos");
  }
  sender.saldo -= amount;
  recipient.saldo += amount;
  const transfer = { from, to, amount, date: new Date() };
  transfers.push(transfer);
  return transfer;
}

function listTransfers() {
  return transfers;
}

module.exports = {
  transfer,
  listTransfers,
};
