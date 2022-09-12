export const lerp = (current: number, goal: number, p: number): number =>
	(1 - p) * current + p * goal;

export const isMobile = () =>
	!!(navigator.maxTouchPoints || 'ontouchstart' in document.documentElement);

console.log({ isMobile: isMobile() });
