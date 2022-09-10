import Slot from './Slot';

export const App = () => {
	return (
		<div class="relative w-[150vw] h-[150vh] box-border bg-gray-800 text-white">
			<Slot />
			<Slot />
			<Slot />
			<Slot top={120} />
			<Slot top={240} />
		</div>
	);
};
