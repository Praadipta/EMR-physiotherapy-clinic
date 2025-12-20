<script lang="ts">
	import type { PageData, ActionData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();

	function getRoleLabel(role: string) {
		return role === 'admin' ? 'Admin' : 'Fisioterapis';
	}

	function getRoleColor(role: string) {
		return role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700';
	}

	function getStatusColor(isActive: boolean | null) {
		return isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold text-gray-800">Manajemen Staf</h1>
			<p class="text-gray-600">Kelola akun admin dan fisioterapis</p>
		</div>
		<a
			href="/staff/new"
			class="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
		>
			<span class="text-lg">+</span>
			<span>Tambah Staf</span>
		</a>
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

	<!-- Staff Stats -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
					<span class="text-xl">👤</span>
				</div>
				<div>
					<p class="text-2xl font-bold text-gray-800">
						{data.staff.filter((s) => s.role === 'admin').length}
					</p>
					<p class="text-sm text-gray-500">Admin</p>
				</div>
			</div>
		</div>
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
					<span class="text-xl">👨‍⚕️</span>
				</div>
				<div>
					<p class="text-2xl font-bold text-gray-800">
						{data.staff.filter((s) => s.role === 'fisioterapis').length}
					</p>
					<p class="text-sm text-gray-500">Fisioterapis</p>
				</div>
			</div>
		</div>
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
					<span class="text-xl">✓</span>
				</div>
				<div>
					<p class="text-2xl font-bold text-gray-800">
						{data.staff.filter((s) => s.isActive).length}
					</p>
					<p class="text-sm text-gray-500">Aktif</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Staff List -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="bg-gray-50 border-b border-gray-100">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Staf
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Role
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Kontak
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Status
						</th>
						<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
							Aksi
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#each data.staff as staff}
						<tr class="hover:bg-gray-50 {!staff.isActive ? 'opacity-60' : ''}">
							<td class="px-6 py-4">
								<div class="flex items-center gap-3">
									<div
										class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold {staff.role ===
										'admin'
											? 'bg-purple-500'
											: 'bg-blue-500'}"
									>
										{staff.namaLengkap.charAt(0).toUpperCase()}
									</div>
									<div>
										<p class="font-medium text-gray-800">{staff.namaLengkap}</p>
										<p class="text-sm text-gray-500">@{staff.username}</p>
									</div>
								</div>
							</td>
							<td class="px-6 py-4">
								<span class="px-2 py-1 rounded-full text-xs font-medium {getRoleColor(staff.role)}">
									{getRoleLabel(staff.role)}
								</span>
							</td>
							<td class="px-6 py-4">
								<p class="text-sm text-gray-800">{staff.email}</p>
								{#if staff.noTelepon}
									<p class="text-sm text-gray-500">{staff.noTelepon}</p>
								{/if}
							</td>
							<td class="px-6 py-4">
								<span
									class="px-2 py-1 rounded-full text-xs font-medium {getStatusColor(staff.isActive)}"
								>
									{staff.isActive ? 'Aktif' : 'Nonaktif'}
								</span>
							</td>
							<td class="px-6 py-4">
								<div class="flex items-center justify-end gap-2">
									<a
										href="/staff/{staff.id}"
										class="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
										title="Edit"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
											/>
										</svg>
									</a>

									{#if staff.id !== data.currentUserId}
										<form method="POST" action="?/toggleStatus" class="inline">
											<input type="hidden" name="userId" value={staff.id} />
											<button
												type="submit"
												class="p-2 rounded-lg transition-colors {staff.isActive
													? 'text-yellow-600 hover:bg-yellow-50'
													: 'text-green-600 hover:bg-green-50'}"
												title={staff.isActive ? 'Nonaktifkan' : 'Aktifkan'}
											>
												{#if staff.isActive}
													<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
														/>
													</svg>
												{:else}
													<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
														/>
													</svg>
												{/if}
											</button>
										</form>

										<form
											method="POST"
											action="?/delete"
											class="inline"
											onsubmit={(e) => {
												if (
													!confirm(
														`Yakin ingin menghapus staf "${staff.namaLengkap}"? Tindakan ini tidak dapat dibatalkan.`
													)
												) {
													e.preventDefault();
												}
											}}
										>
											<input type="hidden" name="userId" value={staff.id} />
											<button
												type="submit"
												class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
												title="Hapus"
											>
												<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													/>
												</svg>
											</button>
										</form>
									{:else}
										<span class="text-xs text-gray-400 px-2">(Anda)</span>
									{/if}
								</div>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="5" class="px-6 py-12 text-center text-gray-500">
								Belum ada data staf
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
