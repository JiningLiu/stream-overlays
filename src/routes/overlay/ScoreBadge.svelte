<svelte:options customElement="score-badge-component" />

<script lang="ts">
	let { alliance = 'gray', order = '0', type = '0', pos = '0', score = '-' } = $props();
</script>

<container class={alliance}>
	<div class="hstack order{order}">
		{#if order === '0'}
			{#if type == '0'}
				<div class="zstack">
					<h4 class="lgIcon">􀩺</h4>
					{#if pos == '0'}
						<h6 class="smIcon">􀆇</h6>
					{:else if pos == '1'}
						<h6 class="smIcon">􀆈</h6>
					{/if}
				</div>
			{:else if type == '1'}
				<div id="dashStack" class="vstack">
					{#if pos == '0'}
						<h4 class="dashIcon">—</h4>
						<h4 class="dashIconTransluscent">—</h4>
					{:else if pos == '1'}
						<h4 class="dashIconTransluscent">—</h4>
						<h4 class="dashIcon">—</h4>
					{/if}
				</div>
			{:else if type == '2'}
				<div class="zstack">
					<h4 class="lgIcon">􁹫</h4>
				</div>
			{/if}
		{/if}
		<h4 class="score">{score}</h4>
		{#if order !== '0'}
			{#if type == '0'}
				<div class="zstack">
					<h4 class="lgIcon">􀩺</h4>
					{#if pos == '0'}
						<h6 class="smIcon">􀆇</h6>
					{:else if pos == '1'}
						<h6 class="smIcon">􀆈</h6>
					{/if}
				</div>
			{:else if type == '1'}
				<div id="dashStack" class="vstack">
					{#if pos == '0'}
						<h4 class="dashIcon">—</h4>
						<h4 class="dashIconTransluscent">—</h4>
					{:else if pos == '1'}
						<h4 class="dashIconTransluscent">—</h4>
						<h4 class="dashIcon">—</h4>
					{/if}
				</div>
			{:else if type == '2'}
				<div class="zstack">
					<h4 class="lgIcon">􁹫</h4>
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
		height: 2vw;
		margin: 0;
		color: white;
		border-radius: 0.6vw;
		box-shadow: 0 0 1vw 0.1vw rgba(0, 0, 0, 0.25);

		div {
			height: 1.6vw;
			align-items: center;
			width: 100%;
		}
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

	.order0 {
		margin: 0.3vw 0.6vw 0.3vw 0.45vw;

		.score {
			margin-left: 0.25vw;
		}
	}

	.order1 {
		margin: 0.3vw 0.45vw 0.3vw 0.6vw;

		.score {
			margin-right: 0.25vw;
		}
	}

	.score {
		font-size: 1.2vw;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}

	.lgIcon {
		position: relative;
		z-index: 1;
		font-size: 1.2vw;
		font-weight: 400;
	}

	.smIcon {
		width: 100%;
		text-align: center;
		position: absolute;
		z-index: 2;
		font-size: 0.6vw;
		font-weight: 500;
	}

	#dashStack {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		margin: 0.3vw 0.15vw 0.3vw 0.2vw;
	}

	.dashIcon,
	.dashIconTransluscent {
		font-size: 1vw;
		font-weight: 500;
		line-height: 0.5vw;
	}

	.dashIconTransluscent {
		opacity: 50%;
	}
</style>
