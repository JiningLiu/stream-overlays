<svelte:options customElement="info-banner-component" />

<script lang="ts">
	let { text = 'Welcome' } = $props();

	$effect(() => {
		const element = document.querySelector('#infoBanner') as HTMLHeadingElement;
		if (element) {
			element.style.setProperty('--char-count', text.length.toString());
		}
	});
</script>

<container>
	<h4 id="infoBanner">{text}</h4>
</container>
<slot />

<style lang="scss">
	container {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 36.5vw;
		height: 3.8vw;
		margin: 0;
		color: #fff;
		background-color: #111;
		border-radius: 1.6vw 1.6vw 0.8vw 0.8vw;
		box-shadow: 0 0 2vw 0.2vw rgba(0, 0, 0, 0.5);
	}

	h4 {
		max-width: 34vw;
		font-size: clamp(0.9vw, calc(34vw / var(--char-count, 16) * 2), 1.4vw);
		font-weight: 500;
		text-align: center;
	}
</style>
