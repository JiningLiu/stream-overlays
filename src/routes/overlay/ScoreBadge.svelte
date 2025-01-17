<svelte:options customElement="score-badge-component" />

<script lang="ts">
	let { alliance = 'gray', order = '0', type = '0', pos = '0', score = '0' } = $props();
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
				{#if pos == '0'}
					<h4 class="lgIcon">􀤀</h4>
				{:else if pos == '1'}
					<h4 class="lgIcon flipped">􀤀</h4>
				{/if}
			{:else if type == '2'}
				<h4 class="lgIcon {pos == '1' ? 'flipped' : ''}">􁹫</h4>
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
				{#if pos == '0'}
					<h4 class="lgIcon">􀤀</h4>
				{:else if pos == '1'}
					<h4 class="lgIcon flipped">􀤀</h4>
				{/if}
			{:else if type == '2'}
				<h4 class="lgIcon {pos == '1' ? 'flipped' : ''}">􁹫</h4>
			{/if}
		{/if}
	</div>
</container>
<slot />

<style lang="scss">
	container {
		display: flex;
		align-items: center;
		height: 2.4vw;
		margin: 0;
		color: #fff;
		border-radius: 0.6vw;
		box-shadow: 0 0 1vw 0.1vw rgba(0, 0, 0, 0.5);

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
		margin: 0.3vw 0.55vw 0.3vw 0.5vw;

		.score {
			margin-left: 0.25vw;
		}
	}

	.order1 {
		margin: 0.3vw 0.5vw 0.3vw 0.55vw;

		.score {
			margin-right: 0.25vw;
		}
	}

	.score {
		margin-top: 0.05vw;
		font-size: 1.6vw;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.lgIcon {
		margin-top: 0.05vw;
		position: relative;
		z-index: 1;
		font-size: 1.6vw;
		font-weight: 400;
	}

	.smIcon {
		width: 100%;
		margin-top: 0.05vw;
		text-align: center;
		position: absolute;
		z-index: 2;
		font-size: 0.8vw;
		font-weight: 600;
	}

	.flipped {
		transform: rotate(180deg);
	}
</style>
