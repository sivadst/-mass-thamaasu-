const iterations = 100000;

function benchUnshift() {
  const arr = [];
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    arr.unshift(i);
  }
  const end = performance.now();
  return end - start;
}

function benchPush() {
  const arr = [];
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    arr.push(i);
  }
  const end = performance.now();
  return end - start;
}

console.log(`Unshift time: ${benchUnshift().toFixed(2)} ms`);
console.log(`Push time: ${benchPush().toFixed(2)} ms`);
