<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
		<p class="text-gray-600">Selamat datang di Klinik Fisioterapi Sambung Nyowo</p>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
		<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
			<div class="flex items-center gap-4">
				<div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
					👥
				</div>
				<div>
					<p class="text-sm text-gray-500">Total Pasien</p>
					<p class="text-2xl font-bold text-gray-800">{data.stats.totalPatients}</p>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
			<div class="flex items-center gap-4">
				<div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
					📅
				</div>
				<div>
					<p class="text-sm text-gray-500">Jadwal Hari Ini</p>
					<p class="text-2xl font-bold text-gray-800">{data.stats.todayAppointments}</p>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
			<div class="flex items-center gap-4">
				<div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
					💊
				</div>
				<div>
					<p class="text-sm text-gray-500">Perawatan Aktif</p>
					<p class="text-2xl font-bold text-gray-800">{data.stats.activeTreatments}</p>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
			<div class="flex items-center gap-4">
				<div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-2xl">
					💰
				</div>
				<div>
					<p class="text-sm text-gray-500">Belum Dibayar</p>
					<p class="text-2xl font-bold text-gray-800">{data.stats.unpaidInvoices}</p>
				</div>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Jadwal Hari Ini -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100">
			<div class="p-4 border-b border-gray-100">
				<h2 class="font-semibold text-gray-800">Jadwal Hari Ini</h2>
			</div>
			<div class="p-4">
				{#if data.todayAppointments.length === 0}
					<p class="text-gray-500 text-center py-8">Tidak ada jadwal hari ini</p>
				{:else}
					<div class="space-y-3">
						{#each data.todayAppointments as appointment}
							<div class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
								<div class="text-center">
									<p class="text-sm font-medium text-teal-600">
										{new Date(appointment.tanggalWaktu).toLocaleTimeString('id-ID', {
											hour: '2-digit',
											minute: '2-digit'
										})}
									</p>
								</div>
								<div class="flex-1">
									<p class="font-medium text-gray-800">{appointment.patient.namaLengkap}</p>
									<p class="text-sm text-gray-500">{appointment.fisioterapis.namaLengkap}</p>
								</div>
								<span
									class="px-2 py-1 text-xs rounded-full {appointment.status === 'dijadwalkan'
										? 'bg-blue-100 text-blue-700'
										: appointment.status === 'selesai'
											? 'bg-green-100 text-green-700'
											: 'bg-gray-100 text-gray-700'}"
								>
									{appointment.status === 'dijadwalkan'
										? 'Dijadwalkan'
										: appointment.status === 'selesai'
											? 'Selesai'
											: appointment.status === 'dibatalkan'
												? 'Dibatalkan'
												: 'Tidak Hadir'}
								</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Pasien Terbaru -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100">
			<div class="p-4 border-b border-gray-100">
				<h2 class="font-semibold text-gray-800">Pasien Terbaru</h2>
			</div>
			<div class="p-4">
				{#if data.recentPatients.length === 0}
					<p class="text-gray-500 text-center py-8">Belum ada data pasien</p>
				{:else}
					<div class="space-y-3">
						{#each data.recentPatients as patient}
							<a
								href="/patients/{patient.id}"
								class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
							>
								<div
									class="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-medium"
								>
									{patient.namaLengkap.charAt(0).toUpperCase()}
								</div>
								<div class="flex-1">
									<p class="font-medium text-gray-800">{patient.namaLengkap}</p>
									<p class="text-sm text-gray-500">{patient.patientId}</p>
								</div>
								<span class="text-xs text-gray-400">
									{patient.jenisKelamin === 'laki-laki' ? '👨' : '👩'}
								</span>
							</a>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
