const { calculateAutoCancelDelay } = require('./src/lib/autoCancelManager.ts');

const now = new Date();

// Test 12 hours in advance
const in12Hours = new Date(now.getTime() + 12 * 60 * 60 * 1000);
const delay12 = calculateAutoCancelDelay(now, in12Hours, '10:00');
console.log('12 hours in advance:', delay12 / (1000 * 60), 'minutes');

// Test 30 hours in advance 
const in30Hours = new Date(now.getTime() + 30 * 60 * 60 * 1000);
const delay30 = calculateAutoCancelDelay(now, in30Hours, '10:00');
console.log('30 hours in advance:', delay30 / (1000 * 60 * 60), 'hours');

// Test 72 hours in advance
const in72Hours = new Date(now.getTime() + 72 * 60 * 60 * 1000);
const delay72 = calculateAutoCancelDelay(now, in72Hours, '10:00');
console.log('72 hours in advance:', delay72 / (1000 * 60 * 60), 'hours');










