import { render } from 'solid-js/web';
import { createStore } from 'solid-js/store';
import { createSignal, createMemo } from 'solid-js';
import { createPerPointerListeners } from '@solid-primitives/pointer';

export const App = () => {
	let ref!: HTMLDivElement;
	const [state, setState] = createStore({
		pos: {
			x: 0,
			y: 0,
		},
	});

	createPerPointerListeners({
		target: () => ref,
		onEnter(e, { onDown, onMove, onUp, onLeave }) {
			let last: { x: number; y: number };
			onDown(({ x, y }) => (last = { x, y }));
			onUp(() => (last = null));
			onLeave(() => (last = null));
			onMove(({ x, y }) => {
				if (!last) return;
				setState('pos', p => ({
					x: p.x + x - last.x,
					y: p.y + y - last.y,
				}));
				last = { x, y };
			});
		},
	});

	const transform = createMemo(
		() => `translate(${state.pos.x}px, ${state.pos.y}px)`
	);

	return (
		<div class="p-24 h-[200vh] box-border w-full min-h-screen flex flex-col justify-center items-center space-y-12 bg-gray-800 text-white">
			<div
				ref={ref}
				class="w-32 h-32 bg-gray-700 rounded-xl cursor-move select-none"
				style={{
					transform: transform(),
					'touch-action': 'none',
					transition: 'ease-out .2s',
				}}
			>
				I'm draggable!
			</div>
		</div>
	);
};
