const request = require("supertest");
const { expect } = require("chai");
const app = require("../../../app");

describe("User Controller", () => {
  describe("POST /users/register", () => {
    it("Deve registrar um novo usuário com sucesso", async () => {
      const response = await request(app)
        .post("/users/register")
        .send({ username: "usuarioTeste", password: "senha123" });

      expect(response.status).to.equal(201);
      expect(response.body).to.have.property("username", "usuarioTeste");
      expect(response.body).to.have.property("favorecidos");
    });

    it("Não deve registrar usuário sem username ou password", async () => {
      const response = await request(app)
        .post("/users/register")
        .send({ username: "", password: "" });

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property(
        "error",
        "Usuário e senha são obrigatórios"
      );
    });

    it("Não deve registrar usuário duplicado", async () => {
      await request(app)
        .post("/users/register")
        .send({ username: "usuarioDuplicado", password: "senha123" });

      const response = await request(app)
        .post("/users/register")
        .send({ username: "usuarioDuplicado", password: "senha123" });

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property("error");
    });
  });

  describe("POST /users/login", () => {
    before(async () => {
      await request(app)
        .post("/users/register")
        .send({ username: "usuarioLogin", password: "senha123" });
    });

    it("Deve fazer login com sucesso e retornar token", async () => {
      const response = await request(app)
        .post("/users/login")
        .send({ username: "usuarioLogin", password: "senha123" });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("token");
      expect(response.body).to.have.property("username", "usuarioLogin");
      expect(response.body).to.have.property("favorecidos");
      expect(response.body).to.have.property("saldo");
    });

    it("Não deve logar com senha errada", async () => {
      const response = await request(app)
        .post("/users/login")
        .send({ username: "usuarioLogin", password: "senhaErrada" });

      expect(response.status).to.equal(401);
      expect(response.body).to.have.property("error");
    });

    it("Não deve logar sem username ou password", async () => {
      const response = await request(app)
        .post("/users/login")
        .send({ username: "", password: "" });

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property(
        "error",
        "Usuário e senha são obrigatórios"
      );
    });
  });

  describe("GET /users", () => {
    it("Deve listar todos os usuários cadastrados", async () => {
      const response = await request(app).get("/users");
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("array");
      expect(response.body.length).to.be.greaterThan(0);
    });
  });
});
