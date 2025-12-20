<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	let searchQuery = $state('');

	let filteredPatients = $derived(
		data.patients.filter(
			(p) =>
				p.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.patientId.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold text-gray-800">Manajemen Pasien</h1>
			<p class="text-gray-600">Kelola data pasien klinik</p>
		</div>
		<a
			href="/patients/new"
			class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
		>
			<span>➕</span>
			<span>Tambah Pasien</span>
		</a>
	</div>

	<!-- Search -->
	<div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
		<input
			type="text"
			placeholder="Cari berdasarkan nama atau ID pasien..."
			bind:value={searchQuery}
			class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
		/>
	</div>

	<!-- Patient List -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="bg-gray-50 border-b border-gray-100">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							ID Pasien
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Nama Lengkap
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Jenis Kelamin
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							No. Telepon
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Tanggal Daftar
						</th>
						<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
							Aksi
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#each filteredPatients as patient}
						<tr class="hover:bg-gray-50">
							<td class="px-6 py-4 whitespace-nowrap">
								<span class="text-sm font-medium text-teal-600">{patient.patientId}</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="flex items-center gap-3">
									<div
										class="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-medium text-sm"
									>
										{patient.namaLengkap.charAt(0).toUpperCase()}
									</div>
									<span class="text-sm text-gray-900">{patient.namaLengkap}</span>
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span class="text-sm text-gray-600">
									{patient.jenisKelamin === 'laki-laki' ? '👨 Laki-laki' : '👩 Perempuan'}
								</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span class="text-sm text-gray-600">{patient.noTelepon || '-'}</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span class="text-sm text-gray-600">
									{patient.createdAt
										? new Date(patient.createdAt).toLocaleDateString('id-ID')
										: '-'}
								</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-right">
								<a
									href="/patients/{patient.id}"
									class="text-teal-600 hover:text-teal-800 text-sm font-medium"
								>
									Lihat Detail
								</a>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="6" class="px-6 py-12 text-center text-gray-500">
								{#if searchQuery}
									Tidak ada pasien yang cocok dengan pencarian "{searchQuery}"
								{:else}
									Belum ada data pasien
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
