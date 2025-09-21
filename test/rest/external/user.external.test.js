const request = require("supertest");
const api = request("http://localhost:3000"); // Use a porta do seu servidor
const { expect } = require("chai");

describe("User Controller - External API", () => {
  it("Deve registrar um novo usuário via API externa", async () => {
    const response = await api
      .post("/users/register")
      .send({ username: "usuarioExt", password: "senha123" });
    expect([201, 400]).to.include(response.status); // 400 se já existir
  });

  it("Deve fazer login via API externa", async () => {
    const response = await api
      .post("/users/login")
      .send({ username: "usuarioExt", password: "senha123" });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property("token");
  });

  it("Deve listar usuários via API externa", async () => {
    const response = await api.get("/users");
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an("array");
  });
});
