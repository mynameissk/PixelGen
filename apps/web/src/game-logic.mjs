export const WORLD = Object.freeze({ width: 960, height: 600, margin: 18 });

export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function hitsRect(x, y, radius, rect) {
  const closestX = Math.max(rect.x, Math.min(x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(y, rect.y + rect.height));
  return (x - closestX) ** 2 + (y - closestY) ** 2 < radius ** 2;
}

export function movePlayer(player, input, deltaSeconds, obstacles = []) {
  const dt = Math.min(Math.max(deltaSeconds, 0), 0.05);
  let dx = Number(Boolean(input.right)) - Number(Boolean(input.left));
  let dy = Number(Boolean(input.down)) - Number(Boolean(input.up));
  if (dx && dy) { dx *= Math.SQRT1_2; dy *= Math.SQRT1_2; }
  const speed = player.speed ?? 148;
  const stepX = dx * speed * dt;
  const stepY = dy * speed * dt;
  const radius = player.radius ?? 9;
  const min = WORLD.margin + radius;
  const maxX = WORLD.width - min;
  const maxY = WORLD.height - min;
  let x = Math.max(min, Math.min(maxX, player.x + stepX));
  if (obstacles.some((rect) => hitsRect(x, player.y, radius, rect))) x = player.x;
  let y = Math.max(min, Math.min(maxY, player.y + stepY));
  if (obstacles.some((rect) => hitsRect(x, y, radius, rect))) y = player.y;
  return { ...player, x, y, moving: Boolean(dx || dy) };
}
