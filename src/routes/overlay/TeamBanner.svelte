<svelte:options customElement="team-banner-component" />

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
			'h3[data-team-name="' + teamName + '"]'
		) as HTMLHeadingElement;
		if (nameElement) {
			nameElement.style.setProperty('--char-count', teamName.length.toString());
		}
	});
</script>

<container class={alliance}>
	<div class="hstack">
		{#if alliance === 'red'}
			{#if +leagueRank > 0}
				<div id="rankStack" class="vstack">
					<h3 class="rankMove {rankMove == 'UP' ? 'up' : 'dn'}">􀆇</h3>
					<h3 class="rank">{leagueRank}</h3>
					<h3 class="rankMove {rankMove == 'DOWN' ? 'down' : 'dn'}">􀆈</h3>
				</div>
			{/if}

			<h3 data-team-name={teamName} class="name">{teamName}</h3>
		{/if}
		<h3 class="number">{teamNumber}</h3>
		{#if alliance !== 'red'}
			<h3 data-team-name={teamName} class="name">{teamName}</h3>

			{#if +leagueRank > 0}
				<div id="rankStack" class="vstack">
					<h3 class="rankMove {rankMove == 'UP' ? 'up' : 'dn'}">􀆇</h3>
					<h3 class="rank">{leagueRank}</h3>
					<h3 class="rankMove {rankMove == 'DOWN' ? 'down' : 'dn'}">􀆈</h3>
				</div>
			{/if}
		{/if}
	</div>
</container>
<slot />

<style lang="scss">
	container {
		display: flex;
		align-items: center;
		width: 24vw;
		height: 3.6vw;
		margin: 0;
		color: white;
		border-radius: 0.8vw;
		box-shadow: 0 0 2vw 0.2vw rgba(0, 0, 0, 0.25);

		div {
			width: 22vw;
			height: 2.4vw;
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
		font-size: 1.4vw;
		font-weight: 500;
		width: 5vw;
	}

	.name {
		font-size: clamp(0.7vw, calc(13.5vw / var(--char-count, 16) * 3.6), 1.4vw);
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
		font-size: 1.4vw;
		font-weight: 550;
	}

	.rankMove {
		font-size: 0.8vw;
		font-weight: 600;
	}
</style>
