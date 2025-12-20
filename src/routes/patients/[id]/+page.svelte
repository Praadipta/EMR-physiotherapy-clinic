<script lang="ts">
	import type { PageData, ActionData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isEditing = $state(false);
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<a href="/patients" class="text-teal-600 hover:text-teal-800 text-sm flex items-center gap-1">
				<span>←</span>
				<span>Kembali ke Daftar Pasien</span>
			</a>
			<h1 class="text-2xl font-bold text-gray-800 mt-2">{data.patient.namaLengkap}</h1>
			<p class="text-gray-600">{data.patient.patientId}</p>
		</div>
		<div class="flex gap-2">
			<button
				onclick={() => (isEditing = !isEditing)}
				class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
			>
				{isEditing ? 'Batal Edit' : '✏️ Edit'}
			</button>
			<a
				href="/appointments/new?patientId={data.patient.id}"
				class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
			>
				📅 Buat Jadwal
			</a>
		</div>
	</div>

	{#if form?.success}
		<div class="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
			Data pasien berhasil diperbarui
		</div>
	{/if}

	{#if form?.error}
		<div class="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
			{form.error}
		</div>
	{/if}

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Data Pasien -->
		<div class="lg:col-span-2 space-y-6">
			{#if isEditing}
				<form
					method="POST"
					action="?/update"
					class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4"
				>
					<h2 class="text-lg font-semibold text-gray-800">Edit Data Pasien</h2>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="md:col-span-2">
							<label for="namaLengkap" class="block text-sm font-medium text-gray-700 mb-1">
								Nama Lengkap
							</label>
							<input
								type="text"
								id="namaLengkap"
								name="namaLengkap"
								required
								value={data.patient.namaLengkap}
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
							/>
						</div>

						<div>
							<label for="tanggalLahir" class="block text-sm font-medium text-gray-700 mb-1">
								Tanggal Lahir
							</label>
							<input
								type="date"
								id="tanggalLahir"
								name="tanggalLahir"
								required
								value={data.patient.tanggalLahir}
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
							/>
						</div>

						<div>
							<label for="jenisKelamin" class="block text-sm font-medium text-gray-700 mb-1">
								Jenis Kelamin
							</label>
							<select
								id="jenisKelamin"
								name="jenisKelamin"
								required
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
							>
								<option value="laki-laki" selected={data.patient.jenisKelamin === 'laki-laki'}>
									Laki-laki
								</option>
								<option value="perempuan" selected={data.patient.jenisKelamin === 'perempuan'}>
									Perempuan
								</option>
							</select>
						</div>

						<div>
							<label for="noTelepon" class="block text-sm font-medium text-gray-700 mb-1">
								No. Telepon
							</label>
							<input
								type="tel"
								id="noTelepon"
								name="noTelepon"
								value={data.patient.noTelepon ?? ''}
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
							/>
						</div>

						<div>
							<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
								Email
							</label>
							<input
								type="email"
								id="email"
								name="email"
								value={data.patient.email ?? ''}
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
							/>
						</div>

						<div class="md:col-span-2">
							<label for="alamat" class="block text-sm font-medium text-gray-700 mb-1">
								Alamat
							</label>
							<textarea
								id="alamat"
								name="alamat"
								rows="2"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
								>{data.patient.alamat ?? ''}</textarea
							>
						</div>

						<div>
							<label for="kontakDarurat" class="block text-sm font-medium text-gray-700 mb-1">
								Kontak Darurat
							</label>
							<input
								type="text"
								id="kontakDarurat"
								name="kontakDarurat"
								value={data.patient.kontakDarurat ?? ''}
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
							/>
						</div>

						<div>
							<label for="teleponDarurat" class="block text-sm font-medium text-gray-700 mb-1">
								Telepon Darurat
							</label>
							<input
								type="tel"
								id="teleponDarurat"
								name="teleponDarurat"
								value={data.patient.teleponDarurat ?? ''}
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
							/>
						</div>
					</div>

					<div class="flex gap-3 pt-4">
						<button
							type="button"
							onclick={() => (isEditing = false)}
							class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
						>
							Batal
						</button>
						<button
							type="submit"
							class="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
						>
							Simpan Perubahan
						</button>
					</div>
				</form>
			{:else}
				<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
					<h2 class="text-lg font-semibold text-gray-800 mb-4">Data Pribadi</h2>
					<dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<dt class="text-sm text-gray-500">Nama Lengkap</dt>
							<dd class="text-gray-900">{data.patient.namaLengkap}</dd>
						</div>
						<div>
							<dt class="text-sm text-gray-500">Tanggal Lahir</dt>
							<dd class="text-gray-900">
								{new Date(data.patient.tanggalLahir).toLocaleDateString('id-ID', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}
							</dd>
						</div>
						<div>
							<dt class="text-sm text-gray-500">Jenis Kelamin</dt>
							<dd class="text-gray-900">
								{data.patient.jenisKelamin === 'laki-laki' ? 'Laki-laki' : 'Perempuan'}
							</dd>
						</div>
						<div>
							<dt class="text-sm text-gray-500">No. Telepon</dt>
							<dd class="text-gray-900">{data.patient.noTelepon || '-'}</dd>
						</div>
						<div>
							<dt class="text-sm text-gray-500">Email</dt>
							<dd class="text-gray-900">{data.patient.email || '-'}</dd>
						</div>
						<div class="md:col-span-2">
							<dt class="text-sm text-gray-500">Alamat</dt>
							<dd class="text-gray-900">{data.patient.alamat || '-'}</dd>
						</div>
					</dl>
				</div>

				<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
					<h2 class="text-lg font-semibold text-gray-800 mb-4">Kontak Darurat</h2>
					<dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<dt class="text-sm text-gray-500">Nama</dt>
							<dd class="text-gray-900">{data.patient.kontakDarurat || '-'}</dd>
						</div>
						<div>
							<dt class="text-sm text-gray-500">Telepon</dt>
							<dd class="text-gray-900">{data.patient.teleponDarurat || '-'}</dd>
						</div>
					</dl>
				</div>
			{/if}

			<!-- Riwayat Kunjungan -->
			<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
				<h2 class="text-lg font-semibold text-gray-800 mb-4">Riwayat Kunjungan</h2>
				{#if data.appointments.length === 0}
					<p class="text-gray-500 text-center py-4">Belum ada riwayat kunjungan</p>
				{:else}
					<div class="space-y-3">
						{#each data.appointments as appointment}
							<div class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
								<div class="text-center min-w-[80px]">
									<p class="text-sm font-medium text-teal-600">
										{new Date(appointment.tanggalWaktu).toLocaleDateString('id-ID', {
											day: '2-digit',
											month: 'short'
										})}
									</p>
									<p class="text-xs text-gray-500">
										{new Date(appointment.tanggalWaktu).toLocaleTimeString('id-ID', {
											hour: '2-digit',
											minute: '2-digit'
										})}
									</p>
								</div>
								<div class="flex-1">
									<p class="font-medium text-gray-800">{appointment.fisioterapis.namaLengkap}</p>
									<p class="text-sm text-gray-500">{appointment.catatan || 'Tidak ada catatan'}</p>
								</div>
								<span
									class="px-2 py-1 text-xs rounded-full {appointment.status === 'selesai'
										? 'bg-green-100 text-green-700'
										: appointment.status === 'dijadwalkan'
											? 'bg-blue-100 text-blue-700'
											: 'bg-gray-100 text-gray-700'}"
								>
									{appointment.status === 'selesai'
										? 'Selesai'
										: appointment.status === 'dijadwalkan'
											? 'Dijadwalkan'
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

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Info Card -->
			<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
				<div class="text-center">
					<div
						class="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center text-3xl text-teal-700 font-bold mx-auto mb-4"
					>
						{data.patient.namaLengkap.charAt(0).toUpperCase()}
					</div>
					<h3 class="font-semibold text-gray-800">{data.patient.namaLengkap}</h3>
					<p class="text-sm text-gray-500">{data.patient.patientId}</p>
					<p class="text-sm text-gray-500 mt-2">
						{data.patient.jenisKelamin === 'laki-laki' ? '👨' : '👩'}
						{data.patient.jenisKelamin === 'laki-laki' ? 'Laki-laki' : 'Perempuan'}
					</p>
				</div>
			</div>

			<!-- Quick Stats -->
			<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
				<h3 class="font-semibold text-gray-800 mb-4">Ringkasan</h3>
				<div class="space-y-3">
					<div class="flex justify-between">
						<span class="text-gray-500">Total Kunjungan</span>
						<span class="font-medium">{data.appointments.length}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-500">Perawatan Aktif</span>
						<span class="font-medium">{data.activeTreatments}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-500">Terdaftar</span>
						<span class="font-medium">
							{data.patient.createdAt
								? new Date(data.patient.createdAt).toLocaleDateString('id-ID')
								: '-'}
						</span>
					</div>
				</div>
			</div>

			<!-- GDPR Info -->
			<div class="bg-gray-50 rounded-xl p-4 text-sm">
				<p class="text-gray-600">
					<span class="font-medium">Persetujuan Data:</span>
					{#if data.patient.persetujuanDiberikan}
						<span class="text-green-600">✓ Diberikan</span>
						{#if data.patient.tanggalPersetujuan}
							<br />
							<span class="text-gray-500">
								{new Date(data.patient.tanggalPersetujuan).toLocaleDateString('id-ID')}
							</span>
						{/if}
					{:else}
						<span class="text-red-600">✗ Belum</span>
					{/if}
				</p>
			</div>
		</div>
	</div>
</div>
