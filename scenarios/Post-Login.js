import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Métricas personalizadas
export let LoginDuration = new Trend('login_duration');
export let LoginFailRate = new Rate('login_fail_rate');
export let LoginReqs = new Counter('login_reqs');

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
  };

  const res = http.post(url, payload, params);

  // Registro de métricas
  LoginDuration.add(res.timings.duration);
  LoginReqs.add(1);
  LoginFailRate.add(res.status !== 200);

  check(res, {
    'status é 200': (r) => r.status === 200,
    'recebeu token JWT': (r) => r.json('token') !== undefined,
  });

  sleep(1);
}