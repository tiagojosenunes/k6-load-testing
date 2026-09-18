import GetCustomer from './scenarios/Get-Customer.js';
import PostLogin from './scenarios/Post-Login.js';
import { group, sleep } from 'k6';

export default () => {
    group('Endpoint Post Login - Autenticação', () => {
        PostLogin();
    });

    group('Endpoint Get Customer - Controller Customer', () => {
        GetCustomer();
    });

    sleep(1);
};