<svelte:options customElement="total-score-card-component" />

<script lang="ts">
	let { alliance = 'gray', score = '---' } = $props();
</script>

<container class={alliance}>
	<h1>{score}</h1>
</container>
<slot />

<style lang="scss">
	container {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 12vw;
		height: 6.5vw;
		margin: 0;
		color: #fff;
		box-shadow: 0 0 2vw 0.2vw rgba(0, 0, 0, 0.5);
	}

	.blue {
		background-color: #045892;
		border-radius: 0.8vw 0.8vw 0.8vw 1.6vw;
	}

	.red {
		background-color: #b6191f;
		border-radius: 0.8vw 0.8vw 1.6vw 0.8vw;
	}

	h1 {
		max-width: 10vw;
		margin: 0.5vw 1vw;
		font-size: 4.8vw;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		display: inline-block;
	}
</style>
