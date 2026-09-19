import GetCustomer from './scenarios/Get-Customer.js';
import PostLogin from './scenarios/Post-Login.js';
import { group, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js'

export function handleSummary(data) {
  return {
    'summary.html': htmlReport(data),
  }
}

export default () => {
    group('Endpoint Post Login - Autenticação', () => {
        PostLogin();
    });

    group('Endpoint Get Customer - Controller Customer', () => {
        GetCustomer();
    });

    sleep(1);
};