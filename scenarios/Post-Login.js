import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Métricas personalizadas para o Login
export let LoginDuration = new Trend('login_duration');
export let LoginFailRate = new Rate('login_fail_rate');
export let LoginSuccessRate = new Rate('login_success_rate');
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

  let res = http.post(url, payload, params);

  // Registro das métricas
  LoginDuration.add(res.timings.duration);
  LoginReqs.add(1);
  LoginFailRate.add(res.status === 0 || res.status >= 400);
  LoginSuccessRate.add(res.status < 400);

  check(res, {
    'status é 200': (r) => r.status === 200,
    'token retornado': (r) => r.json('token') !== undefined,
  });

  sleep(1);
}