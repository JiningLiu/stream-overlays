<svelte:options customElement="results-score-badge-component" />

<script lang="ts">
	let { alliance = 'gray', score = '-', otherAllianceScore = '-' } = $props();
</script>

<container class="{alliance} {+otherAllianceScore > +score ? 'loser' : ''}">
	<h4 class="score">{score}</h4>
	{#if +otherAllianceScore > +score}
		<h4 class="score size-determining">{otherAllianceScore}</h4>
	{:else}
		<h4 class="score size-determining">{score}</h4>
	{/if}
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
		border-radius: 0.6vw;
		box-shadow: 0 0 1vw 0.1vw rgba(0, 0, 0, 0.25);
	}

	.blue {
		background-color: #045892;
	}

	.gray {
		background-color: #666;
	}

	.red {
		background-color: #b6191f;
	}

	.loser {
		opacity: 0.85;
	}

	.score {
		position: absolute;
		font-size: 1.2vw;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}

	.size-determining {
		position: relative;
		opacity: 0;
		padding: 0 0.6vw;
	}
</style>
