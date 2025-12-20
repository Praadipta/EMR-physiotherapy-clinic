<script lang="ts">
	import type { PageData, ActionData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();

	function getStatusColor(status: string | null) {
		switch (status) {
			case 'belum_bayar':
				return 'bg-red-100 text-red-700';
			case 'lunas':
				return 'bg-green-100 text-green-700';
			case 'sebagian':
				return 'bg-yellow-100 text-yellow-700';
			default:
				return 'bg-gray-100 text-gray-700';
		}
	}

	function getStatusLabel(status: string | null) {
		switch (status) {
			case 'belum_bayar':
				return 'Belum Bayar';
			case 'lunas':
				return 'Lunas';
			case 'sebagian':
				return 'Sebagian';
			default:
				return status || '-';
		}
	}

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(amount);
	}

	function getPaymentMethodLabel(method: string) {
		const methods: Record<string, string> = {
			tunai: 'Tunai',
			transfer: 'Transfer Bank',
			debit: 'Kartu Debit',
			kredit: 'Kartu Kredit',
			qris: 'QRIS'
		};
		return methods[method] || method;
	}
</script>

<div class="max-w-3xl mx-auto space-y-6">
	<div class="flex items-start justify-between">
		<div>
			<a href="/billing" class="text-teal-600 hover:text-teal-800 text-sm flex items-center gap-1">
				<span>←</span>
				<span>Kembali ke Billing</span>
			</a>
			<h1 class="text-2xl font-bold text-gray-800 mt-2">Invoice {data.invoice.nomorInvoice}</h1>
		</div>
		<span class="px-3 py-1 rounded-full text-sm font-medium {getStatusColor(data.invoice.status)}">
			{getStatusLabel(data.invoice.status)}
		</span>
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

	<!-- Info Invoice -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div>
				<h3 class="text-sm font-medium text-gray-500 mb-2">Ditagihkan Kepada</h3>
				<p class="text-lg font-semibold text-gray-800">{data.invoice.patient.namaLengkap}</p>
				<p class="text-gray-600">{data.invoice.patient.patientId}</p>
				<a
					href="/patients/{data.invoice.patient.id}"
					class="text-teal-600 hover:text-teal-800 text-sm"
				>
					Lihat profil →
				</a>
			</div>
			<div class="space-y-2">
				<div class="flex justify-between">
					<span class="text-gray-500">Tanggal Terbit</span>
					<span class="text-gray-800">
						{data.invoice.tanggalTerbit ? new Date(data.invoice.tanggalTerbit).toLocaleDateString('id-ID', {
							day: 'numeric',
							month: 'long',
							year: 'numeric'
						}) : '-'}
					</span>
				</div>
				<div class="flex justify-between">
					<span class="text-gray-500">Jatuh Tempo</span>
					<span class="text-gray-800">
						{data.invoice.tanggalJatuhTempo ? new Date(data.invoice.tanggalJatuhTempo).toLocaleDateString('id-ID', {
							day: 'numeric',
							month: 'long',
							year: 'numeric'
						}) : '-'}
					</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Deskripsi & Total -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
		<div class="border-b border-gray-100 bg-gray-50 px-6 py-3">
			<h3 class="text-lg font-semibold text-gray-800">Detail Tagihan</h3>
		</div>
		<div class="p-6 space-y-4">
			{#if data.invoice.deskripsi}
				<div>
					<p class="text-sm font-medium text-gray-500 mb-1">Deskripsi</p>
					<p class="text-gray-800">{data.invoice.deskripsi}</p>
				</div>
			{/if}
			<div class="border-t border-gray-200 pt-4 space-y-2">
				<div class="flex justify-between text-lg">
					<span class="font-medium text-gray-700">Total Tagihan</span>
					<span class="font-bold text-gray-800">{formatCurrency(data.invoice.jumlah)}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-gray-600">Terbayar</span>
					<span class="font-medium text-green-600">{formatCurrency(data.totalPaid)}</span>
				</div>
				<div class="flex justify-between text-lg border-t border-gray-200 pt-2">
					<span class="font-medium text-gray-700">Sisa Tagihan</span>
					<span class="font-bold {data.sisa > 0 ? 'text-red-600' : 'text-green-600'}">
						{formatCurrency(data.sisa)}
					</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Payment History -->
	{#if data.payments.length > 0}
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
			<div class="border-b border-gray-100 bg-gray-50 px-6 py-3">
				<h3 class="text-lg font-semibold text-gray-800">Riwayat Pembayaran</h3>
			</div>
			<div class="divide-y divide-gray-100">
				{#each data.payments as payment}
					<div class="px-6 py-4 flex items-center justify-between">
						<div>
							<p class="font-medium text-gray-800">
								{payment.tanggalPembayaran ? new Date(payment.tanggalPembayaran).toLocaleDateString('id-ID', {
									day: 'numeric',
									month: 'long',
									year: 'numeric'
								}) : '-'}
							</p>
							<p class="text-sm text-gray-500">
							{getPaymentMethodLabel(payment.metodePembayaran ?? 'tunai')}
								{#if payment.catatan}
									- {payment.catatan}
								{/if}
							</p>
						</div>
						<p class="text-lg font-semibold text-green-600">{formatCurrency(payment.jumlah)}</p>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Actions (only show payment form if not fully paid) -->
	{#if data.invoice.status !== 'lunas' && data.sisa > 0}
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<h3 class="text-lg font-semibold text-gray-800 mb-4">Catat Pembayaran</h3>
			<form method="POST" action="?/payment" class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="jumlah" class="block text-sm font-medium text-gray-700 mb-1">
							Jumlah (Rp) <span class="text-red-500">*</span>
						</label>
						<input
							type="number"
							id="jumlah"
							name="jumlah"
							required
							min="1"
							max={data.sisa}
							value={data.sisa}
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
						/>
					</div>
					<div>
						<label for="metodePembayaran" class="block text-sm font-medium text-gray-700 mb-1">
							Metode Pembayaran <span class="text-red-500">*</span>
						</label>
						<select
							id="metodePembayaran"
							name="metodePembayaran"
							required
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
						>
							<option value="tunai">Tunai</option>
							<option value="transfer">Transfer Bank</option>
							<option value="debit">Kartu Debit</option>
							<option value="kredit">Kartu Kredit</option>
							<option value="qris">QRIS</option>
						</select>
					</div>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="tanggalPembayaran" class="block text-sm font-medium text-gray-700 mb-1">
							Tanggal Bayar <span class="text-red-500">*</span>
						</label>
						<input
							type="date"
							id="tanggalPembayaran"
							name="tanggalPembayaran"
							required
							value={new Date().toISOString().split('T')[0]}
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
						/>
					</div>
					<div>
						<label for="catatan" class="block text-sm font-medium text-gray-700 mb-1">
							Catatan
						</label>
						<input
							type="text"
							id="catatan"
							name="catatan"
							placeholder="No. transaksi, bukti transfer, dll"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
						/>
					</div>
				</div>
				<button
					type="submit"
					class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
				>
					Catat Pembayaran
				</button>
			</form>
		</div>
	{/if}

	<!-- Metadata -->
	<div class="bg-gray-50 rounded-xl p-4 text-sm text-gray-500">
		<div class="flex flex-wrap gap-x-6 gap-y-2">
			<span>
				Dibuat: {data.invoice.createdAt ? new Date(data.invoice.createdAt).toLocaleString('id-ID') : '-'}
			</span>
			{#if data.invoice.updatedAt && data.invoice.updatedAt !== data.invoice.createdAt}
				<span>
					Diperbarui: {new Date(data.invoice.updatedAt).toLocaleString('id-ID')}
				</span>
			{/if}
		</div>
	</div>
</div>
