const request = require("supertest");
const sinon = require("sinon");
const { expect } = require("chai");

const app = require("../../../app");
const transferService = require("../../../service/transferService");

describe("Transfer Controller - Unit", () => {
  let token;
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

  afterEach(() => {
    sinon.restore();
  });

  it("Deve retornar erro do service ao tentar transferir (stub)", async () => {
    sinon.stub(transferService, "transfer").throws(new Error("Erro simulado"));
    const response = await request(app)
      .post("/transfers")
      .set("Authorization", `Bearer ${token}`)
      .send({ from: "novoUsuario", to: "novoUsuario1", amount: 1000 });
    expect(response.status).to.equal(400);
    expect(response.body).to.have.property("error", "Erro simulado");
  });

  it("Deve chamar o service de transferência uma vez (spy)", async () => {
    const spy = sinon.spy(transferService, "transfer");
    await request(app)
      .post("/transfers")
      .set("Authorization", `Bearer ${token}`)
      .send({ from: "novoUsuario", to: "novoUsuario1", amount: 1000 });
    expect(spy.calledOnce).to.be.true;
    spy.restore();
  });

  it("Deve simular retorno de sucesso do service (stub)", async () => {
    const fakeTransfer = {
      from: "novoUsuario",
      to: "novoUsuario1",
      amount: 123,
      date: new Date(),
    };
    sinon.stub(transferService, "transfer").returns(fakeTransfer);
    const response = await request(app)
      .post("/transfers")
      .set("Authorization", `Bearer ${token}`)
      .send({ from: "novoUsuario", to: "novoUsuario1", amount: 123 });
    expect(response.status).to.equal(201);
    expect(response.body).to.include({
      from: "novoUsuario",
      to: "novoUsuario1",
      amount: 123,
    });
  });

  it("Deve usar mock para esperar chamada do service", async () => {
    const mock = sinon.mock(transferService);
    mock
      .expects("transfer")
      .once()
      .withArgs({ from: "novoUsuario", to: "novoUsuario1", amount: 555 });
    await request(app)
      .post("/transfers")
      .set("Authorization", `Bearer ${token}`)
      .send({ from: "novoUsuario", to: "novoUsuario1", amount: 555 });
    mock.verify();
    mock.restore();
  });
});
