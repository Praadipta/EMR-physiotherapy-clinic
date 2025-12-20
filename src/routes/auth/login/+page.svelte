<script lang="ts">
	import type { ActionData } from './$types';
	let { form }: { form: ActionData } = $props();
</script>

<div class="min-h-screen bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center p-4">
	<div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
		<div class="text-center mb-8">
			<div class="text-5xl mb-4">🏥</div>
			<h1 class="text-2xl font-bold text-gray-800">Sambung Nyowo</h1>
			<p class="text-gray-500">Klinik Fisioterapi</p>
		</div>

		{#if form?.error}
			<div class="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
				{form.error}
			</div>
		{/if}

		<form method="POST" class="space-y-4">
			<div>
				<label for="username" class="block text-sm font-medium text-gray-700 mb-1">
					Username
				</label>
				<input
					type="text"
					id="username"
					name="username"
					required
					value={form?.username ?? ''}
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
					placeholder="Masukkan username"
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-gray-700 mb-1">
					Password
				</label>
				<input
					type="password"
					id="password"
					name="password"
					required
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
					placeholder="Masukkan password"
				/>
			</div>

			<button
				type="submit"
				class="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
			>
				Masuk
			</button>
		</form>

		<div class="mt-6 text-center text-sm text-gray-500">
			<p>Demo Login:</p>
			<p class="mt-1">Admin: <strong>admin</strong> / <strong>admin123</strong></p>
			<p>Fisioterapis: <strong>terapis1</strong> / <strong>terapis123</strong></p>
		</div>
	</div>
</div>
