#!/usr/bin/env node
/**
 * WebSocket Event Validator
 * Validates event structure against schema.
 *
 * Usage:
 *   node validate-ws-event.js '{"topic":"gift-list:123","event":"UPDATED",...}'
 *   echo '{"topic":"..."}' | node validate-ws-event.js
 */

const TOPIC_PATTERN = /^[a-z][a-z0-9-]*:[a-z0-9-]+$/;
const VALID_EVENTS = ['ADDED', 'UPDATED', 'DELETED', 'STATUS_CHANGED'];

function validate(event) {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!event.topic) {
    errors.push('Missing required field: topic');
  } else if (!TOPIC_PATTERN.test(event.topic)) {
    errors.push(`Invalid topic format "${event.topic}". Expected: "{resource}:{id}" (e.g., "gift-list:123")`);
  }

  if (!event.event) {
    errors.push('Missing required field: event');
  } else if (!VALID_EVENTS.includes(event.event) && !event.event.match(/^[A-Z_]+$/)) {
    warnings.push(`Non-standard event type "${event.event}". Standard: ${VALID_EVENTS.join(', ')}`);
  }

  if (!event.data) {
    errors.push('Missing required field: data');
  } else {
    if (!event.data.entity_id) {
      errors.push('Missing required field: data.entity_id');
    }

    if (event.data.payload === undefined) {
      warnings.push('Missing data.payload (optional but recommended)');
    }

    if (!event.data.timestamp) {
      warnings.push('Missing data.timestamp (recommended for ordering)');
    } else {
      const ts = new Date(event.data.timestamp);
      if (isNaN(ts.getTime())) {
        errors.push(`Invalid timestamp "${event.data.timestamp}". Use ISO 8601 format.`);
      }
    }
  }

  // Optional fields validation
  if (event.trace_id && typeof event.trace_id !== 'string') {
    errors.push('trace_id must be a string');
  }

  if (event.version !== undefined && (!Number.isInteger(event.version) || event.version < 1)) {
    errors.push('version must be a positive integer');
  }

  return { valid: errors.length === 0, errors, warnings };
}

function formatResult(result, event) {
  const lines = [];

  if (result.valid) {
    lines.push('✓ Event is valid');
  } else {
    lines.push('✗ Event is invalid');
  }

  if (result.errors.length > 0) {
    lines.push('\nErrors:');
    result.errors.forEach(e => lines.push(`  - ${e}`));
  }

  if (result.warnings.length > 0) {
    lines.push('\nWarnings:');
    result.warnings.forEach(w => lines.push(`  - ${w}`));
  }

  if (result.valid) {
    lines.push('\nParsed:');
    lines.push(`  Topic: ${event.topic}`);
    lines.push(`  Event: ${event.event}`);
    lines.push(`  Entity: ${event.data?.entity_id}`);
  }

  return lines.join('\n');
}

async function main() {
  let input = process.argv[2];

  // Read from stdin if no argument
  if (!input) {
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    input = Buffer.concat(chunks).toString().trim();
  }

  if (!input) {
    console.log('Usage: node validate-ws-event.js \'{"topic":"...","event":"...","data":{...}}\'');
    console.log('\nExample valid event:');
    console.log(JSON.stringify({
      topic: 'gift-list:123',
      event: 'UPDATED',
      data: {
        entity_id: 'gift-456',
        payload: { name: 'Updated Gift' },
        user_id: 'user-789',
        timestamp: new Date().toISOString()
      }
    }, null, 2));
    process.exit(1);
  }

  try {
    const event = JSON.parse(input);
    const result = validate(event);
    console.log(formatResult(result, event));
    process.exit(result.valid ? 0 : 1);
  } catch (err) {
    console.error('✗ Invalid JSON:', err.message);
    process.exit(1);
  }
}

main();
