<svelte:options customElement="results-info-banner-component" />

<script lang="ts">
	let { text = 'Welcome' } = $props();

	$effect(() => {
		const element = document.querySelector('h4.results') as HTMLHeadingElement;
		if (element) {
			element.style.setProperty('--char-count', text.length.toString());
		}
	});
</script>

<container>
	<h4 class="results">{text} • Final Results</h4>
</container>
<slot />

<style lang="scss">
	container {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 42.5vw;
		height: 3.2vw;
		margin: 0;
		color: #fff;
		background-color: #111;
		border-radius: 1.2vw;
		box-shadow: 0 0 2vw 0.2vw rgba(0, 0, 0, 0.5);
	}

	h4 {
		max-width: 40vw;
		font-size: clamp(0.6vw, calc(40vw / var(--char-count, 16) * 2), 1.2vw);
		font-weight: 500;
		text-align: center;
	}
</style>
