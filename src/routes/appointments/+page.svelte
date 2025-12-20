<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	// State untuk tampilan
	let viewMode = $state<'calendar' | 'list'>('calendar');
	let currentDate = $state(new Date());

	// Helper functions
	function getMonthStart(date: Date): Date {
		return new Date(date.getFullYear(), date.getMonth(), 1);
	}

	function getMonthEnd(date: Date): Date {
		return new Date(date.getFullYear(), date.getMonth() + 1, 0);
	}

	function getDaysInMonth(date: Date): number[] {
		const days = [];
		const start = getMonthStart(date);
		const end = getMonthEnd(date);

		// Add empty slots for days before the first day
		for (let i = 0; i < start.getDay(); i++) {
			days.push(0);
		}

		// Add days of the month
		for (let i = 1; i <= end.getDate(); i++) {
			days.push(i);
		}

		return days;
	}

	function getAppointmentsForDay(day: number): typeof data.appointments {
		if (day === 0) return [];
		const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
		return data.appointments.filter((apt) => {
			const aptDate = new Date(apt.tanggalWaktu);
			return (
				aptDate.getFullYear() === targetDate.getFullYear() &&
				aptDate.getMonth() === targetDate.getMonth() &&
				aptDate.getDate() === targetDate.getDate()
			);
		});
	}

	function prevMonth() {
		currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
	}

	function nextMonth() {
		currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
	}

	function isToday(day: number): boolean {
		const today = new Date();
		return (
			day === today.getDate() &&
			currentDate.getMonth() === today.getMonth() &&
			currentDate.getFullYear() === today.getFullYear()
		);
	}

	let calendarDays = $derived(getDaysInMonth(currentDate));

	const statusColors: Record<string, string> = {
		dijadwalkan: 'bg-blue-100 text-blue-700 border-blue-200',
		selesai: 'bg-green-100 text-green-700 border-green-200',
		dibatalkan: 'bg-gray-100 text-gray-700 border-gray-200',
		tidak_hadir: 'bg-red-100 text-red-700 border-red-200'
	};

	const statusLabels: Record<string, string> = {
		dijadwalkan: 'Dijadwalkan',
		selesai: 'Selesai',
		dibatalkan: 'Dibatalkan',
		tidak_hadir: 'Tidak Hadir'
	};

	function getStatusColor(status: string | null): string {
		return statusColors[status || ''] || 'bg-gray-100 text-gray-700 border-gray-200';
	}

	function getStatusLabel(status: string | null): string {
		return statusLabels[status || ''] || status || 'Tidak diketahui';
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold text-gray-800">Jadwal & Appointment</h1>
			<p class="text-gray-600">Kelola jadwal terapi pasien</p>
		</div>
		<div class="flex gap-2">
			<div class="flex bg-gray-100 rounded-lg p-1">
				<button
					class="px-3 py-1 rounded-md text-sm transition-colors {viewMode === 'calendar'
						? 'bg-white shadow-sm'
						: 'text-gray-600 hover:text-gray-800'}"
					onclick={() => (viewMode = 'calendar')}
				>
					📅 Kalender
				</button>
				<button
					class="px-3 py-1 rounded-md text-sm transition-colors {viewMode === 'list'
						? 'bg-white shadow-sm'
						: 'text-gray-600 hover:text-gray-800'}"
					onclick={() => (viewMode = 'list')}
				>
					📋 List
				</button>
			</div>
			<a
				href="/appointments/new"
				class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
			>
				<span>➕</span>
				<span>Buat Jadwal</span>
			</a>
		</div>
	</div>

	{#if viewMode === 'calendar'}
		<!-- Calendar View -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<!-- Calendar Header -->
			<div class="flex items-center justify-between mb-6">
				<button
					onclick={prevMonth}
					class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
				>
					←
				</button>
				<h2 class="text-lg font-semibold text-gray-800">
					{currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
				</h2>
				<button
					onclick={nextMonth}
					class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
				>
					→
				</button>
			</div>

			<!-- Calendar Grid -->
			<div class="grid grid-cols-7 gap-1">
				<!-- Day Headers -->
				{#each ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] as day}
					<div class="p-2 text-center text-sm font-medium text-gray-500">{day}</div>
				{/each}

				<!-- Days -->
				{#each calendarDays as day}
					{@const dayAppointments = getAppointmentsForDay(day)}
					<div
						class="min-h-[100px] p-2 border border-gray-100 rounded-lg {day === 0
							? 'bg-gray-50'
							: ''} {isToday(day) ? 'bg-teal-50 border-teal-200' : ''}"
					>
						{#if day > 0}
							<div class="text-sm font-medium text-gray-700 mb-1">{day}</div>
							<div class="space-y-1">
								{#each dayAppointments.slice(0, 3) as apt}
									<a
										href="/appointments/{apt.id}"
										class="block text-xs p-1 rounded truncate {getStatusColor(apt.status)}"
									>
										{new Date(apt.tanggalWaktu).toLocaleTimeString('id-ID', {
											hour: '2-digit',
											minute: '2-digit'
										})}
										{apt.patient.namaLengkap}
									</a>
								{/each}
								{#if dayAppointments.length > 3}
									<div class="text-xs text-gray-500 text-center">
										+{dayAppointments.length - 3} lagi
									</div>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<!-- List View -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50 border-b border-gray-100">
						<tr>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Tanggal & Waktu
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Pasien
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Fisioterapis
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Durasi
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Status
							</th>
							<th
								class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Aksi
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#each data.appointments as apt}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm font-medium text-gray-900">
										{new Date(apt.tanggalWaktu).toLocaleDateString('id-ID', {
											weekday: 'short',
											day: 'numeric',
											month: 'short'
										})}
									</div>
									<div class="text-sm text-gray-500">
										{new Date(apt.tanggalWaktu).toLocaleTimeString('id-ID', {
											hour: '2-digit',
											minute: '2-digit'
										})}
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<a
										href="/patients/{apt.patient.id}"
										class="text-sm text-teal-600 hover:text-teal-800"
									>
										{apt.patient.namaLengkap}
									</a>
									<div class="text-xs text-gray-500">{apt.patient.patientId}</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="text-sm text-gray-900">{apt.fisioterapis.namaLengkap}</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="text-sm text-gray-600">{apt.durasiMenit} menit</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="px-2 py-1 text-xs rounded-full border {getStatusColor(apt.status)}">
										{getStatusLabel(apt.status)}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-right">
									<a
										href="/appointments/{apt.id}"
										class="text-teal-600 hover:text-teal-800 text-sm font-medium"
									>
										Detail
									</a>
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="6" class="px-6 py-12 text-center text-gray-500">
									Belum ada jadwal appointment
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>
