# QuickPizza Load Testing

Projeto de testes de performance utilizando **Grafana k6**, **Grafana Cloud** e **GitHub Actions**, combinando testes de carga de API com um cenário de teste de browser.

O objetivo do projeto é demonstrar, de forma prática, uma estratégia de **Hybrid Performance Testing**, executando testes HTTP e browser no mesmo fluxo de CI/CD e acompanhando os resultados no Grafana Cloud.

## Tecnologias

- [Grafana k6](https://k6.io/)
- [Grafana Cloud](https://grafana.com/products/cloud/)
- [GitHub Actions](https://github.com/features/actions)
- JavaScript
- Chromium / k6 Browser

## Visão geral

O projeto possui dois cenários principais:

| Cenário | Tipo | Objetivo |
|---|---|---|
| `api_login_load` | API / HTTP | Avaliar o fluxo de login sob carga |
| `ui_browser_test` | Browser | Validar o fluxo principal da interface e coletar métricas de experiência |

A execução combina os dois cenários em um único teste k6.

```text
                         GitHub Actions
                               |
                               v
                              k6
                       ________|________
                      /                 \
                     v                   v
             api_login_load        ui_browser_test
                     |                   |
                     v                   v
              QuickPizza API        Chromium
                     |                   |
                     |                   +--> Browser metrics
                     |
                     +--> HTTP metrics
                     +--> Login metrics
                              |
                              v
                         Grafana Cloud
```

## Estrutura do projeto

```text
.
├── .github/
│   └── workflows/
│       └── k6-pipeline.yml
├── scenarios/
│   ├── Post-Login.js
│   └── browser-script.js
├── index.js
├── settings.json
└── README.md
```

## Cenário 1 — API Login Load Test

O cenário `api_login_load` utiliza o executor `ramping-vus` para aumentar a carga até **5 VUs**, manter a carga e depois reduzir para zero.

Fluxo atual:

```text
HTTP POST
   |
   v
/api/users/token
   |
   +--> valida HTTP 200
   +--> valida presença do JWT
   +--> registra duração do login
   +--> registra taxa de falha
   +--> contabiliza requisições
```

O teste utiliza `check()` para validar o retorno da API.

### Métricas personalizadas

O projeto possui métricas específicas para o fluxo de login:

| Métrica | Tipo | Objetivo |
|---|---|---|
| `login_duration` | Trend | Medir a duração das requisições de login |
| `login_fail_rate` | Rate | Medir a taxa de falha do fluxo de login |
| `login_reqs` | Counter | Contabilizar requisições de login |

Além dessas métricas, o k6 coleta as métricas HTTP padrão, como `http_req_duration`, `http_req_failed` e `http_reqs`.

## Cenário 2 — Browser Test

O cenário `ui_browser_test` utiliza o módulo **k6/browser** com Chromium.

Fluxo validado:

```text
Abrir QuickPizza
      |
      v
Validar título da página
      |
      v
Clicar em "Pizza, Please!"
      |
      v
Validar recomendações
      |
      v
Capturar screenshot
```

O cenário utiliza um VU e uma iteração para representar um teste leve de experiência do usuário enquanto o cenário de API gera a maior parte da carga.

Esse modelo permite combinar carga de protocolo com uma pequena carga de browser, reduzindo o custo computacional do teste de navegador.

## Thresholds

Os thresholds são mantidos em `settings.json` para separar configuração de execução e código de teste.

Atualmente o projeto utiliza:

```json
{
  "thresholds": {
    "http_req_duration": ["p(95)<1500"],
    "login_duration": ["p(95)<1500"]
  }
}
```

Ou seja, o teste considera como critério de performance que o **p95 das requisições HTTP** e o **p95 do login** permaneçam abaixo de **1500 ms**.

As métricas de falha continuam disponíveis para análise no Grafana Cloud, mas não são utilizadas atualmente como critério de aprovação do pipeline.

## Grafana Cloud

Os resultados do teste são enviados para o Grafana Cloud com:

```bash
k6 run --out cloud index.js
```

O objetivo é acompanhar os resultados da execução, incluindo:

- duração das requisições;
- volume de requisições;
- VUs ativos;
- métricas de login;
- métricas de browser;
- Web Vitals coletados pelo browser;
- resultado dos thresholds.

O projeto também pode ser analisado por cenário utilizando a label `scenario` nas métricas do k6.

## GitHub Actions

O teste é executado automaticamente no GitHub Actions quando ocorre push na branch `main` e também pode ser executado manualmente com `workflow_dispatch`.

Fluxo da pipeline:

```text
Push / Manual Run
        |
        v
Checkout
        |
        v
Setup k6 + Browser
        |
        v
Run k6
        |
        +------> Grafana Cloud
        |
        +------> HTML Summary
```

### Configuração esperada

O workflow utiliza o secret:

```text
K6_CLOUD_TOKEN
```

Esse token deve ser configurado em:

**GitHub → Settings → Secrets and variables → Actions**

## Execução local

Instale o k6 e execute:

```powershell
k6 run index.js
```

Para enviar o resultado ao Grafana Cloud:

```powershell
k6 run --out cloud index.js
```

O browser precisa estar disponível no ambiente de execução.

## Configuração do ambiente

A URL utilizada pelo teste de browser pode ser configurada pela variável:

```text
BASE_URL
```

Por padrão:

```text
https://quickpizza.grafana.com
```

Exemplo no PowerShell:

```powershell
$env:BASE_URL="https://quickpizza.grafana.com"
k6 run index.js
```

## Relatório HTML

O projeto utiliza `k6-reporter` para gerar um relatório HTML ao final da execução.

O arquivo gerado é:

```text
summary.html
```

Esse relatório pode ser utilizado para análise rápida da execução além das métricas enviadas ao Grafana Cloud.

## Segurança de credenciais

As credenciais utilizadas pelo teste ainda estão sendo migradas para variáveis de ambiente e **GitHub Secrets**.

A implementação planejada seguirá o modelo:

```text
GitHub Secrets
      |
      v
GitHub Actions environment variables
      |
      v
__ENV.K6_TEST_USERNAME
__ENV.K6_TEST_PASSWORD
      |
      v
Post-Login.js
```

Dessa forma, usuário e senha não serão armazenados diretamente no código-fonte.

> Nunca versione credenciais reais, tokens ou outras informações sensíveis no repositório.

## Objetivos do projeto

Este projeto foi criado para praticar e demonstrar conhecimentos em:

- Performance Testing
- Load Testing
- API Testing
- Browser Testing
- Hybrid Performance Testing
- Custom k6 Metrics
- Thresholds
- Web Performance Metrics
- CI/CD
- GitHub Actions
- Grafana Cloud
- Observability

## Autor

**Tiago José**

QA / Software Quality | Test Automation | Performance Testing
