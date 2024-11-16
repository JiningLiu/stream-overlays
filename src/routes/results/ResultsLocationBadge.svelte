<svelte:options customElement="results-location-badge-component" />

<script lang="ts">
	let { alliance = 'gray', location = '', sizeDeterminingLocation = '' } = $props();

	function process(location: string): string {
		switch (location) {
			case 'NONE':
				return 'None';
			case 'OBSERVATION_ZONE':
				return 'Observation Zone';
			case 'ASCENT':
				return 'Ascent Zone';
			case 'ASCENT_1':
				return 'L1 Ascent';
			case 'ASCENT_2':
				return 'L2 Ascent';
			case 'ASCENT_3':
				return 'L3 Ascent';
		}
		return '--';
	}
</script>

<container class={alliance}>
	<h4 class="text">{process(location)}</h4>
	<h4 class="text size-determining">{process(location)}</h4>
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

	.text {
		position: absolute;
		font-size: 1.2vw;
		font-weight: 500;
	}

	.size-determining {
		position: relative;
		opacity: 0;
		padding: 0 0.6vw;
	}
</style>
