<script lang="ts">
	import type { PageData, ActionData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(amount);
	}
</script>

<div class="max-w-3xl mx-auto space-y-6">
	<div>
		<a href="/billing" class="text-teal-600 hover:text-teal-800 text-sm flex items-center gap-1">
			<span>←</span>
			<span>Kembali ke Billing</span>
		</a>
		<h1 class="text-2xl font-bold text-gray-800 mt-2">Invoice Baru</h1>
		<p class="text-gray-600">Buat invoice untuk layanan fisioterapi</p>
	</div>

	{#if form?.error}
		<div class="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
			{form.error}
		</div>
	{/if}

	<form method="POST" class="space-y-6">
		{#if data.appointmentId}
			<input type="hidden" name="appointmentId" value={data.appointmentId} />
		{/if}
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
			<h2 class="text-lg font-semibold text-gray-800">Informasi Dasar</h2>

			<!-- Pasien -->
			<div>
				<label for="patientId" class="block text-sm font-medium text-gray-700 mb-1">
					Pasien <span class="text-red-500">*</span>
				</label>
				<select
					id="patientId"
					name="patientId"
					required
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				>
					<option value="">Pilih pasien</option>
					{#each data.patients as patient}
						<option
							value={patient.id}
							selected={data.selectedPatientId === patient.id}
						>
							{patient.namaLengkap} ({patient.patientId})
						</option>
					{/each}
				</select>
			</div>

			<!-- Tanggal -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label for="tanggalTerbit" class="block text-sm font-medium text-gray-700 mb-1">
						Tanggal Terbit <span class="text-red-500">*</span>
					</label>
					<input
						type="date"
						id="tanggalTerbit"
						name="tanggalTerbit"
						required
						value={new Date().toISOString().split('T')[0]}
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
					/>
				</div>

				<div>
					<label for="tanggalJatuhTempo" class="block text-sm font-medium text-gray-700 mb-1">
						Jatuh Tempo <span class="text-red-500">*</span>
					</label>
					<input
						type="date"
						id="tanggalJatuhTempo"
						name="tanggalJatuhTempo"
						required
						value={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
					/>
				</div>
			</div>
		</div>

		<!-- Detail Tagihan -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
			<h2 class="text-lg font-semibold text-gray-800">Detail Tagihan</h2>

			<div>
				<label for="jumlah" class="block text-sm font-medium text-gray-700 mb-1">
					Jumlah (Rp) <span class="text-red-500">*</span>
				</label>
				<input
					type="number"
					id="jumlah"
					name="jumlah"
					required
					min="1000"
					step="1000"
					placeholder="Masukkan jumlah tagihan"
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				/>
			</div>

			<div>
				<label for="deskripsi" class="block text-sm font-medium text-gray-700 mb-1">
					Deskripsi
				</label>
				<textarea
					id="deskripsi"
					name="deskripsi"
					rows="3"
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
					placeholder="Deskripsi layanan yang ditagihkan..."
				></textarea>
			</div>
		</div>

		<div class="flex gap-3">
			<a
				href="/billing"
				class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
			>
				Batal
			</a>
			<button
				type="submit"
				class="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
			>
				Buat Invoice
			</button>
		</div>
	</form>
</div>
