const request = require("supertest");
const { expect } = require("chai");

const app = require("../../app");

describe("Transfer Controller", () => {
  let token;
  describe("POST /transfers", () => {
    before(async () => {
      await request(app).post("/users/register").send({
        username: "novoUsuario",
        password: "senha123",
      });
      await request(app).post("/users/register").send({
        username: "novoUsuario1",
        password: "senha123",
      });
    });

    beforeEach(async () => {
      const respostaLogin = await request(app).post("/users/login").send({
        username: "novoUsuario",
        password: "senha123",
      });
      token = respostaLogin.body.token;
    });

    it("Realizar uma transferência para usuário não cadastrado", async () => {
      const response = await request(app)
        .post("/transfers")
        .set("Authorization", `Bearer ${token}`)
        .send({ from: "stopa", to: "alberto", amount: 1000 });
      expect(response.status).to.equal(400);
      expect(response.body).to.have.property("error", "Usuário não encontrado");
    });

    it("Realizar uma transferência não informando os usuários de envio e recebimento", async () => {
      const response = await request(app)
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
      const response = await request(app)
        .post("/transfers")
        .set("Authorization", `Bearer ${token}`)
        .send({ from: "novoUsuario", to: "novoUsuario1", amount: 20000 });
      expect(response.status).to.equal(400);
      expect(response.body).to.have.property("error", "Saldo insuficiente");
    });

    it("Realizar uma transferência com valor negativo", async () => {
      const response = await request(app)
        .post("/transfers")
        .set("Authorization", `Bearer ${token}`)
        .send({ from: "novoUsuario", to: "novoUsuario1", amount: -1000 });

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property(
        "error",
        "Campos obrigatórios: from, to, amount (number)"
      );
    });

    it("Realizar uma transferência com valor zero", async () => {
      const response = await request(app)
        .post("/transfers")
        .set("Authorization", `Bearer ${token}`)
        .send({ from: "novoUsuario", to: "novoUsuario1", amount: 0 });
      expect(response.status).to.equal(400);
      expect(response.body).to.have.property(
        "error",
        "Campos obrigatórios: from, to, amount (number)"
      );
    });

    it("Deve retornar 401 se não enviar token", async () => {
      const response = await request(app)
        .post("/transfers")
        .send({ from: "novoUsuario", to: "novoUsuario1", amount: 1000 });
      expect(response.status).to.equal(401);
      expect(response.body).to.have.property("error");
    });

    it("Realizar uma transferência autenticada", async () => {
      const response = await request(app)
        .post("/transfers")
        .set("Authorization", `Bearer ${token}`)
        .send({ from: "novoUsuario", to: "novoUsuario1", amount: 1000 });
      expect(response.status).to.equal(201);
      expect(response.body).to.have.property("from", "novoUsuario");
      expect(response.body).to.have.property("to", "novoUsuario1");
      expect(response.body).to.have.property("amount", 1000);

      console.log("Token usado:", token);
      console.log("Response body:", response.body);
    });

    it("Deve listar as transferências realizadas em memória", async () => {
      const valores = [500, 1233, 1333];

      for (const amount of valores) {
        await request(app)
          .post("/transfers")
          .set("Authorization", `Bearer ${token}`)
          .send({ from: "novoUsuario", to: "novoUsuario1", amount });
      }

      const response = await request(app)
        .get("/transfers")
        .set("Authorization", `Bearer ${token}`);

      console.log("Listagem de transferências:", response.body);

      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("array");

      for (const amount of valores) {
        expect(
          response.body.some(
            (t) =>
              t.from === "novoUsuario" &&
              t.to === "novoUsuario1" &&
              t.amount === amount
          )
        ).to.be.true;
      }
    });
  });
});
