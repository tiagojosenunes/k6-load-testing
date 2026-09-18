import http from 'k6/http';
import { sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { check, fail } from 'k6';

export let GetCustomerDuration = new Trend('get_customer_duration');
export let GetCustomerFailrate = new Rate('get_customer_fail_rate');
export let GetCustomerSucessRate = new Rate('get_customer_sucess_rate');
export let GetCustomerReqs = new Counter('get_customer_reqs');

export default function () {
  let res = http.get('https://test.k6.io');

  GetCustomerDuration.add(res.timings.duration);
  GetCustomerReqs.add(1);
  GetCustomerFailrate.add(res.status === 0 || res.status >= 400);
  GetCustomerSucessRate.add(res.status < 400);

  let durationMsg = `Max Duration ${1000 / 1000}s`;
  if (!check(res, {
    'max duration': (r) => r.timings.duration < 1000,
  })) {
    fail(durationMsg);
  }

  sleep(1);
}