<svelte:options customElement="results-team-banner-component" />

<script lang="ts">
	let {
		alliance = 'gray',
		teamNumber = '-----',
		teamName = 'Unknown Team',
		rank = '-',
		leagueRank = '-',
		rankMove = 'NONE'
	} = $props();

	$effect(() => {
		const nameElement = document.querySelector(
			'h3.results[data-team-name="' + teamName + '"]'
		) as HTMLHeadingElement;
		if (nameElement) {
			nameElement.style.setProperty('--char-count', teamName.length.toString());
		}
	});
</script>

<container class={alliance}>
	<div class="hstack">
		{#if alliance === 'red'}
			<div id="rankStack" class="vstack">
				<h3 class="rankMove {rankMove == "UP" ? 'up' : 'dn'} results">􀆇</h3>
				<h3 class="rank results">{rank}</h3>
				<h3 class="rankMove {rankMove == "DOWN" ? 'down' : 'dn'} results">􀆈</h3>
			</div>
			<h3 data-team-name={teamName} class="name results">{teamName}</h3>
		{/if}
		<h3 class="number results">{teamNumber}</h3>
		{#if alliance !== 'red'}
			<h3 data-team-name={teamName} class="name">{teamName}</h3>
			<div id="rankStack" class="vstack">
				<h3 class="rankMove {rankMove == "UP" ? 'up' : 'dn'} results">􀆇</h3>
				<h3 class="rank results">{rank}</h3>
				<h3 class="rankMove {rankMove == "DOWN" ? 'down' : 'dn'} results">􀆈</h3>
			</div>
		{/if}
	</div>
</container>
<slot />

<style lang="scss">
	container {
		display: flex;
		align-items: center;
		width: 24vw;
		height: 3vw;
		margin: 0;
		color: #fff;
		border-radius: 0.8vw;
		box-shadow: 0 0 2vw 0.2vw rgba(0, 0, 0, 0.5);

		div {
			width: 22vw;
			height: 1.8vw;
			align-items: center;
			margin: 0.6vw 1vw;
			width: 100%;
		}
	}

	.blue {
		background-color: #104366;

		.number {
			margin-right: 0.5vw;
		}

		.name {
			text-align: right;
		}

		#rankStack {
			margin: 0 0.2vw 0 0.8vw;
		}
	}

	.red {
		background-color: #7d1519;

		.number {
			margin-left: 0.5vw;
			text-align: right;
		}

		#rankStack {
			margin: 0 0.8vw 0 0.2vw;
		}
	}

	.gray {
		background-color: #666;

		.number {
			margin-right: 0.5vw;
		}

		#rankStack {
			margin: 0 0.2vw 0 0.8vw;
		}
	}

	.number {
		font-size: 1.2vw;
		font-weight: 500;
		width: 5vw;
	}

	.name {
		font-size: clamp(0.6vw, calc(13.5vw / var(--char-count, 16) * 3.4), 1.2vw);
		font-weight: 300;
		width: 100%;
	}

	#rankStack {
		justify-content: center;
		width: fit-content;
	}

	.rank,
	.rankMove {
		line-height: 1;
	}

	.rank {
		font-size: 1.2vw;
		font-weight: 550;
	}

	.rankMove {
		font-size: 0.6vw;
		font-weight: 600;
	}
</style>
