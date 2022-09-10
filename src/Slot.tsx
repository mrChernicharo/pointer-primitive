import { createStore } from 'solid-js/store';
import { createMemo } from 'solid-js';
import { createPerPointerListeners } from '@solid-primitives/pointer';

export default function Slot(props: any) {
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
	});

	// MIDDLE LISTENER
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
					// y: p.y,
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

	const height = createMemo(() => `${state.height}px`);
	const transform = createMemo(
		() => `translate(${state.pos.x}px, ${state.pos.y}px)`
	);

	return (
		<div
			ref={slotRef}
			class="absolute"
			style={{
				top: props.top + 'px' || 0,
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
	);
}
