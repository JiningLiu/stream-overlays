<svelte:options customElement="info-banner-component" />

<script lang="ts">
	let { text = 'Welcome' } = $props();

	$effect(() => {
		if (text.includes('Upcoming Match ')) return;

		const element = document.querySelector('overlay #infoBanner') as HTMLHeadingElement;
		if (element) {
			element.style.setProperty('--size-modifier', String(Math.sqrt(text.length) * 2.5));
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
		font-size: clamp(0.8vw, calc(22.4vw / var(--size-modifier, 16)), 1.4vw);
		font-weight: 500;
		text-align: center;
	}
</style>
