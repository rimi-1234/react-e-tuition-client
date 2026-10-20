/**
 * Damped harmonic spring, integrated with semi-implicit Euler in fixed
 * 1 ms sub-steps so the motion is identical at 30, 60 or 144 Hz.
 *
 *   const s = createSpring({ from: 0, to: 100, stiffness: 170, damping: 26 });
 *   s.step(16) → { value, done }
 */
export const SPRINGS = {
  gentle: { stiffness: 120, damping: 20, mass: 1 },
  snappy: { stiffness: 320, damping: 30, mass: 1 },
  bouncy: { stiffness: 260, damping: 14, mass: 1 },
  slow: { stiffness: 60, damping: 18, mass: 1 },
};

export function createSpring({
  from = 0,
  to = 1,
  velocity = 0,
  stiffness = 170,
  damping = 26,
  mass = 1,
  restDelta = 0.01,
  restSpeed = 0.01,
} = {}) {
  let x = from;
  let v = velocity; // units per second
  let target = to;

  return {
    get value() {
      return x;
    },
    get velocity() {
      return v;
    },
    set target(next) {
      target = next;
    },
    get target() {
      return target;
    },
    jump(value) {
      x = value;
      v = 0;
    },
    step(deltaMs) {
      const steps = Math.max(1, Math.round(deltaMs));
      const h = deltaMs / steps / 1000;
      for (let i = 0; i < steps; i++) {
        const force = -stiffness * (x - target) - damping * v;
        v += (force / mass) * h;
        x += v * h;
      }
      const done = Math.abs(v) < restSpeed && Math.abs(x - target) < restDelta;
      if (done) {
        x = target;
        v = 0;
      }
      return { value: x, done };
    },
  };
}
