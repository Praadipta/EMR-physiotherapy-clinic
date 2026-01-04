<script lang="ts">
	let {
		value = $bindable(0),
		readonly = false,
		showLabels = true,
		size = 'medium'
	}: {
		value?: number;
		readonly?: boolean;
		showLabels?: boolean;
		size?: 'small' | 'medium' | 'large';
	} = $props();

	const painLabels = [
		{ min: 0, max: 0, label: 'Tidak Nyeri', color: '#22c55e', emoji: '😊' },
		{ min: 1, max: 2, label: 'Nyeri Ringan', color: '#84cc16', emoji: '🙂' },
		{ min: 3, max: 4, label: 'Nyeri Sedang', color: '#eab308', emoji: '😐' },
		{ min: 5, max: 6, label: 'Nyeri Cukup Berat', color: '#f97316', emoji: '😟' },
		{ min: 7, max: 8, label: 'Nyeri Berat', color: '#ef4444', emoji: '😣' },
		{ min: 9, max: 10, label: 'Nyeri Sangat Berat', color: '#dc2626', emoji: '😭' }
	];

	const currentLabel = $derived(() => {
		return painLabels.find(p => value >= p.min && value <= p.max) || painLabels[0];
	});

	const sliderBackground = $derived(() => {
		const percentage = (value / 10) * 100;
		return `linear-gradient(to right, #22c55e 0%, #eab308 50%, #ef4444 100%)`;
	});

	const sizeClasses = {
		small: { height: 'h-2', thumb: 'w-4 h-4', text: 'text-sm' },
		medium: { height: 'h-4', thumb: 'w-6 h-6', text: 'text-base' },
		large: { height: 'h-6', thumb: 'w-8 h-8', text: 'text-lg' }
	};
</script>

<div class="vas-pain-scale">
	<!-- Current Value Display -->
	<div class="flex items-center justify-center gap-3 mb-4">
		<span class="text-4xl">{currentLabel().emoji}</span>
		<div class="text-center">
			<span class="text-5xl font-bold" style="color: {currentLabel().color}">{value}</span>
			<span class="text-2xl text-gray-400">/10</span>
		</div>
	</div>

	{#if showLabels}
		<p class="text-center font-medium mb-4" style="color: {currentLabel().color}">
			{currentLabel().label}
		</p>
	{/if}

	<!-- Slider -->
	<div class="relative">
		<input
			type="range"
			min="0"
			max="10"
			step="1"
			bind:value
			disabled={readonly}
			class="w-full appearance-none rounded-full cursor-pointer disabled:cursor-not-allowed
				{sizeClasses[size].height}"
			style="background: {sliderBackground()}"
		/>
		
		<!-- Scale markers -->
		<div class="flex justify-between mt-2 px-1">
			{#each Array(11) as _, i}
				<button
					type="button"
					onclick={() => !readonly && (value = i)}
					disabled={readonly}
					class="w-6 h-6 rounded-full text-xs font-medium transition-all
						{value === i ? 'bg-gray-800 text-white scale-110' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}
						disabled:cursor-not-allowed"
				>
					{i}
				</button>
			{/each}
		</div>
	</div>

	<!-- Description Scale -->
	{#if showLabels}
		<div class="mt-6 grid grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
			{#each painLabels as label}
				<div class="p-2 rounded-lg" style="background-color: {label.color}20">
					<span class="text-lg">{label.emoji}</span>
					<p class="font-medium" style="color: {label.color}">{label.min}-{label.max}</p>
					<p class="text-gray-600 text-[10px]">{label.label}</p>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	input[type="range"] {
		-webkit-appearance: none;
		height: 16px;
		border-radius: 8px;
	}
	
	input[type="range"]::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 28px;
		height: 28px;
		background: white;
		border: 3px solid #374151;
		border-radius: 50%;
		cursor: pointer;
		box-shadow: 0 2px 6px rgba(0,0,0,0.2);
	}
	
	input[type="range"]::-moz-range-thumb {
		width: 28px;
		height: 28px;
		background: white;
		border: 3px solid #374151;
		border-radius: 50%;
		cursor: pointer;
		box-shadow: 0 2px 6px rgba(0,0,0,0.2);
	}

	input[type="range"]:disabled::-webkit-slider-thumb {
		cursor: not-allowed;
		opacity: 0.7;
	}
</style>
