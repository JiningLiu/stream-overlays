<script lang="ts">
	import { onMount } from 'svelte';

	let camHost = 'rpi.local';
	let camPort = '8889';
	let camPath = 'cam';

	let overlayHost = 'localhost';
	let overlayPort = '5173';
	let overlaySocketHost = 'localhost';
	let overlayEventCode = 'ustxcgm4';

	let overlayInfoBannerText = 'GEMS Emerald League Meet 2';
	let overlayBlueSampleNetX = '';
	let overlayBlueSampleNetY = '';
	let overlayBlueSampleLowX = '';
	let overlayBlueSampleLowY = '';
	let overlayBlueSampleHighX = '';
	let overlayBlueSampleHighY = '';
	let overlayBlueSpecimenLowX = '';
	let overlayBlueSpecimenLowY = '';
	let overlayBlueSpecimenHighX = '';
	let overlayBlueSpecimenHighY = '';
	let overlayRedSampleNetX = '';
	let overlayRedSampleNetY = '';
	let overlayRedSampleLowX = '';
	let overlayRedSampleLowY = '';
	let overlayRedSampleHighX = '';
	let overlayRedSampleHighY = '';
	let overlayRedSpecimenLowX = '';
	let overlayRedSpecimenLowY = '';
	let overlayRedSpecimenHighX = '';
	let overlayRedSpecimenHighY = '';

	let camUrl = '';
	let overlayUrl = '';

	let overlayUrlImport = '';

	onMount(() => {
		overlayHost = location.hostname;
		overlayPort = location.port;

		updateCam();
		updateOverlay();

		document.querySelectorAll('input.cam').forEach((input) => {
			input.addEventListener('keydown', (event) => {
				const keyboardEvent = event as KeyboardEvent;
				if (keyboardEvent.key === 'Enter') {
					updateCam();
				}
			});
		});

		document.querySelectorAll('input.overlay').forEach((input) => {
			input.addEventListener('keydown', (event) => {
				const keyboardEvent = event as KeyboardEvent;
				if (keyboardEvent.key === 'Enter') {
					updateOverlay();
				}
			});
		});

	// 	const overlayImport = document.getElementById('overlayImport');
	// 	if (overlayImport) {
	// 		overlayImport.addEventListener('keydown', (event) => {
	// 			const keyboardEvent = event as KeyboardEvent;
	// 			if (keyboardEvent.key === 'Enter') {
	// 				overlayUrl = overlayUrlImport;
	// 				// add params parsing
	// 			}
	// 		});
	// 	}
	});

	function updateCam() {
		camUrl = `http://${encodeURIComponent(camHost)}:${encodeURIComponent(camPort)}/${encodeURIComponent(
			camPath
		)}`;
		const camFrame = document.getElementById('cam') as HTMLIFrameElement;
		if (camFrame) {
			camFrame.src = camUrl;
		}
	}

	function updateOverlay() {
		overlayUrl = `http://${encodeURIComponent(overlayHost)}${
			encodeURIComponent(overlayPort) ? ':' : ''
		}${encodeURIComponent(overlayPort)}/?socketUrl=ws%3A%2F%2F${encodeURIComponent(
			overlaySocketHost
		)}%2Fstream%2Fdisplay%2Fcommand%2F%3Fcode%3D${encodeURIComponent(
			overlayEventCode
		)}&infoBannerText=${encodeURIComponent(
			overlayInfoBannerText
		)}&blueSampleNetX=${encodeURIComponent(
			overlayBlueSampleNetX
		)}&blueSampleNetY=${encodeURIComponent(
			overlayBlueSampleNetY
		)}&blueSampleLowX=${encodeURIComponent(
			overlayBlueSampleLowX
		)}&blueSampleLowY=${encodeURIComponent(
			overlayBlueSampleLowY
		)}&blueSampleHighX=${encodeURIComponent(
			overlayBlueSampleHighX
		)}&blueSampleHighY=${encodeURIComponent(
			overlayBlueSampleHighY
		)}&blueSpecimenLowX=${encodeURIComponent(
			overlayBlueSpecimenLowX
		)}&blueSpecimenLowY=${encodeURIComponent(
			overlayBlueSpecimenLowY
		)}&blueSpecimenHighX=${encodeURIComponent(
			overlayBlueSpecimenHighX
		)}&blueSpecimenHighY=${encodeURIComponent(
			overlayBlueSpecimenHighY
		)}&redSampleNetX=${encodeURIComponent(overlayRedSampleNetX)}&redSampleNetY=${encodeURIComponent(
			overlayRedSampleNetY
		)}&redSampleLowX=${encodeURIComponent(overlayRedSampleLowX)}&redSampleLowY=${encodeURIComponent(
			overlayRedSampleLowY
		)}&redSampleHighX=${encodeURIComponent(
			overlayRedSampleHighX
		)}&redSampleHighY=${encodeURIComponent(
			overlayRedSampleHighY
		)}&redSpecimenLowX=${encodeURIComponent(
			overlayRedSpecimenLowX
		)}&redSpecimenLowY=${encodeURIComponent(
			overlayRedSpecimenLowY
		)}&redSpecimenHighX=${encodeURIComponent(
			overlayRedSpecimenHighX
		)}&redSpecimenHighY=${encodeURIComponent(overlayRedSpecimenHighY)}`;
		const overlayFrame = document.getElementById('overlay') as HTMLIFrameElement;
		if (overlayFrame) {
			overlayFrame.src = overlayUrl;
		}
	}

	function copyCamUrl() {
		navigator.clipboard.writeText(camUrl);
	}

	function copyOverlayUrl() {
		navigator.clipboard.writeText(overlayUrl);
	}
</script>

<div class="vstack hcenter s1 mv1">
	<p class="mh1">
		Press <b>Enter</b> on any text field to reload or apply changes for respective iframe.
	</p>

	<div class="vstack mh1">
		<h2>Camera</h2>

		<div class="hstack s1">
			<div class="vstack">
				<p>Host</p>
				<input class="cam" type="text" bind:value={camHost} placeholder="rpi.local" />
			</div>

			<div class="vstack">
				<p>Port</p>
				<input class="cam" type="text" bind:value={camPort} placeholder="8889" />
			</div>

			<div class="vstack">
				<p>Path</p>
				<input class="cam" type="text" bind:value={camPath} placeholder="cam" />
			</div>
		</div>
	</div>

	<div class="vstack mh1">
		<h2>Overlay</h2>

		<div class="hstack s1">
			<div class="vstack">
				<p>Host</p>
				<input class="overlay" type="text" bind:value={overlayHost} placeholder="localhost" />
			</div>

			<div class="vstack">
				<p>Port</p>
				<input class="overlay" type="text" bind:value={overlayPort} placeholder="5173" />
			</div>

			<div class="vstack">
				<p>FTCLive Host</p>
				<input class="overlay" type="text" bind:value={overlaySocketHost} placeholder="localhost" />
			</div>

			<div class="vstack">
				<p>Event Code</p>
				<input class="overlay" type="text" bind:value={overlayEventCode} placeholder="ustxcgm4" />
			</div>

			<div class="vstack">
				<p>Info Banner Title</p>
				<input
					class="overlay"
					type="text"
					bind:value={overlayInfoBannerText}
					placeholder="GEMS Emerald League Meet 2"
				/>
			</div>
		</div>
	</div>

	<div class="zstack">
		<iframe src={camUrl} id="cam" title="cam" frameborder="0"></iframe>
		<iframe src={overlayUrl} id="overlay" title="overlay" frameborder="0"></iframe>
	</div>

	<div class="vstack mh1">
		<h2>Blue Scoring Elements</h2>

		<div class="hstack s1">
			<div class="vstack">
				<p>Blue Net Zone Samples X</p>
				<input class="overlay" type="text" bind:value={overlayBlueSampleNetX} />
				<p>Blue Net Zone Samples Y</p>
				<input class="overlay" type="text" bind:value={overlayBlueSampleNetY} />
			</div>

			<div class="vstack">
				<p>Blue Low Basket Samples X</p>
				<input class="overlay" type="text" bind:value={overlayBlueSampleLowX} />
				<p>Blue Low Basket Samples Y</p>
				<input class="overlay" type="text" bind:value={overlayBlueSampleLowY} />
			</div>

			<div class="vstack">
				<p>Blue High Basket Samples X</p>
				<input class="overlay" type="text" bind:value={overlayBlueSampleHighX} />
				<p>Blue High Basket Samples Y</p>
				<input class="overlay" type="text" bind:value={overlayBlueSampleHighY} />
			</div>

			<div class="vstack">
				<p>Blue Low Chamber Specimen X</p>
				<input class="overlay" type="text" bind:value={overlayBlueSpecimenLowX} />
				<p>Blue Low Chamber Specimen Y</p>
				<input class="overlay" type="text" bind:value={overlayBlueSpecimenLowY} />
			</div>

			<div class="vstack">
				<p>Blue High Chamber Specimen X</p>
				<input class="overlay" type="text" bind:value={overlayBlueSpecimenHighX} />
				<p>Blue High Chamber Specimen Y</p>
				<input class="overlay" type="text" bind:value={overlayBlueSpecimenHighY} />
			</div>
		</div>
	</div>

	<div class="vstack mh1">
		<h2>Red Scoring Elements</h2>

		<div class="hstack s1">
			<div class="vstack">
				<p>Red Net Zone Samples X</p>
				<input class="overlay" type="text" bind:value={overlayRedSampleNetX} />
				<p>Red Net Zone Samples Y</p>
				<input class="overlay" type="text" bind:value={overlayRedSampleNetY} />
			</div>

			<div class="vstack">
				<p>Red Low Basket Samples X</p>
				<input class="overlay" type="text" bind:value={overlayRedSampleLowX} />
				<p>Red Low Basket Samples Y</p>
				<input class="overlay" type="text" bind:value={overlayRedSampleLowY} />
			</div>

			<div class="vstack">
				<p>Red High Basket Samples X</p>
				<input class="overlay" type="text" bind:value={overlayRedSampleHighX} />
				<p>Red High Basket Samples Y</p>
				<input class="overlay" type="text" bind:value={overlayRedSampleHighY} />
			</div>

			<div class="vstack">
				<p>Red Low Chamber Specimen X</p>
				<input class="overlay" type="text" bind:value={overlayRedSpecimenLowX} />
				<p>Red Low Chamber Specimen Y</p>
				<input class="overlay" type="text" bind:value={overlayRedSpecimenLowY} />
			</div>

			<div class="vstack">
				<p>Red High Chamber Specimen X</p>
				<input class="overlay" type="text" bind:value={overlayRedSpecimenHighX} />
				<p>Red High Chamber Specimen Y</p>
				<input class="overlay" type="text" bind:value={overlayRedSpecimenHighY} />
			</div>
		</div>
	</div>

	<div class="vstack mh1">
		<h2>Generated URLs</h2>

		<div class="hstack s1">
			<div class="vstack">
				<p>Camera</p>
				<input type="text" bind:value={camUrl} readonly />
			</div>
			<button on:click={copyCamUrl}>Copy Camera URL</button>

			<div class="vstack">
				<p>Overlay</p>
				<input type="text" bind:value={overlayUrl} readonly />
			</div>
			<button on:click={copyOverlayUrl}>Copy Overlay URL</button>
		</div>
	</div>

	<!-- <div class="vstack mh1">
		<h2>Import</h2>
		<div class="vstack">
			<p>Full Overlay URL</p>
			<input type="text" id="overlayImport" bind:value={overlayUrlImport} placeholder="http://" />
		</div>
	</div> -->
</div>

<style lang="scss">
	@media (max-aspect-ratio: 16 / 9) {
		iframe {
			width: 100vw;
			height: calc(100vw / 16 * 9);
		}
	}

	@media (min-aspect-ratio: 16 / 9) {
		iframe {
			width: calc(100vh / 9 * 16);
			height: 100vh;
		}
	}

	#overlay {
		position: absolute;
	}

	input {
		font: 120%;
		border: 0.15em solid #000;
		border-radius: 0.4em;
	}

	.mh1 {
		margin: 0 1em;
	}

	.mv1 {
		margin: 1em 0;
	}

	.s1 {
		gap: 1em;
	}
</style>
