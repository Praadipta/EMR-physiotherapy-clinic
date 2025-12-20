<script lang="ts">
	let { form } = $props<{
		form?: {
			error?: string;
			username?: string;
			email?: string;
			role?: string;
			namaLengkap?: string;
			noTelepon?: string;
		};
	}>();
</script>

<div class="max-w-2xl mx-auto space-y-6">
	<div>
		<a href="/staff" class="text-teal-600 hover:text-teal-800 text-sm flex items-center gap-1">
			<span>←</span>
			<span>Kembali ke Manajemen Staf</span>
		</a>
		<h1 class="text-2xl font-bold text-gray-800 mt-2">Tambah Staf Baru</h1>
		<p class="text-gray-600">Buat akun baru untuk admin atau fisioterapis</p>
	</div>

	{#if form?.error}
		<div class="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
			{form.error}
		</div>
	{/if}

	<form method="POST" class="space-y-6">
		<!-- Account Info -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
			<h2 class="text-lg font-semibold text-gray-800">Informasi Akun</h2>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label for="username" class="block text-sm font-medium text-gray-700 mb-1">
						Username <span class="text-red-500">*</span>
					</label>
					<input
						type="text"
						id="username"
						name="username"
						required
						minlength="3"
						pattern="[a-zA-Z0-9_]+"
						value={form?.username ?? ''}
						placeholder="contoh: terapis3"
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
					/>
					<p class="text-xs text-gray-500 mt-1">Huruf, angka, dan underscore. Minimal 3 karakter.</p>
				</div>

				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
						Email <span class="text-red-500">*</span>
					</label>
					<input
						type="email"
						id="email"
						name="email"
						required
						value={form?.email ?? ''}
						placeholder="contoh: staf@sambungnyowo.com"
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
					/>
				</div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label for="password" class="block text-sm font-medium text-gray-700 mb-1">
						Password <span class="text-red-500">*</span>
					</label>
					<input
						type="password"
						id="password"
						name="password"
						required
						minlength="6"
						placeholder="Minimal 6 karakter"
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
					/>
				</div>

				<div>
					<label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
						Konfirmasi Password <span class="text-red-500">*</span>
					</label>
					<input
						type="password"
						id="confirmPassword"
						name="confirmPassword"
						required
						minlength="6"
						placeholder="Ulangi password"
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
					/>
				</div>
			</div>

			<div>
				<label for="role" class="block text-sm font-medium text-gray-700 mb-1">
					Role <span class="text-red-500">*</span>
				</label>
				<select
					id="role"
					name="role"
					required
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				>
					<option value="">Pilih role</option>
<option value="fisioterapis" selected={form?.role === 'fisioterapis'}>
							Fisioterapis
						</option>
						<option value="admin" selected={form?.role === 'admin'}>Admin</option>
				</select>
				<p class="text-xs text-gray-500 mt-1">
					Admin: Manajemen staf, billing, laporan. Fisioterapis: Klinis, perawatan pasien.
				</p>
			</div>
		</div>

		<!-- Personal Info -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
			<h2 class="text-lg font-semibold text-gray-800">Informasi Pribadi</h2>

			<div>
				<label for="namaLengkap" class="block text-sm font-medium text-gray-700 mb-1">
					Nama Lengkap <span class="text-red-500">*</span>
				</label>
				<input
					type="text"
					id="namaLengkap"
					name="namaLengkap"
					required
					value={form?.namaLengkap ?? ''}
					placeholder="Nama lengkap staf"
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				/>
			</div>

			<div>
				<label for="noTelepon" class="block text-sm font-medium text-gray-700 mb-1">
					No. Telepon
				</label>
				<input
					type="tel"
					id="noTelepon"
					name="noTelepon"
					value={form?.noTelepon ?? ''}
					placeholder="08xxxxxxxxxx"
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				/>
			</div>
		</div>

		<div class="flex gap-3">
			<a
				href="/staff"
				class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
			>
				Batal
			</a>
			<button
				type="submit"
				class="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
			>
				Simpan
			</button>
		</div>
	</form>
</div>
