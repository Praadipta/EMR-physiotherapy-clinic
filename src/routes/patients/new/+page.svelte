<script lang="ts">
	import type { ActionData } from './$types';
	type FormData = {
		namaLengkap?: string;
		tanggalLahir?: string;
		jenisKelamin?: string;
		noTelepon?: string | null;
		email?: string | null;
		alamat?: string | null;
		kontakDarurat?: string | null;
		teleponDarurat?: string | null;
	};
	let { form }: { form: ActionData } = $props();
	const formData = $derived((form as { error?: string; data?: FormData } | null)?.data);
</script>

<div class="max-w-2xl mx-auto space-y-6">
	<div>
		<a href="/patients" class="text-teal-600 hover:text-teal-800 text-sm flex items-center gap-1">
			<span>←</span>
			<span>Kembali ke Daftar Pasien</span>
		</a>
		<h1 class="text-2xl font-bold text-gray-800 mt-2">Registrasi Pasien Baru</h1>
		<p class="text-gray-600">Lengkapi data pasien di bawah ini</p>
	</div>

	{#if form?.error}
		<div class="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
			{form.error}
		</div>
	{/if}

	<form method="POST" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
		<!-- Data Pribadi -->
		<div>
			<h2 class="text-lg font-semibold text-gray-800 mb-4">Data Pribadi</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="md:col-span-2">
					<label for="namaLengkap" class="block text-sm font-medium text-gray-700 mb-1">
						Nama Lengkap <span class="text-red-500">*</span>
					</label>
					<input
						type="text"
						id="namaLengkap"
						name="namaLengkap"
						required
						value={formData?.namaLengkap ?? ''}
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
						placeholder="Masukkan nama lengkap"
					/>
				</div>

				<div>
					<label for="tanggalLahir" class="block text-sm font-medium text-gray-700 mb-1">
						Tanggal Lahir <span class="text-red-500">*</span>
					</label>
					<input
						type="date"
						id="tanggalLahir"
						name="tanggalLahir"
						required
						value={formData?.tanggalLahir ?? ''}
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
					/>
				</div>

				<div>
					<label for="jenisKelamin" class="block text-sm font-medium text-gray-700 mb-1">
						Jenis Kelamin <span class="text-red-500">*</span>
					</label>
					<select
						id="jenisKelamin"
						name="jenisKelamin"
						required
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
					>
						<option value="">Pilih jenis kelamin</option>
						<option value="laki-laki" selected={formData?.jenisKelamin === 'laki-laki'}>
							Laki-laki
						</option>
						<option value="perempuan" selected={formData?.jenisKelamin === 'perempuan'}>
							Perempuan
						</option>
					</select>
				</div>
			</div>
		</div>

		<!-- Kontak -->
		<div>
			<h2 class="text-lg font-semibold text-gray-800 mb-4">Informasi Kontak</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label for="noTelepon" class="block text-sm font-medium text-gray-700 mb-1">
						No. Telepon
					</label>
					<input
						type="tel"
						id="noTelepon"
						name="noTelepon"
						value={formData?.noTelepon ?? ''}
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
						placeholder="08xxxxxxxxxx"
					/>
				</div>

				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 mb-1"> Email </label>
					<input
						type="email"
						id="email"
						name="email"
						value={formData?.email ?? ''}
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
						placeholder="email@example.com"
					/>
				</div>

				<div class="md:col-span-2">
					<label for="alamat" class="block text-sm font-medium text-gray-700 mb-1"> Alamat </label>
					<textarea
						id="alamat"
						name="alamat"
						rows="2"
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
						placeholder="Masukkan alamat lengkap">{formData?.alamat ?? ''}</textarea
					>
				</div>
			</div>
		</div>

		<!-- Kontak Darurat -->
		<div>
			<h2 class="text-lg font-semibold text-gray-800 mb-4">Kontak Darurat</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label for="kontakDarurat" class="block text-sm font-medium text-gray-700 mb-1">
						Nama Kontak Darurat
					</label>
					<input
						type="text"
						id="kontakDarurat"
						name="kontakDarurat"
						value={formData?.kontakDarurat ?? ''}
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
						placeholder="Nama kontak darurat"
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
						value={formData?.teleponDarurat ?? ''}
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
						placeholder="08xxxxxxxxxx"
					/>
				</div>
			</div>
		</div>

		<!-- Persetujuan GDPR -->
		<div class="bg-gray-50 rounded-lg p-4">
			<label class="flex items-start gap-3 cursor-pointer">
				<input
					type="checkbox"
					name="persetujuan"
					required
					class="mt-1 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
				/>
				<span class="text-sm text-gray-600">
					Saya menyetujui pengumpulan dan pemrosesan data pribadi saya untuk keperluan perawatan
					medis di Klinik Fisioterapi Sambung Nyowo. Data akan disimpan sesuai dengan peraturan
					perlindungan data yang berlaku.
					<span class="text-red-500">*</span>
				</span>
			</label>
		</div>

		<div class="flex gap-3">
			<a
				href="/patients"
				class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
			>
				Batal
			</a>
			<button
				type="submit"
				class="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
			>
				Simpan Pasien
			</button>
		</div>
	</form>
</div>
