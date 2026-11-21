import test from 'node:test'
import assert from 'node:assert/strict'
import { transitionTicket } from '../starter/supportDesk.mjs'

const dependencies = (notifications = []) => ({
  now: () => '2026-01-02T03:04:05.000Z',
  createId: (namespace, seed) => `${namespace}:${seed}`,
  notify: (notification) => notifications.push(notification),
})

const ticket = (overrides = {}) => ({
  id: 't1', ownerId: 'u1', status: 'open', version: 0,
  updatedAt: null, updatedBy: null, ...overrides,
})

test('[request_contracts] rejects an unknown status with a stable code', () => {
  assert.throws(
    () => transitionTicket(ticket(), { id: 'u1', role: 'agent' }, 'deleted', dependencies()),
    (error) => error?.code === 'INVALID_INPUT',
  )
})

test('[authorization] rejects a cross-user ticket transition', () => {
  assert.throws(
    () => transitionTicket(ticket({ ownerId: 'owner' }), { id: 'other', role: 'agent' }, 'closed', dependencies()),
    (error) => error?.code === 'FORBIDDEN',
  )
})

test('[state_transitions] keeps closed tickets terminal', () => {
  assert.throws(
    () => transitionTicket(ticket({ status: 'closed', version: 2 }), { id: 'u1', role: 'agent' }, 'open', dependencies()),
    (error) => error?.code === 'ILLEGAL_TRANSITION',
  )
})

test('[idempotent_notifications] derives the same notification for the same retry input', () => {
  const calls = []
  const input = ticket({ version: 3 })
  const first = transitionTicket(input, { id: 'u1', role: 'agent' }, 'closed', dependencies(calls))
  const second = transitionTicket(input, { id: 'u1', role: 'agent' }, 'closed', dependencies(calls))
  assert.equal(first.notification.id, 'ticket-status:t1:3:closed')
  assert.equal(second.notification.id, first.notification.id)
  assert.deepEqual(calls.map((item) => item.id), [first.notification.id, first.notification.id])
})
