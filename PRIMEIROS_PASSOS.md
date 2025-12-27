# 🚀 Primeiros Passos - Testes de Performance K6

## 📋 Pré-Requisitos

Antes de executar os testes de performance, certifique-se de ter:

- ✅ Node.js instalado (v14 ou superior)
- ✅ NPM instalado
- ✅ K6 instalado

---

## 📥 Instalação do K6

### Windows (Recomendado: Chocolatey)

```powershell
# Instalar Chocolatey (se não tiver)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Instalar K6
choco install k6

# Verificar instalação
k6 version
```

### Windows (Alternativa: Instalador Manual)

1. Acesse: https://k6.io/docs/getting-started/installation/
2. Baixe o instalador para Windows
3. Execute o instalador
4. Verifique: `k6 version`

### MacOS

```bash
brew install k6
```

### Linux (Debian/Ubuntu)

```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

---

## ⚙️ Configuração Inicial

### 1. Instalar Dependências do Projeto

```bash
cd copilot_pgats
npm install
```

### 2. Verificar Estrutura K6

```bash
# Windows PowerShell
tree /F test\k6

# Linux/Mac
tree test/k6
```

Você deve ver:

```
test/k6/
├── user.performance.test.js
├── .env
├── helpers/
├── data/
└── reports/
```

---

## 🎯 Executando Seu Primeiro Teste

### Passo 1: Iniciar o Servidor da API

Em um terminal/prompt de comando:

```bash
npm run start-rest
```

**Saída esperada**:

```
Server running on http://localhost:3000
API Docs available at http://localhost:3000/api-docs
```

### Passo 2: Executar Smoke Test (30 segundos)

Em **outro** terminal/prompt de comando:

```bash
npm run k6:performance:smoke
```

**O que acontece**:

1. K6 carrega o teste
2. Executa com 1 usuário virtual por 30 segundos
3. Valida thresholds
4. Gera relatório automático
5. Exibe resumo no terminal

**Saída esperada**:

```
     ✓ http_req_duration.........: avg=45ms  min=20ms  med=42ms  max=150ms  p(95)=95ms
     ✓ http_req_failed...........: 0.00%
     ✓ login_duration............: avg=38ms
     ✓ success_rate..............: 100.00%
```

### Passo 3: Visualizar Relatório

1. Navegue até: `test/k6/reports/`
2. Abra o arquivo HTML mais recente
3. Formato: `dev_YYYY-MM-DDTHH-MM-SS-MSSZ_summary.html`

**No relatório você verá**:

- 📊 Gráficos de performance
- ✅ Status dos thresholds
- 📈 Métricas customizadas
- 🔍 Detalhes de cada grupo

---

## 🏃 Executando Outros Tipos de Teste

### Load Test (5 minutos, 50 usuários)

```bash
npm run k6:performance:load
```

**Quando usar**: Validar performance sob carga esperada em produção

### Stress Test (10 minutos, 100 usuários)

```bash
npm run k6:performance:stress
```

**Quando usar**: Identificar limites do sistema e pontos de quebra

### Teste Completo com Stages

```bash
npm run k6:performance
```

**Quando usar**: Simular carga progressiva realista

### Teste em Homologação

```bash
npm run k6:performance:hml
```

**Quando usar**: Validar ambiente de homologação

---

## 📊 Interpretando Resultados

### ✅ Teste Passou

```
✓ http_req_duration.........: p(95)<500ms ✓
✓ http_req_failed...........: rate<0.01  ✓
✓ success_rate..............: rate>0.95  ✓
```

**Significado**: Todos os thresholds foram atendidos

### ❌ Teste Falhou

```
✓ http_req_duration.........: p(95)<500ms ✓
✗ http_req_failed...........: rate<0.01  ✗ (got 0.02)
✓ success_rate..............: rate>0.95  ✓
```

**Significado**: 2% das requisições falharam (threshold: < 1%)

**Ação**: Investigar logs do servidor e ajustar API ou threshold

---

## 🔍 Principais Métricas

| Métrica             | O que mede                | Valor bom           |
| ------------------- | ------------------------- | ------------------- |
| `http_req_duration` | Tempo total de requisição | p(95) < 500ms       |
| `http_req_failed`   | Taxa de falha             | < 1%                |
| `login_duration`    | Tempo de login            | p(90) < 300ms       |
| `success_rate`      | Taxa de checks passando   | > 95%               |
| `http_reqs`         | Total de requisições      | Quanto mais, melhor |

---

## 🛠️ Troubleshooting

### ❌ Erro: "k6: command not found"

**Problema**: K6 não está instalado ou não está no PATH

**Solução**:

```bash
# Instalar K6
choco install k6

# Verificar
k6 version
```

---

### ❌ Erro: "Connection refused" ou "ECONNREFUSED"

**Problema**: Servidor da API não está rodando

**Solução**:

```bash
# Terminal 1
npm run start-rest

# Aguardar mensagem "Server running on http://localhost:3000"
# Então em Terminal 2
npm run k6:performance:smoke
```

---

### ❌ Thresholds estão falhando

**Problema**: API não atende aos critérios de performance

**Possíveis causas**:

1. Servidor sobrecarregado
2. Thresholds muito rigorosos
3. Problemas de rede
4. Número de VUs muito alto

**Soluções**:

```bash
# 1. Reduzir VUs
npm run k6:performance:smoke  # Apenas 1 VU

# 2. Verificar logs do servidor
# Procurar por erros ou lentidão

# 3. Ajustar thresholds (se necessário)
# Editar: test/k6/user.performance.test.js
```

---

### ❌ Relatório não foi gerado

**Problema**: Diretório reports/ não existe ou sem permissão

**Solução**:

```bash
# Criar diretório manualmente
mkdir test/k6/reports

# Executar novamente
npm run k6:performance:smoke
```

---

## 📝 Personalizando Testes

### Alterar URL da API

**Opção 1: Via CLI**

```bash
k6 run --env BASE_URL=http://staging.example.com test/k6/user.performance.test.js
```

**Opção 2: Editar .env**

```bash
# test/k6/.env
BASE_URL=http://staging.example.com
ENVIRONMENT=staging
```

### Alterar Thresholds

Editar `test/k6/user.performance.test.js`:

```javascript
export const options = {
  thresholds: {
    http_req_duration: ["p(95)<300"], // Mais rigoroso
    http_req_failed: ["rate<0.001"], // 0.1% de erro
  },
};
```

### Alterar Stages

Editar `test/k6/user.performance.test.js`:

```javascript
export const options = {
  stages: [
    { duration: "2m", target: 100 }, // Ramp-up mais longo
    { duration: "10m", target: 100 }, // Platô mais longo
    { duration: "2m", target: 0 }, // Ramp-down
  ],
};
```

---

## 📚 Próximos Passos

Após executar seu primeiro teste com sucesso:

1. ✅ **Explorar relatórios**: Abra os HTMLs gerados
2. ✅ **Ler documentação**: `test/k6/CONCEITOS_K6.md`
3. ✅ **Entender arquitetura**: `ARQUITETURA.md`
4. ✅ **Experimentar**: Alterar dados em `test/k6/data/users.json`
5. ✅ **Customizar**: Adicionar novos helpers em `test/k6/helpers/`

---

## 🎓 Recursos de Aprendizado

### Documentação do Projeto

- `ARQUITETURA.md` - Arquitetura completa
- `test/k6/GUIA_RAPIDO.md` - Guia detalhado
- `test/k6/CONCEITOS_K6.md` - Referência de conceitos
- `README.md` - Documentação geral

### Documentação Oficial K6

- https://k6.io/docs/
- https://k6.io/docs/examples/
- https://community.k6.io/

---

## ✅ Checklist de Sucesso

Você concluiu a configuração quando conseguir:

- [ ] Instalar K6 e verificar versão
- [ ] Executar `npm install` sem erros
- [ ] Iniciar servidor com `npm run start-rest`
- [ ] Executar smoke test com `npm run k6:performance:smoke`
- [ ] Ver relatório HTML gerado em `test/k6/reports/`
- [ ] Todos os thresholds passando ✅
- [ ] Entender as métricas básicas

---

## 🎉 Parabéns!

Se você chegou até aqui e executou um teste com sucesso, você está pronto para:

- ✅ Executar testes de performance K6
- ✅ Interpretar relatórios
- ✅ Identificar gargalos de performance
- ✅ Validar thresholds
- ✅ Customizar testes

**Continue explorando a documentação para dominar todos os 11 conceitos implementados!**

---

**Precisa de Ajuda?**

1. Consulte `test/k6/GUIA_RAPIDO.md`
2. Veja exemplos em `test/k6/CONCEITOS_K6.md`
3. Leia a arquitetura em `ARQUITETURA.md`
4. Verifique `README.md` para exemplos de código

---

**Versão**: 1.0.0  
**Última Atualização**: 26 de Dezembro de 2025
