<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(amount);
	}

	function getMonthName(month: number) {
		const months = [
			'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
			'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
		];
		return months[month - 1] || '';
	}
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-gray-800">Laporan & Statistik</h1>
		<p class="text-gray-600">Ringkasan performa klinik Sambung Nyowo</p>
	</div>

	<!-- Key Metrics -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-gray-500">Total Pasien</p>
					<p class="text-3xl font-bold text-gray-800">{data.metrics.totalPasien}</p>
				</div>
				<div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
					<span class="text-2xl">👥</span>
				</div>
			</div>
			<p class="text-sm text-gray-500 mt-2">
				+{data.metrics.pasienBaru} pasien baru bulan ini
			</p>
		</div>

		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-gray-500">Sesi Bulan Ini</p>
					<p class="text-3xl font-bold text-teal-600">{data.metrics.sesiBulanIni}</p>
				</div>
				<div class="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
					<span class="text-2xl">📅</span>
				</div>
			</div>
			<p class="text-sm text-gray-500 mt-2">
				{data.metrics.sesiSelesai} selesai, {data.metrics.sesiDibatalkan} dibatalkan
			</p>
		</div>

		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-gray-500">Pendapatan Bulan Ini</p>
					<p class="text-2xl font-bold text-green-600">{formatCurrency(data.metrics.pendapatanBulanIni)}</p>
				</div>
				<div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
					<span class="text-2xl">💰</span>
				</div>
			</div>
			<p class="text-sm text-gray-500 mt-2">
				{formatCurrency(data.metrics.tagihanBelumLunas)} belum lunas
			</p>
		</div>

		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-gray-500">Terapi Aktif</p>
					<p class="text-3xl font-bold text-purple-600">{data.metrics.terapiAktif}</p>
				</div>
				<div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
					<span class="text-2xl">💊</span>
				</div>
			</div>
			<p class="text-sm text-gray-500 mt-2">
				{data.metrics.terapiSelesaiBulanIni} selesai bulan ini
			</p>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Kunjungan Harian -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<h2 class="text-lg font-semibold text-gray-800 mb-4">Kunjungan 7 Hari Terakhir</h2>
			<div class="space-y-3">
				{#each data.kunjunganHarian as day}
					<div class="flex items-center gap-4">
						<div class="w-24 text-sm text-gray-600">
							{new Date(day.tanggal).toLocaleDateString('id-ID', {
								weekday: 'short',
								day: 'numeric',
								month: 'short'
							})}
						</div>
						<div class="flex-1">
							<div class="w-full bg-gray-200 rounded-full h-4">
								<div
									class="bg-teal-600 h-4 rounded-full transition-all duration-300"
									style="width: {Math.min((day.jumlah / 20) * 100, 100)}%"
								></div>
							</div>
						</div>
						<div class="w-12 text-right font-medium text-gray-800">{day.jumlah}</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Pendapatan Bulanan -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<h2 class="text-lg font-semibold text-gray-800 mb-4">Pendapatan 6 Bulan Terakhir</h2>
			<div class="space-y-3">
				{#each data.pendapatanBulanan as month}
					<div class="flex items-center gap-4">
						<div class="w-24 text-sm text-gray-600">
							{getMonthName(month.bulan)} {month.tahun}
						</div>
						<div class="flex-1">
							<div class="w-full bg-gray-200 rounded-full h-4">
								<div
									class="bg-green-600 h-4 rounded-full transition-all duration-300"
									style="width: {Math.min((month.jumlah / (data.maxPendapatan || 1)) * 100, 100)}%"
								></div>
							</div>
						</div>
						<div class="w-28 text-right font-medium text-gray-800">{formatCurrency(month.jumlah)}</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Performa Fisioterapis -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<h2 class="text-lg font-semibold text-gray-800 mb-4">Performa Fisioterapis Bulan Ini</h2>
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b border-gray-100">
							<th class="text-left py-2 text-sm font-medium text-gray-500">Nama</th>
							<th class="text-right py-2 text-sm font-medium text-gray-500">Sesi</th>
							<th class="text-right py-2 text-sm font-medium text-gray-500">Pasien</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#if data.performaFisioterapis.length === 0}
							<tr>
								<td colspan="3" class="py-4 text-center text-gray-500">
									Belum ada data
								</td>
							</tr>
						{:else}
							{#each data.performaFisioterapis as terapis}
								<tr>
									<td class="py-3 text-gray-800">{terapis.nama}</td>
									<td class="py-3 text-right font-medium text-gray-800">{terapis.sesi}</td>
									<td class="py-3 text-right text-gray-600">{terapis.pasien}</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Diagnosis Populer -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<h2 class="text-lg font-semibold text-gray-800 mb-4">Diagnosis Tersering</h2>
			<div class="space-y-3">
				{#if data.diagnosisTersering.length === 0}
					<p class="text-center text-gray-500 py-4">Belum ada data</p>
				{:else}
					{#each data.diagnosisTersering as diagnosis, index}
						<div class="flex items-center gap-4">
							<div
								class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
								{index === 0
									? 'bg-yellow-100 text-yellow-700'
									: index === 1
										? 'bg-gray-200 text-gray-700'
										: index === 2
											? 'bg-orange-100 text-orange-700'
											: 'bg-gray-100 text-gray-600'}"
							>
								{index + 1}
							</div>
							<div class="flex-1">
								<p class="text-gray-800">{diagnosis.diagnosis}</p>
							</div>
							<div class="text-right font-medium text-gray-600">{diagnosis.jumlah} kasus</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>

	<!-- Audit Log -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
		<h2 class="text-lg font-semibold text-gray-800 mb-4">Aktivitas Terbaru</h2>
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead>
					<tr class="border-b border-gray-100">
						<th class="text-left py-2 text-sm font-medium text-gray-500">Waktu</th>
						<th class="text-left py-2 text-sm font-medium text-gray-500">User</th>
						<th class="text-left py-2 text-sm font-medium text-gray-500">Aksi</th>
						<th class="text-left py-2 text-sm font-medium text-gray-500">Tabel</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#if data.aktivitasTerbaru.length === 0}
						<tr>
							<td colspan="4" class="py-4 text-center text-gray-500">
								Belum ada aktivitas
							</td>
						</tr>
					{:else}
						{#each data.aktivitasTerbaru as log}
							<tr>
								<td class="py-3 text-sm text-gray-600">
									{log.createdAt ? new Date(log.createdAt).toLocaleString('id-ID', {
										day: 'numeric',
										month: 'short',
										hour: '2-digit',
										minute: '2-digit'
									}) : '-'}
								</td>
								<td class="py-3 text-gray-800">{log.user?.namaLengkap || '-'}</td>
								<td class="py-3">
									<span
										class="px-2 py-1 rounded text-xs font-medium
										{log.action === 'CREATE'
											? 'bg-green-100 text-green-700'
											: log.action === 'UPDATE'
												? 'bg-blue-100 text-blue-700'
												: log.action === 'DELETE'
													? 'bg-red-100 text-red-700'
													: 'bg-gray-100 text-gray-700'}"
									>
										{log.action}
									</span>
								</td>
								<td class="py-3 text-gray-600">{log.tableName}</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
