<script lang="ts">
	interface Document {
		id: number;
		patientId: number;
		fileName: string;
		fileType: string;
		fileSize: number;
		filePath: string;
		category: string;
		title: string;
		description?: string;
		uploadedAt: string;
	}

	let {
		patientId,
		documents = $bindable<Document[]>([]),
		onUploadSuccess
	}: {
		patientId: number;
		documents?: Document[];
		onUploadSuccess?: (doc: Document) => void;
	} = $props();

	let showUploadForm = $state(false);
	let selectedCategory = $state('other');
	let title = $state('');
	let description = $state('');
	let isUploading = $state(false);
	let error = $state('');
	let selectedFile = $state<File | null>(null);
	let previewDocument = $state<Document | null>(null);

	const categoryLabels: Record<string, { label: string; icon: string; color: string }> = {
		xray: { label: 'X-Ray', icon: '🩻', color: 'bg-blue-100 text-blue-800' },
		mri: { label: 'MRI', icon: '🧲', color: 'bg-purple-100 text-purple-800' },
		ct_scan: { label: 'CT Scan', icon: '🔬', color: 'bg-indigo-100 text-indigo-800' },
		lab_result: { label: 'Hasil Lab', icon: '🧪', color: 'bg-green-100 text-green-800' },
		referral: { label: 'Rujukan', icon: '📄', color: 'bg-orange-100 text-orange-800' },
		progress_photo: { label: 'Foto Progress', icon: '📸', color: 'bg-teal-100 text-teal-800' },
		other: { label: 'Lainnya', icon: '📁', color: 'bg-gray-100 text-gray-800' }
	};

	function formatFileSize(bytes: number): string {
		if (bytes < 1024) return bytes + ' B';
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
		return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
	}

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			selectedFile = input.files[0];
			if (!title) {
				title = input.files[0].name.replace(/\.[^/.]+$/, '');
			}
		}
	}

	async function uploadDocument() {
		if (!selectedFile) {
			error = 'Pilih file terlebih dahulu';
			return;
		}

		isUploading = true;
		error = '';

		const formData = new FormData();
		formData.append('file', selectedFile);
		formData.append('patientId', patientId.toString());
		formData.append('category', selectedCategory);
		formData.append('title', title || selectedFile.name);
		formData.append('description', description);

		try {
			const response = await fetch('/api/documents', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Upload failed');
			}

			const data = await response.json();
			documents = [data.document, ...documents];
			onUploadSuccess?.(data.document);

			// Reset form
			showUploadForm = false;
			selectedFile = null;
			title = '';
			description = '';
			selectedCategory = 'other';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Upload gagal';
		} finally {
			isUploading = false;
		}
	}

	function isImage(fileType: string): boolean {
		return fileType.startsWith('image/');
	}
</script>

<div class="document-manager">
	<!-- Header -->
	<div class="flex justify-between items-center mb-4">
		<h3 class="font-semibold text-gray-800">📂 Dokumen Pasien</h3>
		<button
			onclick={() => showUploadForm = !showUploadForm}
			class="px-3 py-1 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700"
		>
			{showUploadForm ? 'Tutup' : '+ Upload Dokumen'}
		</button>
	</div>

	<!-- Upload Form -->
	{#if showUploadForm}
		<div class="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
			<h4 class="font-medium text-gray-700 mb-3">Upload Dokumen Baru</h4>
			
			{#if error}
				<div class="p-3 mb-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>
			{/if}

			<div class="space-y-3">
				<!-- File Input -->
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">File</label>
					<input
						type="file"
						accept="image/*,.pdf"
						onchange={handleFileSelect}
						class="w-full p-2 border border-gray-300 rounded-lg text-sm"
					/>
					<p class="text-xs text-gray-500 mt-1">Max 10MB. Format: JPEG, PNG, GIF, WebP, PDF</p>
				</div>

				<!-- Category -->
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
					<div class="flex flex-wrap gap-2">
						{#each Object.entries(categoryLabels) as [key, val]}
							<button
								type="button"
								onclick={() => selectedCategory = key}
								class="px-3 py-1 text-sm rounded-full transition-colors
									{selectedCategory === key ? val.color + ' ring-2 ring-offset-1 ring-gray-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
							>
								{val.icon} {val.label}
							</button>
						{/each}
					</div>
				</div>

				<!-- Title -->
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Judul</label>
					<input
						type="text"
						bind:value={title}
						placeholder="Nama dokumen..."
						class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
					/>
				</div>

				<!-- Description -->
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi (opsional)</label>
					<textarea
						bind:value={description}
						rows="2"
						placeholder="Catatan tambahan..."
						class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
					></textarea>
				</div>

				<!-- Upload Button -->
				<button
					onclick={uploadDocument}
					disabled={isUploading || !selectedFile}
					class="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isUploading ? 'Uploading...' : 'Upload Dokumen'}
				</button>
			</div>
		</div>
	{/if}

	<!-- Documents Grid -->
	{#if documents.length === 0}
		<div class="text-center py-8 text-gray-500">
			<span class="text-4xl">📂</span>
			<p class="mt-2">Belum ada dokumen yang diupload</p>
		</div>
	{:else}
		<div class="grid grid-cols-2 md:grid-cols-3 gap-3">
			{#each documents as doc}
				<button
					onclick={() => previewDocument = doc}
					class="text-left p-3 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
				>
					<!-- Thumbnail -->
					<div class="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
						{#if isImage(doc.fileType)}
							<img src={doc.filePath} alt={doc.title} class="w-full h-full object-cover" />
						{:else}
							<span class="text-4xl">{categoryLabels[doc.category]?.icon || '📄'}</span>
						{/if}
					</div>
					
					<!-- Info -->
					<div class="overflow-hidden">
						<p class="font-medium text-gray-800 text-sm truncate">{doc.title}</p>
						<div class="flex items-center gap-2 mt-1">
							<span class="px-2 py-0.5 text-xs rounded-full {categoryLabels[doc.category]?.color || 'bg-gray-100 text-gray-800'}">
								{categoryLabels[doc.category]?.label || 'Lainnya'}
							</span>
						</div>
						<p class="text-xs text-gray-500 mt-1">
							{formatFileSize(doc.fileSize)} • {new Date(doc.uploadedAt).toLocaleDateString('id-ID')}
						</p>
					</div>
				</button>
			{/each}
		</div>
	{/if}

	<!-- Document Preview Modal -->
	{#if previewDocument}
		<div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
			<div class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
				<!-- Header -->
				<div class="flex justify-between items-center p-4 border-b">
					<div>
						<h3 class="font-semibold text-gray-800">{previewDocument.title}</h3>
						<p class="text-sm text-gray-500">
							{categoryLabels[previewDocument.category]?.label} • {formatFileSize(previewDocument.fileSize)}
						</p>
					</div>
					<button
						onclick={() => previewDocument = null}
						class="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
					>
						✕
					</button>
				</div>
				
				<!-- Content -->
				<div class="p-4 overflow-auto max-h-[70vh]">
					{#if isImage(previewDocument.fileType)}
						<img src={previewDocument.filePath} alt={previewDocument.title} class="max-w-full mx-auto" />
					{:else if previewDocument.fileType === 'application/pdf'}
						<iframe
							src={previewDocument.filePath}
							class="w-full h-[60vh]"
							title={previewDocument.title}
						></iframe>
					{:else}
						<div class="text-center py-8 text-gray-500">
							<span class="text-6xl">{categoryLabels[previewDocument.category]?.icon || '📄'}</span>
							<p class="mt-4">Preview tidak tersedia</p>
							<a
								href={previewDocument.filePath}
								download
								class="mt-4 inline-block px-4 py-2 bg-teal-600 text-white rounded-lg"
							>
								Download File
							</a>
						</div>
					{/if}
				</div>

				{#if previewDocument.description}
					<div class="p-4 border-t bg-gray-50">
						<p class="text-sm text-gray-600">{previewDocument.description}</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
