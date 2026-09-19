import PostLogin from './scenarios/Post-Login.js';
import UIQuickPizza from './scenarios/browser-script.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js';

// Leitura dinâmica das configurações externas
const settings = JSON.parse(open('./settings.json'));

export const options = {
  thresholds: settings.thresholds,
  scenarios: {
    // Cenário 1: Carga concorrente na API de Login
    api_login_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: settings.stages,
      exec: 'runApiLogin',
    },
    // Cenário 2: Validação visual e renderização na UI
    ui_browser_test: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
      options: {
        browser: {
          type: 'chromium',
        },
      },
      exec: 'runUiTest',
    },
  },
};

// Funções de execução dos cenários
export function runApiLogin() {
  PostLogin();
}

export async function runUiTest() {
  await UIQuickPizza();
}

// Geração automática do relatório HTML
export function handleSummary(data) {
  return {
    'summary.html': htmlReport(data),
  };
}