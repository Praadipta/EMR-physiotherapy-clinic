<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	let activeTab = $state<'assessments' | 'sessions'>('assessments');
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold text-gray-800">Dokumentasi Klinis</h1>
			<p class="text-gray-600">Kelola assessment dan catatan sesi terapi</p>
		</div>
		<div class="flex gap-2">
			<a
				href="/clinical/assessments/new"
				class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
			>
				<span>➕</span>
				<span>Assessment Baru</span>
			</a>
		</div>
	</div>

	<!-- Tabs -->
	<div class="border-b border-gray-200">
		<div class="flex gap-4">
			<button
				class="px-4 py-2 border-b-2 transition-colors {activeTab === 'assessments'
					? 'border-teal-600 text-teal-600'
					: 'border-transparent text-gray-500 hover:text-gray-700'}"
				onclick={() => (activeTab = 'assessments')}
			>
				📋 Assessment ({data.assessments.length})
			</button>
			<button
				class="px-4 py-2 border-b-2 transition-colors {activeTab === 'sessions'
					? 'border-teal-600 text-teal-600'
					: 'border-transparent text-gray-500 hover:text-gray-700'}"
				onclick={() => (activeTab = 'sessions')}
			>
				📝 Catatan Sesi ({data.sessionNotes.length})
			</button>
		</div>
	</div>

	{#if activeTab === 'assessments'}
		<!-- Assessments List -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50 border-b border-gray-100">
						<tr>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Tanggal
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Pasien
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Keluhan Utama
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Skala Nyeri
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Fisioterapis
							</th>
							<th
								class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Aksi
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#each data.assessments as assessment}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="text-sm text-gray-900">
										{new Date(assessment.tanggalAssessment).toLocaleDateString('id-ID')}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<a
										href="/patients/{assessment.patient.id}"
										class="text-sm text-teal-600 hover:text-teal-800"
									>
										{assessment.patient.namaLengkap}
									</a>
								</td>
								<td class="px-6 py-4">
									<span class="text-sm text-gray-900 line-clamp-1">
										{assessment.keluhanUtama}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									{#if assessment.skalaNyeri !== null}
										<span
											class="px-2 py-1 text-xs rounded-full {assessment.skalaNyeri <= 3
												? 'bg-green-100 text-green-700'
												: assessment.skalaNyeri <= 6
													? 'bg-yellow-100 text-yellow-700'
													: 'bg-red-100 text-red-700'}"
										>
											{assessment.skalaNyeri}/10
										</span>
									{:else}
										<span class="text-sm text-gray-400">-</span>
									{/if}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="text-sm text-gray-600">{assessment.fisioterapis.namaLengkap}</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-right">
									<a
										href="/clinical/assessments/{assessment.id}"
										class="text-teal-600 hover:text-teal-800 text-sm font-medium"
									>
										Detail
									</a>
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="6" class="px-6 py-12 text-center text-gray-500">
									Belum ada data assessment
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{:else}
		<!-- Session Notes List -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50 border-b border-gray-100">
						<tr>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Tanggal
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Pasien
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Keluhan (S)
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Tindakan
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Fisioterapis
							</th>
							<th
								class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Aksi
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#each data.sessionNotes as note}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="text-sm text-gray-900">
										{new Date(note.tanggalSesi).toLocaleDateString('id-ID')}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<a
										href="/patients/{note.patient.id}"
										class="text-sm text-teal-600 hover:text-teal-800"
									>
										{note.patient.namaLengkap}
									</a>
								</td>
								<td class="px-6 py-4">
									<span class="text-sm text-gray-900 line-clamp-1">
										{note.subjective}
									</span>
								</td>
								<td class="px-6 py-4">
									<span class="text-sm text-gray-900 line-clamp-1">
										{note.tindakanDilakukan || '-'}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="text-sm text-gray-600">{note.fisioterapis.namaLengkap}</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-right">
									<a
										href="/clinical/sessions/{note.id}"
										class="text-teal-600 hover:text-teal-800 text-sm font-medium"
									>
										Detail
									</a>
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="6" class="px-6 py-12 text-center text-gray-500">
									Belum ada catatan sesi
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>
