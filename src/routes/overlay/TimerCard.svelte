<svelte:options customElement="timer-card-component" />

<script lang="ts">
	let { timer = '0', mode = 'Standby' } = $props();

	function minutes(timer: number): string {
		return Math.floor((Math.ceil(+timer) / 60)).toString();
	}

	function seconds(timer: number): string {
		return (Math.ceil(+timer) % 60).toString().padStart(2, '0');
	}
</script>

<container>
	<div class="vstack vcenter hcenter">
		<h2>
			{`${minutes(+timer)}:${seconds(+timer)}`}
		</h2>
		<h5>{mode}</h5>
	</div>
</container>
<slot />

<style lang="scss">
	container {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 11vw;
		height: 6.5vw;
		margin: 0;
		color: #000;
		background-color: #eee;
		border-radius: 0.8vw;
		box-shadow: 0 0 2vw 0.2vw rgba(0, 0, 0, 0.5);
	}

	div {
		text-align: center;
		margin: 0 1.5vw;
		margin-top: -0.4vw;
	}

	h2 {
		max-width: 8vw;
		font-size: 3.5vw;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	h5 {
		max-width: 8vw;
		margin-top: -0.2vw;
		font-size: 1.1vw;
		font-weight: 500;
		display: inline-block;
	}
</style>
