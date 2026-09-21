import PostLogin from './scenarios/Post-Login.js';
import UIQuickPizza from './scenarios/browser-script.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js';

const settings = JSON.parse(open('./settings.json'));

export const options = {
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

      tags: {
        test_type: 'api',
        feature: 'login',
      },
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

      tags: {
        test_type: 'browser',
        feature: 'quickpizza-ui',
      },
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
  const httpReqDuration = data.metrics.http_req_duration?.values;
  const loginDuration = data.metrics.login_duration?.values;
  const loginFailRate = data.metrics.login_fail_rate?.values;
  const loginReqs = data.metrics.login_reqs?.values;

  console.log('\n========== K6 TEST SUMMARY ==========');

  if (httpReqDuration) {
    console.log(
      `HTTP Request p95: ${httpReqDuration['p(95)']?.toFixed(2) ?? 'N/A'} ms`
    );
  }

  if (loginDuration) {
    console.log(
      `Login Duration p95: ${loginDuration['p(95)']?.toFixed(2) ?? 'N/A'} ms`
    );
  }

  if (loginFailRate) {
    console.log(
      `Login Fail Rate: ${(loginFailRate.rate * 100).toFixed(2)}%`
    );
  }

  if (loginReqs) {
    console.log(
      `Login Requests: ${loginReqs.count ?? 0}`
    );
  }

  console.log('=====================================\n');

  return {
    'summary.html': htmlReport(data),
  };
}