<svelte:options customElement="results-score-section-title-component" />

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
		height: 2.6vw;
		margin: 0;
		color: black;
		background-color: white;
		border-radius: 0.6vw;
		box-shadow: 0 0 1vw 0.1vw rgba(0, 0, 0, 0.25);
	}

	.text {
		font-size: 1.4vw;
		font-weight: 550;
		transform: scaleX(1.2);
		display: inline-block;
		padding: 0 1.2vw;
	}
</style>
