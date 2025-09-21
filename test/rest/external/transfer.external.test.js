const request = require("supertest");
const api = request("http://localhost:3000");
const { expect } = require("chai");

describe("Transfer Controller - External API", () => {
  let token;

  before(async () => {
    // Garante que os usuários existem
    await api
      .post("/users/register")
      .send({ username: "novoUsuarioExt", password: "senha123" });
    await api
      .post("/users/register")
      .send({ username: "novoUsuario1Ext", password: "senha123" });
  });

  beforeEach(async () => {
    // Faz login para obter token
    const respostaLogin = await api
      .post("/users/login")
      .send({ username: "novoUsuarioExt", password: "senha123" });
    token = respostaLogin.body.token;
  });

  it("Realizar uma transferência para usuário não cadastrado", async () => {
    const response = await api
      .post("/transfers")
      .set("Authorization", `Bearer ${token}`)
      .send({ from: "stopa", to: "alberto", amount: 1000 });
    expect(response.status).to.equal(400);
    expect(response.body).to.have.property("error", "Usuário não encontrado");
  });

  it("Realizar uma transferência não informando os usuários de envio e recebimento", async () => {
    const response = await api
      .post("/transfers")
      .set("Authorization", `Bearer ${token}`)
      .send({ from: "", to: "", amount: 1000 });
    expect(response.status).to.equal(400);
    expect(response.body).to.have.property(
      "error",
      "Campos obrigatórios: from, to, amount (number)"
    );
  });

  it("Realizar uma transferência com saldo insuficiente", async () => {
    const response = await api
      .post("/transfers")
      .set("Authorization", `Bearer ${token}`)
      .send({ from: "novoUsuarioExt", to: "novoUsuario1Ext", amount: 20000 });
    expect(response.status).to.equal(400);
    expect(response.body).to.have.property("error", "Saldo insuficiente");
  });

  it("Realizar uma transferência com valor negativo", async () => {
    const response = await api
      .post("/transfers")
      .set("Authorization", `Bearer ${token}`)
      .send({ from: "novoUsuarioExt", to: "novoUsuario1Ext", amount: -1000 });

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property(
      "error",
      "Campos obrigatórios: from, to, amount (number)"
    );
  });

  it("Realizar uma transferência com valor zero", async () => {
    const response = await api
      .post("/transfers")
      .set("Authorization", `Bearer ${token}`)
      .send({ from: "novoUsuarioExt", to: "novoUsuario1Ext", amount: 0 });
    expect(response.status).to.equal(400);
    expect(response.body).to.have.property(
      "error",
      "Campos obrigatórios: from, to, amount (number)"
    );
  });

  it("Deve retornar 401 se não enviar token", async () => {
    const response = await api
      .post("/transfers")
      .send({ from: "novoUsuarioExt", to: "novoUsuario1Ext", amount: 1000 });
    expect(response.status).to.equal(401);
    expect(response.body).to.have.property("error");
  });

  it("Realizar uma transferência autenticada", async () => {
    const response = await api
      .post("/transfers")
      .set("Authorization", `Bearer ${token}`)
      .send({ from: "novoUsuarioExt", to: "novoUsuario1Ext", amount: 1000 });
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property("from", "novoUsuarioExt");
    expect(response.body).to.have.property("to", "novoUsuario1Ext");
    expect(response.body).to.have.property("amount", 1000);
  });

  it("Deve listar as transferências realizadas em memória", async () => {
    const valores = [500, 1233, 1333];

    for (const amount of valores) {
      await api
        .post("/transfers")
        .set("Authorization", `Bearer ${token}`)
        .send({ from: "novoUsuarioExt", to: "novoUsuario1Ext", amount });
    }

    const response = await api
      .get("/transfers")
      .set("Authorization", `Bearer ${token}`);

    console.log("Listagem de transferências:", response.body);

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an("array");

    for (const amount of valores) {
      expect(
        response.body.some(
          (t) =>
            t.from === "novoUsuarioExt" &&
            t.to === "novoUsuario1Ext" &&
            t.amount === amount
        )
      ).to.be.true;
    }
  });
});
