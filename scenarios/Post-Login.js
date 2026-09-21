import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

export const LoginDuration = new Trend('login_duration');
export const LoginFailRate = new Rate('login_fail_rate');
export const LoginReqs = new Counter('login_reqs');

const LOGIN_TAGS = {
  test_type: 'api',
  feature: 'login',
  endpoint: 'login',
};

export default function PostLogin() {
  const url = 'https://quickpizza.grafana.com/api/users/token';

  const payload = JSON.stringify({
    username: 'admin',
    password: 'password',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },

    tags: LOGIN_TAGS,
  };

  const res = http.post(url, payload, params);

  let token;

  try {
    token = res.json('token');
  } catch (error) {
    token = undefined;
  }

  const statusIsValid = res.status === 200;
  const tokenIsValid = token !== undefined;

  const loginSuccess = statusIsValid && tokenIsValid;

  LoginDuration.add(res.timings.duration, LOGIN_TAGS);

  LoginReqs.add(1, LOGIN_TAGS);

  LoginFailRate.add(!loginSuccess, LOGIN_TAGS);

  check(
    res,
    {
      'status é 200': (response) =>
        response.status === 200,

      'recebeu token JWT': () => token !== undefined,
    },
    LOGIN_TAGS
  );

  sleep(1);
}