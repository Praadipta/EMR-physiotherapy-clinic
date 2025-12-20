<script lang="ts">
	import type { PageData, ActionData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Type for form data
	type FormData = {
		patientId?: string;
		fisioterapisId?: string;
		tanggal?: string;
		waktu?: string;
		durasiMenit?: string;
		catatan?: string | null;
	};

	// Cast form to access data property
	const formData = $derived((form as { error?: string; data?: FormData } | null)?.data);
</script>

<div class="max-w-2xl mx-auto space-y-6">
	<div>
		<a
			href="/appointments"
			class="text-teal-600 hover:text-teal-800 text-sm flex items-center gap-1"
		>
			<span>←</span>
			<span>Kembali ke Jadwal</span>
		</a>
		<h1 class="text-2xl font-bold text-gray-800 mt-2">Buat Jadwal Baru</h1>
		<p class="text-gray-600">Buat jadwal terapi untuk pasien</p>
	</div>

	{#if form?.error}
		<div class="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
			{form.error}
		</div>
	{/if}

	<form method="POST" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="md:col-span-2">
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
							selected={formData?.patientId === patient.id.toString() ||
								data.selectedPatientId === patient.id}
						>
							{patient.namaLengkap} ({patient.patientId})
						</option>
					{/each}
				</select>
			</div>

			<div class="md:col-span-2">
				<label for="fisioterapisId" class="block text-sm font-medium text-gray-700 mb-1">
					Fisioterapis <span class="text-red-500">*</span>
				</label>
				<select
					id="fisioterapisId"
					name="fisioterapisId"
					required
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				>
					<option value="">Pilih fisioterapis</option>
					{#each data.therapists as therapist}
						<option
							value={therapist.id}
							selected={formData?.fisioterapisId === therapist.id.toString()}
						>
							{therapist.namaLengkap}
						</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="tanggal" class="block text-sm font-medium text-gray-700 mb-1">
					Tanggal <span class="text-red-500">*</span>
				</label>
				<input
					type="date"
					id="tanggal"
					name="tanggal"
					required
					value={formData?.tanggal ?? ''}
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				/>
			</div>

			<div>
				<label for="waktu" class="block text-sm font-medium text-gray-700 mb-1">
					Waktu <span class="text-red-500">*</span>
				</label>
				<input
					type="time"
					id="waktu"
					name="waktu"
					required
					value={formData?.waktu ?? '09:00'}
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				/>
			</div>

			<div>
				<label for="durasiMenit" class="block text-sm font-medium text-gray-700 mb-1">
					Durasi (menit)
				</label>
				<select
					id="durasiMenit"
					name="durasiMenit"
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				>
					<option value="30" selected={formData?.durasiMenit === '30'}>30 menit</option>
					<option value="45" selected={formData?.durasiMenit === '45'}>45 menit</option>
					<option
						value="60"
						selected={!formData?.durasiMenit || formData?.durasiMenit === '60'}
					>
						60 menit
					</option>
					<option value="90" selected={formData?.durasiMenit === '90'}>90 menit</option>
					<option value="120" selected={formData?.durasiMenit === '120'}>120 menit</option>
				</select>
			</div>

			<div class="md:col-span-2">
				<label for="catatan" class="block text-sm font-medium text-gray-700 mb-1"> Catatan </label>
				<textarea
					id="catatan"
					name="catatan"
					rows="3"
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
					placeholder="Catatan tambahan untuk appointment ini..."
					>{formData?.catatan ?? ''}</textarea
				>
			</div>
		</div>

		<div class="flex gap-3">
			<a
				href="/appointments"
				class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
			>
				Batal
			</a>
			<button
				type="submit"
				class="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
			>
				Simpan Jadwal
			</button>
		</div>
	</form>
</div>
