let lastTime = 0;
let counter = 0;
export function nextId(now = Date.now()): string {
  if (now === lastTime) counter++;
  else {
    lastTime = now;
    counter = 0;
  }
  return `${now.toString(36)}-${counter.toString(36)}`;
}
