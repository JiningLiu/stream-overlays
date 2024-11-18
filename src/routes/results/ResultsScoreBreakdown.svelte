<svelte:options customElement="results-score-breakdown-component" />

<script lang="ts">
	let {
		blueAuto = '--',
		blueAutoSampleNet = '--',
		blueAutoSampleLow = '--',
		blueAutoSampleHigh = '--',
		blueAutoSpecimenLow = '--',
		blueAutoSpecimenHigh = '--',
		blue1AutoLocation = '--',
		blue2AutoLocation = '--',
		blueTeleop = '--',
		blueTeleopSampleNet = '--',
		blueTeleopSampleLow = '--',
		blueTeleopSampleHigh = '--',
		blueTeleopSpecimenLow = '--',
		blueTeleopSpecimenHigh = '--',
		blue1TeleopLocation = '--',
		blue2TeleopLocation = '--',
		blueFoulsReceived = '--',
		redAuto = '--',
		redAutoSampleNet = '--',
		redAutoSampleLow = '--',
		redAutoSampleHigh = '--',
		redAutoSpecimenLow = '--',
		redAutoSpecimenHigh = '--',
		red1AutoLocation = '--',
		red2AutoLocation = '--',
		redTeleop = '--',
		redTeleopSampleNet = '--',
		redTeleopSampleLow = '--',
		redTeleopSampleHigh = '--',
		redTeleopSpecimenLow = '--',
		redTeleopSpecimenHigh = '--',
		red1TeleopLocation = '--',
		red2TeleopLocation = '--',
		redFoulsReceived = '--',
		hideDetails = false
	} = $props();

	function process(location: string): string {
		switch (location) {
			case 'NONE':
				return 'None';
			case 'OBSERVATION_ZONE':
				return 'Observation Zone';
			case 'ASCENT':
				return 'Ascent Zone';
			case 'ASCENT_1':
				return 'Low Rung Touch';
			case 'ASCENT_2':
				return 'Low Rung Ascent';
			case 'ASCENT_3':
				return 'High Rung Ascent';
		}
		return '--';
	}

	function longestAutoLocation(): string {
		const locations = [blue1AutoLocation, blue2AutoLocation, red1AutoLocation, red2AutoLocation];
		return findLongestLocation(locations);
	}

	function longestTeleopLocation(): string {
		const locations = [
			blue1TeleopLocation,
			blue2TeleopLocation,
			red1TeleopLocation,
			red2TeleopLocation
		];
		return findLongestLocation(locations);
	}

	function findLongestLocation(locations: string[]): string {
		let longest = '';
		for (let loc of locations) {
			const location = process(loc);
			if (location.length > longest.length) {
				longest = location;
			}
		}
		return longest;
	}
</script>

<container>
	<div class="vstack padding">
		<div class="section">
			<div class="hstack vcenter">
				<h2 class="big-score blue">{blueAuto}</h2>
				<div class="w-100"><h2 class="big-label">Auto</h2></div>
				<h2 class="big-score red">{redAuto}</h2>
			</div>
		</div>

		<div class="result-details vstack padding {hideDetails ? 'vscale0' : 0}">
			<div class="hstack">
				<div class="hstack score-zone blue hcenter">
					<h3 class="score">{blueAutoSampleNet}</h3>
				</div>
				<h3 class="w-100">Net Zone Samples</h3>
				<div class="hstack score-zone red hcenter">
					<h3 class="score">{redAutoSampleNet}</h3>
				</div>
			</div>

			<div class="hstack">
				<div class="hstack score-zone blue hcenter">
					<h3 class="score">{blueAutoSampleLow}</h3>
				</div>
				<h3 class="w-100">Low Basket Samples</h3>
				<div class="hstack score-zone red hcenter">
					<h3 class="score">{redAutoSampleLow}</h3>
				</div>
			</div>

			<div class="hstack">
				<div class="hstack score-zone blue hcenter">
					<h3 class="score">{blueAutoSampleHigh}</h3>
				</div>
				<h3 class="w-100">High Basket Samples</h3>
				<div class="hstack score-zone red hcenter">
					<h3 class="score">{redAutoSampleHigh}</h3>
				</div>
			</div>

			<div class="hstack">
				<div class="hstack score-zone blue hcenter">
					<h3 class="score">{blueAutoSpecimenLow}</h3>
				</div>
				<h3 class="w-100">Low Chamber Specimens</h3>
				<div class="hstack score-zone red hcenter">
					<h3 class="score">{redAutoSpecimenLow}</h3>
				</div>
			</div>

			<div class="hstack">
				<div class="hstack score-zone blue hcenter">
					<h3 class="score">{blueAutoSpecimenHigh}</h3>
				</div>
				<h3 class="w-100">High Chamber Specimens</h3>
				<div class="hstack score-zone red hcenter">
					<h3 class="score">{redAutoSpecimenHigh}</h3>
				</div>
			</div>

			<div class="hstack padding">
				<div class="location-group hstack padding">
					<div class="hstack location-zone blue hcenter">
						<h3 class="score">{process(blue1AutoLocation)}</h3>
					</div>
					<div class="hstack location-zone blue hcenter">
						<h3 class="score">{process(blue2AutoLocation)}</h3>
					</div>
				</div>
				<h3 class="location-label">Location</h3>
				<div class="location-group hstack padding align-right">
					<div class="hstack location-zone red hcenter">
						<h3 class="score">{process(red1AutoLocation)}</h3>
					</div>
					<div class="hstack location-zone red hcenter">
						<h3 class="score">{process(red2AutoLocation)}</h3>
					</div>
				</div>
			</div>

			<separator></separator>
		</div>

		<div class="section">
			<div class="hstack vcenter">
				<h2 class="big-score blue">{blueTeleop}</h2>
				<div class="w-100"><h2 class="big-label">TeleOp</h2></div>
				<h2 class="big-score red">{redTeleop}</h2>
			</div>
		</div>

		<div class="result-details vstack padding {hideDetails ? 'vscale0' : 0}">
			<div class="hstack">
				<div class="hstack score-zone blue hcenter">
					<h3 class="score">{blueTeleopSampleNet}</h3>
				</div>
				<h3 class="w-100">Net Zone Samples</h3>
				<div class="hstack score-zone red hcenter">
					<h3 class="score">{redTeleopSampleNet}</h3>
				</div>
			</div>

			<div class="hstack">
				<div class="hstack score-zone blue hcenter">
					<h3 class="score">{blueTeleopSampleLow}</h3>
				</div>
				<h3 class="w-100">Low Basket Samples</h3>
				<div class="hstack score-zone red hcenter">
					<h3 class="score">{redTeleopSampleLow}</h3>
				</div>
			</div>

			<div class="hstack">
				<div class="hstack score-zone blue hcenter">
					<h3 class="score">{blueTeleopSampleHigh}</h3>
				</div>
				<h3 class="w-100">High Basket Samples</h3>
				<div class="hstack score-zone red hcenter">
					<h3 class="score">{redTeleopSampleHigh}</h3>
				</div>
			</div>

			<div class="hstack">
				<div class="hstack score-zone blue hcenter">
					<h3 class="score">{blueTeleopSpecimenLow}</h3>
				</div>
				<h3 class="w-100">Low Chamber Specimens</h3>
				<div class="hstack score-zone red hcenter">
					<h3 class="score">{redTeleopSpecimenLow}</h3>
				</div>
			</div>

			<div class="hstack">
				<div class="hstack score-zone blue hcenter">
					<h3 class="score">{blueTeleopSpecimenHigh}</h3>
				</div>
				<h3 class="w-100">High Chamber Specimens</h3>
				<div class="hstack score-zone red hcenter">
					<h3 class="score">{redTeleopSpecimenHigh}</h3>
				</div>
			</div>

			<div class="hstack padding">
				<div class="location-group hstack padding">
					<div class="hstack location-zone blue hcenter">
						<h3 class="score">{process(blue1TeleopLocation)}</h3>
					</div>
					<div class="hstack location-zone blue hcenter">
						<h3 class="score">{process(blue2TeleopLocation)}</h3>
					</div>
				</div>
				<h3 class="location-label">Location</h3>
				<div class="location-group hstack padding align-right">
					<div class="hstack location-zone red hcenter">
						<h3 class="score">{process(red1TeleopLocation)}</h3>
					</div>
					<div class="hstack location-zone red hcenter">
						<h3 class="score">{process(red2TeleopLocation)}</h3>
					</div>
				</div>
			</div>
		</div>

		<separator class={hideDetails ? 'mt08' : 0}></separator>

		<div class="hstack hcenter fouls">
			<h3 class="blue-fouls">{+blueFoulsReceived > 0 ? '+' : ''}{blueFoulsReceived}</h3>
			<h3>Fouls</h3>
			<h3 class="red-fouls">{+redFoulsReceived > 0 ? '+' : ''}{redFoulsReceived}</h3>
		</div>
	</div>
	</container
>
<slot />

<style lang="scss">
	container {
		display: flex;
		align-items: center;
		width: 46vw;
		margin: 0;
		padding: 0.4vw;
		color: #fff;
		background-color: #111;
		border-radius: 1.2vw;
		box-shadow: 0 0 2vw 0.2vw rgba(0, 0, 0, 0.5);
	}

	.section {
		background-color: #eee;
		padding: 0.4vw;
		border-radius: 0.8vw;
	}

	.big-score,
	.score-zone,
	.location-zone {
		border-radius: 0.4vw;
	}

	h2 {
		font-size: 1.2vw;
		font-weight: 500;
		text-align: center;
		padding: 0.3vw 0.6vw;
	}

	.big-label {
		font-size: 1.4vw;
		font-weight: 800;
		padding: 0;
		color: black;
	}

	.big-score,
	.score-zone {
		width: 4vw;
	}

	.location-label {
		width: 6.2vw;
	}

	.location-group {
		width: 19vw;
	}

	.align-right {
		justify-content: flex-end;
	}

	.blue {
		background-color: #045892;
	}

	.red {
		background-color: #b6191f;
	}

	h3 {
		font-size: 1vw;
		font-weight: 500;
		text-align: center;
		margin: 0.2vw 0.5vw;
	}

	.score {
		white-space: nowrap;
	}

	.fouls {
		width: 45.6vw;
		margin-top: -0.2vw;
	}

	.blue-fouls {
		color: #045892;
	}

	.red-fouls {
		color: #b6191f;
	}

	.padding {
		gap: 0.4vw;
	}

	separator {
		margin: 0.2vw;
		padding: 0;
		height: 0.08vw;
		background-color: #222;
	}

	.result-details.vscale0 {
		margin: -6.4vw 0;
		opacity: 0;
	}

	.mt08 {
		margin-top: 0.8vw;
	}
</style>
