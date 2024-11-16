<svelte:options customElement="results-score-element-text-component" />

<script lang="ts">
	let { text = '--' } = $props();
</script>

<container>
	<h4 class="text">{text}</h4>
</container>
<slot />

<style lang="scss">
	container {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 2.4vw;
		margin: 0;
		color: white;
		background-color: #222;
		border-radius: 0.6vw;
		box-shadow: 0 0 1vw 0.1vw rgba(0, 0, 0, 0.25);
	}

	.text {
		font-size: 1.2vw;
		font-weight: 400;
		padding: 0 0.8vw;
	}
</style>
