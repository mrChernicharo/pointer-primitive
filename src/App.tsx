import { createPerPointerListeners } from '@solid-primitives/pointer';
import { For, createMemo } from 'solid-js';

import { createStore } from 'solid-js/store';
// @ts-ignore
import idMaker from '@melodev/id-maker';

export const App = () => {
	let containerRef!: HTMLDivElement;

	const [store, setStore] = createStore({
		slotId: null,
		gesture: 'idle',
		slots: [
			{
				id: idMaker(),
				pos: {
					x: 300,
					y: 0,
				},
				height: 70,
			},
			{
				id: idMaker(),
				pos: {
					x: 200,
					y: 500,
				},
				height: 40,
			},
			{
				id: idMaker(),
				pos: {
					x: 0,
					y: 400,
				},
				height: 60,
			},
		],
	});

	createPerPointerListeners({
		target: () => containerRef,
		onEnter(e, { onDown, onMove, onUp, onLeave }) {
			let last: { x: number; y: number } | null;
			onDown(({ x, y }) => (last = { x, y }));
			onUp(() => {
				last = null;
				setStore('gesture', 'idle');
				console.log('dropped', store.slotId);
			});
			onLeave(() => (last = null));
			onMove(({ x, y, movementY, movementX }) => {
				if (!last) return;

				const idx = store.slots.findIndex(
					slot => slot.id === store.slotId
				);
				if (store.gesture === 'drag:middle') {
					setStore('slots', idx, 'pos', p => ({
						x: p.x + x - last!.x,
						y: p.y + y - last!.y,
					}));
				}

				if (store.gesture === 'drag:top') {
					setStore('slots', idx, 'pos', p => ({
						x: p.x,
						y: p.y + y - last!.y,
						// y: p.y,
					}));

					setStore('slots', idx, 'height', h => h + (last!.y - y));
				}

				if (store.gesture === 'drag:bottom') {
					setStore('slots', idx, 'pos', p => ({
						x: p.x,
						y: p.y,
					}));

					setStore('slots', idx, 'height', h => h + (y - last!.y));
					last = { x, y };
				}

				last = { x, y };
			});
		},
	});

	return (
		<div
			ref={containerRef}
			class="relative w-[150vw] h-[150vh] box-border bg-gray-800 text-white"
		>
			<For each={store.slots}>
				{slot => {
					let slotRef!: HTMLDivElement;
					let middleRef!: HTMLDivElement;
					let topRef!: HTMLDivElement;
					let bottomRef!: HTMLDivElement;

					// MIDDLE LISTENER
					createPerPointerListeners({
						target: () => middleRef,
						onEnter(e, { onDown, onMove, onUp, onLeave }) {
							onDown(({ x, y }) => {
								setStore('slotId', slot.id);
								setStore('gesture', 'drag:middle');
							});
						},
					});

					// TOP LISTENER
					createPerPointerListeners({
						target: () => topRef,
						onEnter(e, { onDown, onMove, onUp, onLeave }) {
							onDown(({ x, y }) => {
								setStore('slotId', slot.id);
								setStore('gesture', 'drag:top');
							});
						},
					});

					// BOTTOM LISTENER
					createPerPointerListeners({
						target: () => bottomRef,
						onEnter(e, { onDown, onMove, onUp, onLeave }) {
							onDown(({ x, y }) => {
								setStore('slotId', slot.id);
								setStore('gesture', 'drag:bottom');
							});
						},
					});

					const height = createMemo(() => `${slot.height}px`);
					const transform = createMemo(
						() => `translate(${slot.pos.x}px, ${slot.pos.y}px)`
					);

					return (
						<div
							id={slot.id}
							ref={slotRef}
							class="absolute"
							style={{
								height: height(),
								transform: transform(),
								// transition: 'transform ease-out .2s',
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
								class="h-[100%] flex flex-col justify-center items-center"
								style={{
									'touch-action': 'none',
									'user-select': 'none',
								}}
							>
								<p>{slot.id}</p>
								<p>
									{store.slotId === slot.id
										? store.gesture
										: 'idle'}
								</p>
							</div>
							<div
								ref={bottomRef}
								class="w-32 h-6 bg-slate-500"
								style={{
									'touch-action': 'none',
								}}
							></div>
							{/* <pre>{JSON.stringify(state, null, 2)}</pre> */}
						</div>
					);
				}}
			</For>
			<pre style={{ 'user-select': 'none' }}>
				{JSON.stringify(store, null, 2)}
			</pre>
		</div>
	);
};
