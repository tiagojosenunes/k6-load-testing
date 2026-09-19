import PostLogin from './scenarios/Post-Login.js';
import UIQuickPizza from './scenarios/browser-script.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js';

const settings = JSON.parse(open('./settings.json'));

export const options = {
  // A propriedade cloud foi mantida apenas com o nome, omitindo o projectID
  cloud: {
    name: 'QuickPizza Load Test Suite',
  },
  thresholds: settings.thresholds,
  scenarios: {
    api_login_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: settings.stages,
      exec: 'runApiLogin',
    },
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

export function runApiLogin() {
  PostLogin();
}

export async function runUiTest() {
  await UIQuickPizza();
}

export function handleSummary(data) {
  return {
    'summary.html': htmlReport(data),
  };
}