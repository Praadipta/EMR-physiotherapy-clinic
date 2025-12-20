<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	let activeTab = $state<'invoices' | 'payments'>('invoices');

	function getStatusColor(status: string | null) {
		switch (status) {
			case 'draft':
				return 'bg-gray-100 text-gray-700';
			case 'belum_bayar':
				return 'bg-blue-100 text-blue-700';
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
			case 'draft':
				return 'Draft';
			case 'belum_bayar':
				return 'Belum Bayar';
			case 'lunas':
				return 'Lunas';
			case 'sebagian':
				return 'Sebagian';
			default:
				return status || 'Tidak diketahui';
		}
	}

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(amount);
	}

	function getPaymentMethodLabel(method: string | null) {
		const methods: Record<string, string> = {
			tunai: 'Tunai',
			transfer: 'Transfer Bank',
			debit: 'Kartu Debit',
			kredit: 'Kartu Kredit',
			qris: 'QRIS'
		};
		return methods[method || ''] || method || 'Tidak diketahui';
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-800">Billing & Pembayaran</h1>
			<p class="text-gray-600">Kelola invoice dan pembayaran pasien</p>
		</div>
		<a
			href="/billing/new"
			class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center gap-2"
		>
			<span class="text-lg">+</span>
			<span>Invoice Baru</span>
		</a>
	</div>

	<!-- Stats -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
			<p class="text-sm text-gray-500">Total Pendapatan (Bulan Ini)</p>
			<p class="text-2xl font-bold text-green-600">{formatCurrency(data.stats.pendapatanBulanIni)}</p>
		</div>
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
			<p class="text-sm text-gray-500">Belum Dibayar</p>
			<p class="text-2xl font-bold text-red-600">{formatCurrency(data.stats.belumDibayar)}</p>
		</div>
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
			<p class="text-sm text-gray-500">Invoice Aktif</p>
			<p class="text-2xl font-bold text-blue-600">{data.stats.invoiceAktif}</p>
		</div>
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
			<p class="text-sm text-gray-500">Invoice Lunas</p>
			<p class="text-2xl font-bold text-gray-800">{data.stats.invoiceLunas}</p>
		</div>
	</div>

	<!-- Tabs -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
		<div class="border-b border-gray-100">
			<nav class="flex">
				<button
					type="button"
					onclick={() => (activeTab = 'invoices')}
					class="px-6 py-3 text-sm font-medium border-b-2 transition-colors {activeTab === 'invoices'
						? 'border-teal-600 text-teal-600'
						: 'border-transparent text-gray-500 hover:text-gray-700'}"
				>
					Invoice ({data.invoices.length})
				</button>
				<button
					type="button"
					onclick={() => (activeTab = 'payments')}
					class="px-6 py-3 text-sm font-medium border-b-2 transition-colors {activeTab === 'payments'
						? 'border-teal-600 text-teal-600'
						: 'border-transparent text-gray-500 hover:text-gray-700'}"
				>
					Pembayaran ({data.payments.length})
				</button>
			</nav>
		</div>

		{#if activeTab === 'invoices'}
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50 border-b border-gray-100">
						<tr>
							<th class="text-left px-6 py-3 text-sm font-medium text-gray-500">No. Invoice</th>
							<th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Pasien</th>
							<th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Tanggal</th>
							<th class="text-right px-6 py-3 text-sm font-medium text-gray-500">Jumlah</th>
							<th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
							<th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Aksi</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#if data.invoices.length === 0}
							<tr>
								<td colspan="6" class="px-6 py-12 text-center text-gray-500">
									<p class="text-lg mb-2">Belum ada invoice</p>
									<a href="/billing/new" class="text-teal-600 hover:text-teal-800">
										+ Buat invoice baru
									</a>
								</td>
							</tr>
						{:else}
							{#each data.invoices as invoice}
								<tr class="hover:bg-gray-50">
									<td class="px-6 py-4">
										<p class="font-mono text-gray-800">{invoice.nomorInvoice}</p>
									</td>
									<td class="px-6 py-4">
										<p class="font-medium text-gray-800">{invoice.patient.namaLengkap}</p>
									</td>
									<td class="px-6 py-4">
										<p class="text-gray-800">
											{new Date(invoice.tanggalTerbit).toLocaleDateString('id-ID', {
												day: 'numeric',
												month: 'short',
												year: 'numeric'
											})}
										</p>
									</td>
									<td class="px-6 py-4 text-right">
										<p class="font-medium text-gray-800">{formatCurrency(invoice.jumlah)}</p>
									</td>
									<td class="px-6 py-4">
										<span
											class="px-2 py-1 rounded-full text-xs font-medium {getStatusColor(
												invoice.status
											)}"
										>
											{getStatusLabel(invoice.status)}
										</span>
									</td>
									<td class="px-6 py-4">
										<a
											href="/billing/{invoice.id}"
											class="text-teal-600 hover:text-teal-800 text-sm"
										>
											Detail →
										</a>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50 border-b border-gray-100">
						<tr>
							<th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Tanggal</th>
							<th class="text-left px-6 py-3 text-sm font-medium text-gray-500">No. Invoice</th>
							<th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Pasien</th>
							<th class="text-right px-6 py-3 text-sm font-medium text-gray-500">Jumlah</th>
							<th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Metode</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#if data.payments.length === 0}
							<tr>
								<td colspan="5" class="px-6 py-12 text-center text-gray-500">
									<p class="text-lg">Belum ada pembayaran</p>
								</td>
							</tr>
						{:else}
							{#each data.payments as payment}
								<tr class="hover:bg-gray-50">
									<td class="px-6 py-4">
										<p class="text-gray-800">
											{new Date(payment.tanggalPembayaran).toLocaleDateString('id-ID', {
												day: 'numeric',
												month: 'short',
												year: 'numeric'
											})}
										</p>
									</td>
									<td class="px-6 py-4">
										<a
											href="/billing/{payment.invoice.id}"
											class="font-mono text-teal-600 hover:text-teal-800"
										>
											{payment.invoice.nomorInvoice}
										</a>
									</td>
									<td class="px-6 py-4">
										<p class="font-medium text-gray-800">{payment.patient.namaLengkap}</p>
									</td>
									<td class="px-6 py-4 text-right">
										<p class="font-medium text-green-600">{formatCurrency(payment.jumlah)}</p>
									</td>
									<td class="px-6 py-4">
										<p class="text-gray-800">{getPaymentMethodLabel(payment.metodePembayaran)}</p>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
