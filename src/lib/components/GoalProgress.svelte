<script lang="ts">
	interface Goal {
		id: number;
		title: string;
		description?: string;
		category: string;
		targetValue?: number;
		currentValue?: number;
		baselineValue?: number;
		unit?: string;
		progressPercent: number;
		status: 'active' | 'achieved' | 'missed' | 'revised' | 'cancelled';
		targetDate?: string;
	}

	let {
		goals = [],
		onGoalClick,
		showAddButton = true,
		onAddClick
	}: {
		goals?: Goal[];
		onGoalClick?: (goal: Goal) => void;
		showAddButton?: boolean;
		onAddClick?: () => void;
	} = $props();

	const categoryLabels: Record<string, { label: string; icon: string }> = {
		pain: { label: 'Nyeri', icon: '🔴' },
		mobility: { label: 'Mobilitas', icon: '🔄' },
		strength: { label: 'Kekuatan', icon: '💪' },
		function: { label: 'Fungsi', icon: '🎯' },
		independence: { label: 'Kemandirian', icon: '🚶' },
		return_to_work: { label: 'Kembali Kerja', icon: '💼' },
		sport: { label: 'Olahraga', icon: '⚽' },
		other: { label: 'Lainnya', icon: '📋' }
	};

	const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
		active: { label: 'Aktif', color: 'text-blue-700', bg: 'bg-blue-100' },
		achieved: { label: 'Tercapai', color: 'text-green-700', bg: 'bg-green-100' },
		missed: { label: 'Tidak Tercapai', color: 'text-red-700', bg: 'bg-red-100' },
		revised: { label: 'Direvisi', color: 'text-yellow-700', bg: 'bg-yellow-100' },
		cancelled: { label: 'Dibatalkan', color: 'text-gray-700', bg: 'bg-gray-100' }
	};

	function getProgressColor(percent: number): string {
		if (percent >= 100) return 'bg-green-500';
		if (percent >= 75) return 'bg-teal-500';
		if (percent >= 50) return 'bg-yellow-500';
		if (percent >= 25) return 'bg-orange-500';
		return 'bg-red-500';
	}
</script>

<div class="goal-progress-tracker space-y-4">
	{#if showAddButton}
		<div class="flex justify-between items-center">
			<h3 class="font-semibold text-gray-800">🎯 Target Terapi</h3>
			{#if onAddClick}
				<button
					onclick={onAddClick}
					class="px-3 py-1 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700"
				>
					+ Tambah Target
				</button>
			{/if}
		</div>
	{/if}

	{#if goals.length === 0}
		<div class="text-center py-8 text-gray-500">
			<span class="text-4xl">🎯</span>
			<p class="mt-2">Belum ada target yang ditetapkan</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each goals as goal}
				<button
					onclick={() => onGoalClick?.(goal)}
					class="w-full text-left p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
				>
					<div class="flex items-start gap-3">
						<div class="text-2xl">
							{categoryLabels[goal.category]?.icon || '📋'}
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 flex-wrap">
								<h4 class="font-medium text-gray-800">{goal.title}</h4>
								<span class="px-2 py-0.5 text-xs rounded-full {statusLabels[goal.status].bg} {statusLabels[goal.status].color}">
									{statusLabels[goal.status].label}
								</span>
							</div>
							
							{#if goal.description}
								<p class="text-sm text-gray-500 mt-1 line-clamp-1">{goal.description}</p>
							{/if}

							<!-- Progress Bar -->
							<div class="mt-3">
								<div class="flex justify-between text-sm mb-1">
									<span class="text-gray-600">Progress</span>
									<span class="font-medium">{goal.progressPercent}%</span>
								</div>
								<div class="h-2 bg-gray-200 rounded-full overflow-hidden">
									<div 
										class="h-full rounded-full transition-all duration-500 {getProgressColor(goal.progressPercent)}"
										style="width: {Math.min(goal.progressPercent, 100)}%"
									></div>
								</div>
							</div>

							<!-- Value Display -->
							{#if goal.targetValue !== undefined && goal.currentValue !== undefined}
								<div class="flex items-center gap-4 mt-2 text-sm">
									<div class="flex items-center gap-1">
										<span class="text-gray-500">Awal:</span>
										<span class="font-medium">{goal.baselineValue ?? '-'}{goal.unit ? ` ${goal.unit}` : ''}</span>
									</div>
									<div class="flex items-center gap-1">
										<span class="text-gray-500">Saat ini:</span>
										<span class="font-medium text-teal-600">{goal.currentValue}{goal.unit ? ` ${goal.unit}` : ''}</span>
									</div>
									<div class="flex items-center gap-1">
										<span class="text-gray-500">Target:</span>
										<span class="font-medium text-green-600">{goal.targetValue}{goal.unit ? ` ${goal.unit}` : ''}</span>
									</div>
								</div>
							{/if}

							<!-- Target Date -->
							{#if goal.targetDate}
								<div class="mt-2 text-xs text-gray-500">
									📅 Target: {new Date(goal.targetDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
								</div>
							{/if}
						</div>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>
