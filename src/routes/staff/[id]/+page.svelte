<script lang="ts">
	import type { PageData, ActionData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();

	function getRoleLabel(role: string) {
		return role === 'admin' ? 'Admin' : 'Fisioterapis';
	}
</script>

<div class="max-w-2xl mx-auto space-y-6">
	<div>
		<a href="/staff" class="text-teal-600 hover:text-teal-800 text-sm flex items-center gap-1">
			<span>←</span>
			<span>Kembali ke Manajemen Staf</span>
		</a>
		<h1 class="text-2xl font-bold text-gray-800 mt-2">Edit Staf</h1>
		<p class="text-gray-600">Ubah data untuk @{data.staff.username}</p>
	</div>

	{#if form?.success}
		<div class="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
			{form.message}
		</div>
	{/if}

	{#if form?.error}
		<div class="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
			{form.error}
		</div>
	{/if}

	<!-- Profile Card -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
		<div class="flex items-center gap-4">
			<div
				class="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold {data
					.staff.role === 'admin'
					? 'bg-purple-500'
					: 'bg-blue-500'}"
			>
				{data.staff.namaLengkap.charAt(0).toUpperCase()}
			</div>
			<div>
				<h2 class="text-xl font-semibold text-gray-800">{data.staff.namaLengkap}</h2>
				<p class="text-gray-500">@{data.staff.username}</p>
				<span
					class="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium {data.staff.role ===
					'admin'
						? 'bg-purple-100 text-purple-700'
						: 'bg-blue-100 text-blue-700'}"
				>
					{getRoleLabel(data.staff.role)}
				</span>
				{#if data.isCurrentUser}
					<span class="ml-2 text-xs text-gray-400">(Akun Anda)</span>
				{/if}
			</div>
		</div>
	</div>

	<!-- Edit Form -->
	<form method="POST" action="?/update" class="space-y-6">
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
			<h2 class="text-lg font-semibold text-gray-800">Informasi Dasar</h2>

			<div>
				<label for="username" class="block text-sm font-medium text-gray-700 mb-1"> Username </label>
				<input
					type="text"
					id="username"
					value={data.staff.username}
					disabled
					class="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
				/>
				<p class="text-xs text-gray-500 mt-1">Username tidak dapat diubah</p>
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
					value={data.staff.email}
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				/>
			</div>

			<div>
				<label for="role" class="block text-sm font-medium text-gray-700 mb-1">
					Role <span class="text-red-500">*</span>
				</label>
				<select
					id="role"
					name="role"
					required
					disabled={data.isCurrentUser}
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none {data.isCurrentUser
						? 'bg-gray-50 text-gray-500'
						: ''}"
				>
					<option value="fisioterapis" selected={data.staff.role === 'fisioterapis'}>
						Fisioterapis
					</option>
					<option value="admin" selected={data.staff.role === 'admin'}>Admin</option>
				</select>
				{#if data.isCurrentUser}
					<input type="hidden" name="role" value={data.staff.role} />
					<p class="text-xs text-gray-500 mt-1">Anda tidak dapat mengubah role sendiri</p>
				{/if}
			</div>

			<div>
				<label for="namaLengkap" class="block text-sm font-medium text-gray-700 mb-1">
					Nama Lengkap <span class="text-red-500">*</span>
				</label>
				<input
					type="text"
					id="namaLengkap"
					name="namaLengkap"
					required
					value={data.staff.namaLengkap}
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
					value={data.staff.noTelepon ?? ''}
					placeholder="08xxxxxxxxxx"
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				/>
			</div>

			<button
				type="submit"
				class="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
			>
				Simpan Perubahan
			</button>
		</div>
	</form>

	<!-- Change Password -->
	<form method="POST" action="?/changePassword" class="space-y-4">
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
			<h2 class="text-lg font-semibold text-gray-800">Ubah Password</h2>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">
						Password Baru <span class="text-red-500">*</span>
					</label>
					<input
						type="password"
						id="newPassword"
						name="newPassword"
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
						placeholder="Ulangi password baru"
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
					/>
				</div>
			</div>

			<button
				type="submit"
				class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
			>
				Ubah Password
			</button>
		</div>
	</form>

	<!-- Metadata -->
	<div class="bg-gray-50 rounded-xl p-4 text-sm text-gray-500">
		<div class="flex flex-wrap gap-x-6 gap-y-2">
			<span>
				Dibuat: {data.staff.createdAt
					? new Date(data.staff.createdAt).toLocaleString('id-ID')
					: '-'}
			</span>
			<span>
				Status: <span class={data.staff.isActive ? 'text-green-600' : 'text-red-600'}>
					{data.staff.isActive ? 'Aktif' : 'Nonaktif'}
				</span>
			</span>
		</div>
	</div>
</div>
