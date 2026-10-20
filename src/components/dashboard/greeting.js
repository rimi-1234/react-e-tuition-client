import { useState } from 'react';

/** "Good morning" / "Good afternoon" / "Good evening" for a local hour (0–23). */
export const greetingFor = (hour) => (hour < 5 ? 'Good evening' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening');

/** Greeting for the current local time, fixed for the lifetime of the page. */
export function useGreeting() {
  const [greeting] = useState(() => greetingFor(new Date().getHours()));
  return greeting;
}
