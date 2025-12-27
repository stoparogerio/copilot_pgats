# Guia Rápido - Testes de Performance K6

## 🚀 Início Rápido

### 1. Pré-requisitos

#### Instalar K6

**Windows (via Chocolatey)**:

```powershell
choco install k6
```

**Windows (via Instalador)**:
Baixe em: https://k6.io/docs/getting-started/installation/

**MacOS (via Homebrew)**:

```bash
brew install k6
```

**Linux (Debian/Ubuntu)**:

```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

Verificar instalação:

```bash
k6 version
```

### 2. Preparar Ambiente

1. **Instalar dependências do projeto**:

```bash
npm install
```

2. **Iniciar o servidor da API**:

```bash
npm run start-rest
```

O servidor estará rodando em `http://localhost:3000`

### 3. Executar Testes

#### Smoke Test (Rápido - 30 segundos)

```bash
npm run k6:performance:smoke
```

#### Teste de Performance Padrão (5 minutos)

```bash
npm run k6:performance
```

#### Load Test (50 usuários por 5 minutos)

```bash
npm run k6:performance:load
```

#### Stress Test (100 usuários por 10 minutos)

```bash
npm run k6:performance:stress
```

#### Teste em Homologação

```bash
npm run k6:performance:hml
```

### 4. Visualizar Relatórios

Após a execução, os relatórios são gerados em:

```
test/k6/reports/
```

Abra o arquivo HTML no navegador:

```
test/k6/reports/{ambiente}_{timestamp}_summary.html
```

---

## 📊 Entendendo os Resultados

### Métricas Principais

#### http_req_duration

- Tempo total da requisição
- **p(95) < 500ms**: 95% das requisições em menos de 500ms

#### http_req_failed

- Taxa de falha das requisições
- **rate < 0.01**: Menos de 1% de erros

#### success_rate

- Taxa de sucesso dos checks
- **rate > 0.95**: Mais de 95% de sucesso

#### Checks

- ✅ Verde: Passou
- ❌ Vermelho: Falhou

### Thresholds

Se algum threshold falhar, o teste é considerado falhado, mesmo que todas as requisições tenham sido executadas.

Exemplo:

```
✓ http_req_duration.........: p(95)<500ms
✗ http_req_failed...........: rate<0.01
```

---

## 🔧 Configurações Avançadas

### Modificar Stages

Edite o arquivo `test/k6/user.performance.test.js`:

```javascript
export const options = {
  stages: [
    { duration: "1m", target: 20 }, // Ramp-up para 20 usuários
    { duration: "5m", target: 100 }, // Platô em 100 usuários
    { duration: "1m", target: 0 }, // Ramp-down
  ],
};
```

### Modificar Thresholds

```javascript
thresholds: {
    'http_req_duration': ['p(95)<300'],  // Mais rigoroso
    'http_req_failed': ['rate<0.001'],   // 0.1% de erro
},
```

### Usar Diferentes Ambientes

Crie variações no `.env`:

```bash
BASE_URL=http://staging.example.com
ENVIRONMENT=staging
```

Execute passando as variáveis:

```bash
k6 run --env BASE_URL=http://staging.example.com --env ENVIRONMENT=staging test/k6/user.performance.test.js
```

---

## 📈 Perfis de Teste

### Smoke Test

- **VUs**: 1
- **Duração**: 30s
- **Objetivo**: Verificar funcionalidade básica

### Load Test

- **VUs**: 50
- **Duração**: 5m
- **Objetivo**: Performance sob carga esperada

### Stress Test

- **VUs**: 100
- **Duração**: 10m
- **Objetivo**: Identificar limites do sistema

### Spike Test

- **Configuração**: Aumento súbito de VUs
- **Objetivo**: Comportamento sob picos

### Soak Test (Resistência)

- **VUs**: Moderado
- **Duração**: 1h+
- **Objetivo**: Memory leaks, degradação

---

## 🐛 Troubleshooting

### Erro: "Connection refused"

**Causa**: Servidor não está rodando

**Solução**:

```bash
npm run start-rest
```

### Erro: "k6: command not found"

**Causa**: K6 não está instalado

**Solução**: Instale o K6 conforme instruções acima

### Thresholds falhando

**Causa**: API não atende aos critérios de performance

**Soluções**:

1. Verifique logs do servidor
2. Reduza o número de VUs
3. Ajuste os thresholds
4. Otimize a API

### Relatórios não são gerados

**Causa**: Diretório `reports/` não existe

**Solução**: K6 cria automaticamente, mas verifique permissões

---

## 📝 Exemplos de Comandos K6

### Executar com Opções Customizadas

```bash
# 10 VUs por 30 segundos
k6 run --vus 10 --duration 30s test/k6/user.performance.test.js

# Com variáveis de ambiente
k6 run --env BASE_URL=http://localhost:3000 --env ENVIRONMENT=dev test/k6/user.performance.test.js

# Saída em JSON
k6 run --out json=results.json test/k6/user.performance.test.js

# Múltiplas saídas
k6 run --out json=results.json --out influxdb=http://localhost:8086 test/k6/user.performance.test.js
```

### Executar com Stages Via CLI

```bash
k6 run --stage 30s:10,1m:50,30s:100,1m:100,30s:0 test/k6/user.performance.test.js
```

---

## 🎯 Checklist de Execução

- [ ] Servidor da API está rodando
- [ ] K6 está instalado
- [ ] Arquivo `.env` configurado
- [ ] Diretório `test/k6/reports/` existe
- [ ] Massa de dados em `data/users.json` está válida
- [ ] Thresholds configurados adequadamente
- [ ] Baseline de performance estabelecido

---

## 📚 Recursos Adicionais

- [Documentação K6](https://k6.io/docs/)
- [K6 Examples](https://github.com/grafana/k6/tree/master/examples)
- [K6 Community](https://community.k6.io/)
- [K6 Best Practices](https://k6.io/docs/testing-guides/running-large-tests/)

---

**Última Atualização**: 26 de Dezembro de 2025
