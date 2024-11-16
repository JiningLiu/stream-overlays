<svelte:options customElement="results-total-score-card-component" />

<script lang="ts">
	let { alliance = 'gray', score = '---', won = true } = $props();
</script>

<container class="{alliance} {won ? '' : 'loser'}">
	<h1>{score}</h1>
</container>
<slot />

<style lang="scss">
	container {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 10vw;
		height: 5.5vw;
		margin: 0;
		color: white;
		box-shadow: 0 0 2vw 0.2vw rgba(0, 0, 0, 0.25);
	}

	.blue {
		background-color: #045892;
		border-radius: 1.6vw 0.8vw 0.8vw 1.6vw;
	}

	.red {
		background-color: #b6191f;
		border-radius: 0.8vw 1.6vw 1.6vw 0.8vw;
	}

	.loser {
		opacity: 0.85;
	}

	h1 {
		max-width: 8vw;
		margin: 0.5vw 1vw;
		font-size: 3.4vw;
		font-weight: 550;
		font-variant-numeric: tabular-nums;
		transform: scaleX(1.2);
		letter-spacing: -0.1vw;
		display: inline-block;
	}
</style>
