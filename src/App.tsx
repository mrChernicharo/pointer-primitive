import { render } from 'solid-js/web';
import { createStore } from 'solid-js/store';
import { createSignal, createMemo } from 'solid-js';
import { createPerPointerListeners } from '@solid-primitives/pointer';
// const EASE_FACTOR = 1.4;
const EASE_FACTOR = 0.4;
// const EASE_FACTOR = 1;
export const App = () => {
	let containerRef!: HTMLDivElement;
	let slotRef!: HTMLDivElement;
	let middleRef!: HTMLDivElement;
	let topRef!: HTMLDivElement;
	let bottomRef!: HTMLDivElement;
	const [state, setState] = createStore({
		pos: {
			x: 0,
			y: 0,
		},
		height: 50,
		// top: 100,
	});

	createPerPointerListeners({
		target: () => middleRef,
		onEnter(e, { onDown, onMove, onUp, onLeave }) {
			let last: { x: number; y: number } | null;
			onDown(({ x, y }) => (last = { x, y }));
			onUp(() => (last = null));
			onLeave(() => (last = null));
			onMove(({ x, y }) => {
				if (!last) return;
				setState('pos', p => ({
					x: p.x + x - last!.x,
					y: p.y + y - last!.y,
				}));
				last = { x, y };
			});
		},
	});

	// TOP LISTENER
	createPerPointerListeners({
		target: () => topRef,
		onEnter(e, { onDown, onMove, onUp, onLeave }) {
			let last: { x: number; y: number } | null;
			onDown(({ x, y }) => (last = { x, y }));
			onUp(() => (last = null));
			onLeave(() => (last = null));
			onMove(({ x, y }) => {
				if (!last) return;
				setState('pos', p => ({
					x: p.x,
					y: p.y + y - last!.y,
				}));

				setState('height', h => h + (last!.y - y));
				last = { x, y };
			});
		},
	});

	// BOTTOM LISTENER
	createPerPointerListeners({
		target: () => bottomRef,
		onEnter(e, { onDown, onMove, onUp, onLeave }) {
			let last: { x: number; y: number } | null;
			onDown(({ x, y }) => (last = { x, y }));
			onUp(() => (last = null));
			onLeave(() => (last = null));
			onMove(({ x, y }) => {
				if (!last) return;

				setState('pos', p => ({
					x: p.x,
					y: p.y,
				}));

				setState('height', h => h + (y - last!.y));
				last = { x, y };
			});
		},
	});

	// const top = createMemo(() => {
	// 	return (slotRef?.getBoundingClientRect()?.top || 100) + 'px';
	// });
	const height = createMemo(() => `${state.height}px`);
	// const top = createMemo(() => `${state.top}px`);
	const transform = createMemo(
		() => `translate(${state.pos.x}px, ${state.pos.y}px)`
	);

	return (
		<div class="relative w-[150vw] h-[150vh] p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-12 bg-gray-800 text-white">
			<div
				ref={slotRef}
				class="absolute top-0 w-32 flex flex-col bg-gray-700 rounded-xl cursor-move select-none"
				style={{
					// top: top(),
					height: height(),
					transform: transform(),
					transition: 'ease-out .2s',
				}}
			>
				<div
					ref={topRef}
					class="w-32 h-6  bg-slate-500"
					style={{
						'touch-action': 'none',
					}}
				></div>
				<div
					ref={middleRef}
					class="h-[100%] flex justify-center items-center"
					style={{
						'touch-action': 'none',
					}}
				>
					I'm draggable!
				</div>
				<div
					ref={bottomRef}
					class="w-32 h-6 bg-slate-500"
					style={{
						'touch-action': 'none',
					}}
				></div>
			</div>

			<pre>{JSON.stringify(state, null, 2)}</pre>
		</div>
	);
};
