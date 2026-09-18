import GetCustomer from './scenarios/Get-Customer.js'
import {group, sleep } from 'k6'

export default () => {
    group ('Endpoint Get Customer - Controller Customer', () => {
        GetCustomer()
    })
    sleep(1)
}