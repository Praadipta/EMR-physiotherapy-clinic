<script lang="ts">
	import type { PageData, ActionData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();
	
	let showForm = $state(false);
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-800">📋 Manajemen Rujukan</h1>
			<p class="text-gray-600">Kelola rujukan masuk dan keluar pasien</p>
		</div>
		<button
			onclick={() => showForm = !showForm}
			class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
		>
			{showForm ? 'Tutup' : '+ Buat Rujukan'}
		</button>
	</div>

	{#if form?.success}
		<div class="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
			Rujukan berhasil dibuat!
		</div>
	{/if}

	{#if showForm}
		<div class="bg-white rounded-xl shadow-sm border p-6">
			<h2 class="text-lg font-semibold mb-4">Buat Rujukan Baru</h2>
			<form method="POST" action="?/create" class="space-y-4">
				<input type="hidden" name="direction" value="incoming" />
				
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Pasien</label>
					<select name="patientId" required class="w-full px-3 py-2 border rounded-lg">
						<option value="">Pilih pasien...</option>
						{#each data.patients as patient}
							<option value={patient.id}>{patient.namaLengkap}</option>
						{/each}
					</select>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Nama Perujuk</label>
					<input type="text" name="referrerName" required class="w-full px-3 py-2 border rounded-lg" />
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
					<input type="date" name="referralDate" required class="w-full px-3 py-2 border rounded-lg" />
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Alasan</label>
					<textarea name="reasonForReferral" required rows="3" class="w-full px-3 py-2 border rounded-lg"></textarea>
				</div>

				<button type="submit" class="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg">
					Simpan
				</button>
			</form>
		</div>
	{/if}

	<div class="bg-white rounded-xl shadow-sm border">
		<div class="p-4 border-b">
			<h2 class="font-semibold text-gray-800">Daftar Rujukan ({data.referrals.length})</h2>
		</div>
		
		{#if data.referrals.length === 0}
			<div class="p-8 text-center text-gray-500">
				<span class="text-4xl">📋</span>
				<p class="mt-2">Belum ada data rujukan</p>
			</div>
		{:else}
			<div class="divide-y">
				{#each data.referrals as ref}
					<div class="p-4">
						<div class="font-medium">Pasien #{ref.patientId}</div>
						<div class="text-sm text-gray-600">Dari: {ref.referrerName || 'Unknown'}</div>
						<div class="text-sm text-gray-500">{ref.reasonForReferral || 'No reason'}</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
