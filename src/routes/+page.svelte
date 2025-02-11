<script lang="ts">
	import ScoreBadge from './overlay/ScoreBadge.svelte';
	import InfoBanner from './overlay/InfoBanner.svelte';
	import TotalScoreCard from './overlay/TotalScoreCard.svelte';
	import TimerCard from './overlay/TimerCard.svelte';
	import TeamBanner from './overlay/TeamBanner.svelte';

	import ResultsInfoBanner from './results/ResultsInfoBanner.svelte';
	import ResultsTeamBanner from './results/ResultsTeamBanner.svelte';
	import ResultsTotalScoreCard from './results/ResultsTotalScoreCard.svelte';
	import ResultsScoreBreakdown from './results/ResultsScoreBreakdown.svelte';

	import { onMount } from 'svelte';

	//FSM
	const processingTypes = [
		'START_MATCH',
		'ABORT_MATCH',
		'SHOW_PREVIEW',
		'SHOW_MATCH',
		'SCORE_UPDATE',
		'SHOW_RESULTS'
	];

	enum State {
		PRE_START,
		AWAIT_MATCH,
		BEGIN_MATCH,
		IN_MATCH,
		AWAIT_RESULTS,
		RESULTS_SHOWN
	}
	function parseState(n: number) {
		switch (n) {
			case 0:
				return 'PRE_START';
			case 1:
				return 'AWAIT_MATCH';
			case 2:
				return 'BEGIN_MATCH';
			case 3:
				return 'IN_MATCH';
			case 4:
				return 'AWAIT_RESULTS';
			case 5:
				return 'RESULTS_SHOWN';
		}
	}

	enum ResultsState {
		NO_RESULTS,
		AWAIT_FULL,
		AWAIT_MINI,
		FULL_RESULTS,
		MINI_RESULTS
	}

	let current = 1;

	let state: State = State.PRE_START;
	let resultsState: ResultsState = ResultsState.NO_RESULTS;

	let matchTimeout: number | undefined;
	let resultsTimeout: number | undefined;

	let times = {
		tsStart: 0,
		localStart: 0
	};

	let started = false;
	let chaosArray: MessageEvent[] = [];

	//things idk
	type GameUpdate = {
		type?: string;
		params?: Params;
		field?: number;
		init?: boolean; // Corresponds to initStatus in Swift
		ts?: number; // Corresponds to msEpoch in Swift
	};

	type Params = {
		liveScoringComplete?: boolean;
		someLocked?: boolean;
		redScores?: TeamScores;
		blueScores?: TeamScores;
		hrReview?: boolean;
		number?: number;
		series?: number;
		displayNumber?: number;
		matchName?: string;
		field?: number;
		elims?: boolean;
		red?: TeamDetails;
		blue?: TeamDetails;
		singleTeam?: boolean;
	};

	type TeamScores = {
		robot1Auto?: string;
		robot2Auto?: string;
		autoSampleNet?: number;
		autoSampleLow?: number;
		autoSampleHigh?: number;
		autoSpecimenLow?: number;
		autoSpecimenHigh?: number;
		teleopSampleNet?: number;
		teleopSampleLow?: number;
		teleopSampleHigh?: number;
		teleopSpecimenLow?: number;
		teleopSpecimenHigh?: number;
		robot1Teleop?: string;
		robot2Teleop?: string;
		minorFouls?: number;
		majorFouls?: number;
		autoSamplePoints?: number;
		autoSpecimenPoints?: number;
		autoParkPoints?: number;
		autoAscentPoints?: number;
		teleopSamplePoints?: number;
		teleopSpecimenPoints?: number;
		teleopParkPoints?: number;
		teleopAscentPoints?: number;
		autoPoints?: number;
		teleopPoints?: number;
		foulPointsCommitted?: number;
		preFoulTotal?: number;
		clazz?: string;
		adjust?: number;
	};

	type TeamDetails = {
		teams?: Team[];
		wins?: number;
		wonSeries?: boolean;
	};

	type Team = {
		number?: string;
		name?: string;
		card?: number;
		ranking?: number;
		leagueRanking?: number;
		rankMove?: string;
	};

	class CountdownTimer {
		private startTime: number = 0;
		private remainingTime: number = 0;
		private timerStates: number[] = [30, 8, 120]; // 30 seconds, 8 seconds, and 2 minutes (120 seconds)
		private currentStateIndex: number = 0;
		private timerRunning: boolean = false;

		// Start the timer
		start(): void {
			if (this.timerRunning) return; // Prevent starting the timer if it's already running

			this.timerRunning = true;
			this.remainingTime = this.timerStates[this.currentStateIndex];
			this.startTime = performance.now();
			switch (this.currentStateIndex) {
				case 0:
					mode = 'Auto';
					beforeTeleop = true;
					break;
				case 1:
					mode = 'Wait';
					beforeTeleop = true;
					break;
				case 2:
					mode = 'TeleOp';
					beforeTeleop = false;
			}
			this.tick();
		}

		// Abort the timer
		abort(): void {
			this.timerRunning = false;
		}

		// Internal function that calculates time based on performance.now() and remaining time
		private tick(): void {
			if (!this.timerRunning) return;

			const now = performance.now();
			const elapsedTime = (now - this.startTime) / 1000; // time in seconds
			const timeLeft = this.remainingTime - elapsedTime;

			time = Math.max(timeLeft, 0);

			if (timeLeft <= 0) {
				this.advanceState();
			} else {
				requestAnimationFrame(() => this.tick()); // Continue ticking at next frame for smooth updates
			}
		}

		// Move to the next state and restart the countdown with the new value
		private advanceState(): void {
			if (this.currentStateIndex < this.timerStates.length - 1) {
				this.currentStateIndex++;
				this.remainingTime = this.timerStates[this.currentStateIndex];
			} else {
				this.timerRunning = false;
				mode = 'Review';
				beforeTeleop = false;
				return;
			}
			this.timerRunning = false;
			this.start();
		}

		// Reset the timer to its initial state
		reset(): void {
			this.abort(); // Abort any running timer
			this.currentStateIndex = 0; // Start from the first timer state (30 seconds)
		}
	}

	let data: GameUpdate | undefined;
	let resultsData: GameUpdate | undefined;

	let time = 0;
	let mode = 'Standby';
	let beforeTeleop = true;

	let infoBannerText = '';

	let showFullResults = false;
	let showMiniResults = false;
	let awaitMini = false;

	const timer = new CountdownTimer();

	let socket: WebSocket;
	onMount(() => {
		const params = new URLSearchParams(location.search);

		const suppliedInfoBannerText = params.get('infoBannerText');
		if (suppliedInfoBannerText) {
			infoBannerText = suppliedInfoBannerText + ' • ';
		}

		const blueSampleNet = document.getElementById('blueSampleNet');
		if (blueSampleNet) {
			blueSampleNet.style.setProperty('--x', params.get('blueSampleNetX'));
			blueSampleNet.style.setProperty('--y', params.get('blueSampleNetY'));
		}

		const blueSampleLow = document.getElementById('blueSampleLow');
		if (blueSampleLow) {
			blueSampleLow.style.setProperty('--x', params.get('blueSampleLowX'));
			blueSampleLow.style.setProperty('--y', params.get('blueSampleLowY'));
		}

		const blueSampleHigh = document.getElementById('blueSampleHigh');
		if (blueSampleHigh) {
			blueSampleHigh.style.setProperty('--x', params.get('blueSampleHighX'));
			blueSampleHigh.style.setProperty('--y', params.get('blueSampleHighY'));
		}

		const blueSpecimenLow = document.getElementById('blueSpecimenLow');
		if (blueSpecimenLow) {
			blueSpecimenLow.style.setProperty('--x', params.get('blueSpecimenLowX'));
			blueSpecimenLow.style.setProperty('--y', params.get('blueSpecimenLowY'));
		}

		const blueSpecimenHigh = document.getElementById('blueSpecimenHigh');
		if (blueSpecimenHigh) {
			blueSpecimenHigh.style.setProperty('--x', params.get('blueSpecimenHighX'));
			blueSpecimenHigh.style.setProperty('--y', params.get('blueSpecimenHighY'));
		}

		const redSampleNet = document.getElementById('redSampleNet');
		if (redSampleNet) {
			redSampleNet.style.setProperty('--x', params.get('redSampleNetX'));
			redSampleNet.style.setProperty('--y', params.get('redSampleNetY'));
		}

		const redSampleLow = document.getElementById('redSampleLow');
		if (redSampleLow) {
			redSampleLow.style.setProperty('--x', params.get('redSampleLowX'));
			redSampleLow.style.setProperty('--y', params.get('redSampleLowY'));
		}

		const redSampleHigh = document.getElementById('redSampleHigh');
		if (redSampleHigh) {
			redSampleHigh.style.setProperty('--x', params.get('redSampleHighX'));
			redSampleHigh.style.setProperty('--y', params.get('redSampleHighY'));
		}

		const redSpecimenLow = document.getElementById('redSpecimenLow');
		if (redSpecimenLow) {
			redSpecimenLow.style.setProperty('--x', params.get('redSpecimenLowX'));
			redSpecimenLow.style.setProperty('--y', params.get('redSpecimenLowY'));
		}

		const redSpecimenHigh = document.getElementById('redSpecimenHigh');
		if (redSpecimenHigh) {
			redSpecimenHigh.style.setProperty('--x', params.get('redSpecimenHighX'));
			redSpecimenHigh.style.setProperty('--y', params.get('redSpecimenHighY'));
		}

		const socketUrl = params.get('socketUrl');
		if (socketUrl) {
			socket = new WebSocket(socketUrl);

			socket.onopen = () => {
				console.log('FTCLive display WebSocket connected.');
			};

			socket.onmessage = (event) => {
				fieldUpdate(event);
				/*
				const parsed = JSON.parse(event.data);
				if (processingTypes.includes(parsed.type)) {
					if (parsed.type === 'SHOW_RESULTS') {
						resultsData = JSON.parse(event.data); 
						timer.abort(); done
						time = 30;
						mode = 'Standby';
						beforeTeleop = false;
						showResults = true;

						if (data?.type === 'SHOW_PREVIEW' || data?.type === 'SHOW_MATCH') {
							data.type = '';
						}
						return;
					}

					data = JSON.parse(event.data);

					if (data?.type === 'START_MATCH') {
						timer.reset();
						timer.start();
						resultsData = undefined;
					} else if (data?.type === 'ABORT_MATCH') {
						timer.abort();
						mode = 'Aborted';
					} else if (data?.type === 'SHOW_PREVIEW') {
						timer.abort();
						time = 30;
						mode = 'Standby';
						beforeTeleop = false;
						return;
					} else if (data?.type == 'SHOW_MATCH') {
						timer.abort();
						time = 30;
						mode = 'Standby';
						beforeTeleop = true;
					}
					showResults = false;
				}*/
			};

			socket.onclose = () => {
				console.log('FTCLive display WebSocket closed.');
			};
		} else {
			location.href = './generate';
		}
	});

	let endGame = () => {
		timer.reset();
		// console.log('match over: local = ', Date.now()-times['localStart'], 'ts = ', Date.now()-times['tsStart']);
		state = State.AWAIT_RESULTS;

		matchTimeout = undefined;
	};
	let closeResults = () => {
		beforeTeleop = true;

		showMatch();

		resultsTimeout = undefined;
	};
	let showMatch = () => {
		timer.abort(); //just in case
		beforeTeleop = true;
		mode = 'Standby';
		state = State.AWAIT_MATCH;
	};
	function fieldUpdate(message: MessageEvent) {
		// console.log(JSON.parse(message.data));
		try {
			const field = JSON.parse(message.data)['params']['field'];
			const type = JSON.parse(message.data)['type'];

			if (processingTypes.includes(type)) {
				// console.log('prior state: ' + parseState(state));
				switch (state) {
					case State.PRE_START:
						timer.reset();
						if (type == 'SHOW_PREVIEW' || type == 'SHOW_MATCH') {
							showMatch();
						} else if (type == 'START_MATCH') {
							beforeTeleop = true;
							current = field;
							state = State.BEGIN_MATCH;
						}
						break;
					case State.AWAIT_MATCH:
						current = field;
						if (type == 'START_MATCH') {
							current = field;
							state = State.BEGIN_MATCH;
						}
						break;
					case State.BEGIN_MATCH:
						timer.reset();
						timer.start();
						resultsData = undefined;
						if (matchTimeout != undefined) {
							console.log("Match Timeout didn't abort or end");
							clearTimeout(matchTimeout);
						}
						matchTimeout = setTimeout(endGame, 150000);
						state = State.IN_MATCH;

						data = JSON.parse(message.data);

						break;
					case State.IN_MATCH:
						if (type == 'ABORT_MATCH') {
							timer.abort();
							clearTimeout(matchTimeout);
							matchTimeout = undefined;

							beforeTeleop = true;

							state = State.AWAIT_MATCH;
						} else if (type == 'SCORE_UPDATE' && current == field) {
							data = JSON.parse(message.data);
						}
						break;
					case State.AWAIT_RESULTS:
						if (type == 'SHOW_RESULTS') {
							state = State.RESULTS_SHOWN;
							resultsData = JSON.parse(message.data);
							resultsTimeout = setTimeout(closeResults, 20000);
						} else if (type == 'START_MATCH') {
							current = field;
							state = State.BEGIN_MATCH;
						} else if (type == 'SHOW_MATCH') {
							current = field;
							beforeTeleop = true;

							state = State.AWAIT_MATCH;
						}
						break;
					case State.RESULTS_SHOWN:
						if (type == 'START_MATCH') {
							clearTimeout(resultsTimeout);
							resultsTimeout = undefined;
							current = field;
							state = State.BEGIN_MATCH;
						} else if (type == 'SHOW_MATCH') {
							clearTimeout(resultsTimeout);
							resultsTimeout = undefined;
							showMatch();
						}
						break;
				}

				switch (resultsState) {
					case ResultsState.NO_RESULTS:
						resultsData = undefined;
						if (state == State.AWAIT_RESULTS) {
							resultsState = ResultsState.AWAIT_FULL;
						}
						break;
					case ResultsState.AWAIT_FULL:
						if (type == 'SHOW_RESULTS') {
							resultsState = ResultsState.FULL_RESULTS;
							showFullResults = true;
						} else if (
							state == State.AWAIT_MATCH ||
							state == State.BEGIN_MATCH ||
							state == State.IN_MATCH
						) {
							awaitMini = true;
							resultsState = ResultsState.AWAIT_MINI;
						}
						break;

					case ResultsState.FULL_RESULTS:
						if (
							state == State.AWAIT_MATCH ||
							state == State.BEGIN_MATCH ||
							state == State.IN_MATCH
						) {
							showFullResults = false;
							resultsState = ResultsState.NO_RESULTS;
						}
						break;

					case ResultsState.AWAIT_MINI:
						if (type == 'SHOW_RESULTS') {
							resultsState = ResultsState.MINI_RESULTS;
							awaitMini = false;
							showMiniResults = true;
							setTimeout(() => {
								showMiniResults = false;
								resultsState = ResultsState.NO_RESULTS;
							}, 20000);
						}
						break;

					case ResultsState.MINI_RESULTS:
						if (state == State.AWAIT_RESULTS) {
							resultsState = ResultsState.AWAIT_FULL;
							showMiniResults = false;
						}
						break;
				}
				// console.log('post state: ' + parseState(state));
			}
		} catch (e) {
			// console.error(e);
		}
	}
</script>

<main>
	<overlay class={showFullResults ? 'hidden' : ''}>
		<pos id="blueSampleNet">
			<ScoreBadge
				alliance="blue"
				order="0"
				type="2"
				pos="1"
				score={data?.params?.blueScores?.teleopSampleNet?.toString()}
			/>
		</pos>
		<pos id="blueSampleLow">
			<ScoreBadge
				alliance="blue"
				order="0"
				type="0"
				pos="1"
				score={data?.params?.blueScores?.teleopSampleLow?.toString()}
			/>
		</pos>
		<pos id="blueSampleHigh">
			<ScoreBadge
				alliance="blue"
				order="0"
				type="0"
				pos="0"
				score={data?.params?.blueScores?.teleopSampleHigh?.toString()}
			/>
		</pos>
		<pos id="blueSpecimenLow">
			<ScoreBadge
				alliance="blue"
				order="0"
				type="1"
				pos="1"
				score={data?.params?.blueScores?.teleopSpecimenLow?.toString()}
			/>
		</pos>
		<pos id="blueSpecimenHigh">
			<ScoreBadge
				alliance="blue"
				order="0"
				type="1"
				pos="0"
				score={data?.params?.blueScores?.teleopSpecimenHigh?.toString()}
			/>
		</pos>

		<pos id="redSampleNet">
			<ScoreBadge
				alliance="red"
				order="1"
				type="2"
				pos="0"
				score={data?.params?.redScores?.teleopSampleNet?.toString()}
			/>
		</pos>
		<pos id="redSampleLow">
			<ScoreBadge
				alliance="red"
				order="1"
				type="0"
				pos="1"
				score={data?.params?.redScores?.teleopSampleLow?.toString()}
			/>
		</pos>
		<pos id="redSampleHigh">
			<ScoreBadge
				alliance="red"
				order="1"
				type="0"
				pos="0"
				score={data?.params?.redScores?.teleopSampleHigh?.toString()}
			/>
		</pos>
		<pos id="redSpecimenLow">
			<ScoreBadge
				alliance="red"
				order="1"
				type="1"
				pos="1"
				score={data?.params?.redScores?.teleopSpecimenLow?.toString()}
			/>
		</pos>
		<pos id="redSpecimenHigh">
			<ScoreBadge
				alliance="red"
				order="1"
				type="1"
				pos="0"
				score={data?.params?.redScores?.teleopSpecimenHigh?.toString()}
			/>
		</pos>

		<div id="bottom" class="hgrid s12">
			<div class="vgrid s8">
				<TeamBanner
					alliance="blue"
					teamNumber={data?.params?.blue?.teams?.[0]?.number}
					teamName={data?.params?.blue?.teams?.[0]?.name}
					rank={data?.params?.blue?.teams?.[0]?.ranking?.toString()}
					leagueRank={data?.params?.blue?.teams?.[0]?.leagueRanking?.toString()}
					rankMove={data?.params?.blue?.teams?.[0]?.rankMove}
				/>
				<TeamBanner
					alliance="blue"
					teamNumber={data?.params?.blue?.teams?.[1]?.number}
					teamName={data?.params?.blue?.teams?.[1]?.name}
					rank={data?.params?.blue?.teams?.[1]?.ranking?.toString()}
					leagueRank={data?.params?.blue?.teams?.[1]?.leagueRanking?.toString()}
					rankMove={data?.params?.blue?.teams?.[1]?.rankMove}
				/>
			</div>

			<div class="vgrid s12">
				<InfoBanner text="{infoBannerText}{data?.params?.matchName}" />
				<div class="hgrid s12">
					<TotalScoreCard
						alliance="blue"
						score={(
							((beforeTeleop
								? data?.params?.blueScores?.autoPoints
								: data?.params?.blueScores?.preFoulTotal) || 0) +
							(data?.params?.redScores?.foulPointsCommitted || 0)
						).toString()}
					/>
					<TimerCard timer={time.toString()} {mode} />
					<TotalScoreCard
						alliance="red"
						score={(
							((beforeTeleop
								? data?.params?.redScores?.autoPoints
								: data?.params?.redScores?.preFoulTotal) || 0) +
							(data?.params?.blueScores?.foulPointsCommitted || 0)
						).toString()}
					/>
				</div>
			</div>

			<div class="vgrid s8">
				<TeamBanner
					alliance="red"
					teamNumber={data?.params?.red?.teams?.[0]?.number}
					teamName={data?.params?.red?.teams?.[0]?.name}
					rank={data?.params?.red?.teams?.[0]?.ranking?.toString()}
					leagueRank={data?.params?.red?.teams?.[0]?.leagueRanking?.toString()}
					rankMove={data?.params?.red?.teams?.[0]?.rankMove}
				/>
				<TeamBanner
					alliance="red"
					teamNumber={data?.params?.red?.teams?.[1]?.number}
					teamName={data?.params?.red?.teams?.[1]?.name}
					rank={data?.params?.red?.teams?.[1]?.ranking?.toString()}
					leagueRank={data?.params?.red?.teams?.[1]?.leagueRanking?.toString()}
					rankMove={data?.params?.red?.teams?.[1]?.rankMove}
				/>
			</div>
		</div>

		<shadow-rect></shadow-rect>
	</overlay>

	<results
		class="{showFullResults ? '' : 'hidden'} {data?.type == 'SHOW_PREVIEW' ||
		data?.type == 'SHOW_MATCH'
			? ''
			: 'mt2'}"
	>
		<div class="vstack vcenter s64">
			<div class="results vstack s16 vcenter">
				<ResultsInfoBanner text="{infoBannerText}{resultsData?.params?.matchName}" />

				<div class="vstack s12 vcenter">
					<div class="hstack s12">
						<div class="vstack s8">
							<ResultsTeamBanner
								alliance="blue"
								teamNumber={resultsData?.params?.blue?.teams?.[0]?.number}
								teamName={resultsData?.params?.blue?.teams?.[0]?.name}
								rank={resultsData?.params?.blue?.teams?.[0]?.ranking?.toString()}
								leagueRank={resultsData?.params?.blue?.teams?.[0]?.leagueRanking?.toString()}
								rankMove={resultsData?.params?.blue?.teams?.[0]?.rankMove}
							/>
							<ResultsTeamBanner
								alliance="blue"
								teamNumber={resultsData?.params?.blue?.teams?.[1]?.number}
								teamName={resultsData?.params?.blue?.teams?.[1]?.name}
								rank={resultsData?.params?.blue?.teams?.[1]?.ranking?.toString()}
								leagueRank={resultsData?.params?.blue?.teams?.[1]?.leagueRanking?.toString()}
								rankMove={resultsData?.params?.blue?.teams?.[1]?.rankMove}
							/>
						</div>

						<ResultsTotalScoreCard
							alliance="blue"
							score={(
								(resultsData?.params?.blueScores?.preFoulTotal || 0) +
								(resultsData?.params?.redScores?.foulPointsCommitted || 0)
							).toString()}
						/>
						<ResultsTotalScoreCard
							alliance="red"
							score={(
								(resultsData?.params?.redScores?.preFoulTotal || 0) +
								(resultsData?.params?.blueScores?.foulPointsCommitted || 0)
							).toString()}
						/>

						<div class="vstack s8">
							<ResultsTeamBanner
								alliance="red"
								teamNumber={resultsData?.params?.red?.teams?.[0]?.number}
								teamName={resultsData?.params?.red?.teams?.[0]?.name}
								rank={resultsData?.params?.red?.teams?.[0]?.ranking?.toString()}
								leagueRank={resultsData?.params?.red?.teams?.[0]?.leagueRanking?.toString()}
								rankMove={resultsData?.params?.red?.teams?.[0]?.rankMove}
							/>
							<ResultsTeamBanner
								alliance="red"
								teamNumber={resultsData?.params?.red?.teams?.[1]?.number}
								teamName={resultsData?.params?.red?.teams?.[1]?.name}
								rank={resultsData?.params?.red?.teams?.[1]?.ranking?.toString()}
								leagueRank={resultsData?.params?.red?.teams?.[1]?.leagueRanking?.toString()}
								rankMove={resultsData?.params?.red?.teams?.[1]?.rankMove}
							/>
						</div>
					</div>
				</div>

				<ResultsScoreBreakdown
					blueAuto={resultsData?.params?.blueScores?.autoPoints?.toString()}
					blueAutoSampleNet={resultsData?.params?.blueScores?.autoSampleNet?.toString()}
					blueAutoSampleLow={resultsData?.params?.blueScores?.autoSampleLow?.toString()}
					blueAutoSampleHigh={resultsData?.params?.blueScores?.autoSampleHigh?.toString()}
					blueAutoSpecimenLow={resultsData?.params?.blueScores?.autoSpecimenLow?.toString()}
					blueAutoSpecimenHigh={resultsData?.params?.blueScores?.autoSpecimenHigh?.toString()}
					blue1AutoLocation={resultsData?.params?.blueScores?.robot1Auto}
					blue2AutoLocation={resultsData?.params?.blueScores?.robot2Auto}
					blueTeleop={resultsData?.params?.blueScores?.teleopPoints?.toString()}
					blueTeleopSampleNet={resultsData?.params?.blueScores?.teleopSampleNet?.toString()}
					blueTeleopSampleLow={resultsData?.params?.blueScores?.teleopSampleLow?.toString()}
					blueTeleopSampleHigh={resultsData?.params?.blueScores?.teleopSampleHigh?.toString()}
					blueTeleopSpecimenLow={resultsData?.params?.blueScores?.teleopSpecimenLow?.toString()}
					blueTeleopSpecimenHigh={resultsData?.params?.blueScores?.teleopSpecimenHigh?.toString()}
					blue1TeleopLocation={resultsData?.params?.blueScores?.robot1Teleop}
					blue2TeleopLocation={resultsData?.params?.blueScores?.robot2Teleop}
					blueFoulsReceived={resultsData?.params?.redScores?.foulPointsCommitted?.toString()}
					redAuto={resultsData?.params?.redScores?.autoPoints?.toString()}
					redAutoSampleNet={resultsData?.params?.redScores?.autoSampleNet?.toString()}
					redAutoSampleLow={resultsData?.params?.redScores?.autoSampleLow?.toString()}
					redAutoSampleHigh={resultsData?.params?.redScores?.autoSampleHigh?.toString()}
					redAutoSpecimenLow={resultsData?.params?.redScores?.autoSpecimenLow?.toString()}
					redAutoSpecimenHigh={resultsData?.params?.redScores?.autoSpecimenHigh?.toString()}
					red1AutoLocation={resultsData?.params?.redScores?.robot1Auto}
					red2AutoLocation={resultsData?.params?.redScores?.robot2Auto}
					redTeleop={resultsData?.params?.redScores?.teleopPoints?.toString()}
					redTeleopSampleNet={resultsData?.params?.redScores?.teleopSampleNet?.toString()}
					redTeleopSampleLow={resultsData?.params?.redScores?.teleopSampleLow?.toString()}
					redTeleopSampleHigh={resultsData?.params?.redScores?.teleopSampleHigh?.toString()}
					redTeleopSpecimenLow={resultsData?.params?.redScores?.teleopSpecimenLow?.toString()}
					redTeleopSpecimenHigh={resultsData?.params?.redScores?.teleopSpecimenHigh?.toString()}
					red1TeleopLocation={resultsData?.params?.redScores?.robot1Teleop}
					red2TeleopLocation={resultsData?.params?.redScores?.robot2Teleop}
					redFoulsReceived={resultsData?.params?.blueScores?.foulPointsCommitted?.toString()}
					hideDetails={data?.type == 'SHOW_PREVIEW' || data?.type == 'SHOW_MATCH'}
				/>
			</div>

			<preview
				class="vstack vcenter s8 {data?.type == 'SHOW_PREVIEW' || data?.type == 'SHOW_MATCH'
					? ''
					: 'vscale0'}"
			>
				<InfoBanner text="Upcoming Match • {data?.params?.matchName}" />
				<div class="hgrid s12">
					<div class="vgrid s8">
						<TeamBanner
							alliance="blue"
							teamNumber={data?.params?.blue?.teams?.[0]?.number}
							teamName={data?.params?.blue?.teams?.[0]?.name}
							rank={data?.params?.blue?.teams?.[0]?.ranking?.toString()}
							leagueRank={data?.params?.blue?.teams?.[0]?.leagueRanking?.toString()}
							rankMove={data?.params?.blue?.teams?.[0]?.rankMove}
						/>
						<TeamBanner
							alliance="blue"
							teamNumber={data?.params?.blue?.teams?.[1]?.number}
							teamName={data?.params?.blue?.teams?.[1]?.name}
							rank={data?.params?.blue?.teams?.[1]?.ranking?.toString()}
							leagueRank={data?.params?.blue?.teams?.[1]?.leagueRanking?.toString()}
							rankMove={data?.params?.blue?.teams?.[1]?.rankMove}
						/>
					</div>

					<div class="vgrid s8">
						<TeamBanner
							alliance="red"
							teamNumber={data?.params?.red?.teams?.[0]?.number}
							teamName={data?.params?.red?.teams?.[0]?.name}
							rank={data?.params?.red?.teams?.[0]?.ranking?.toString()}
							leagueRank={data?.params?.red?.teams?.[0]?.leagueRanking?.toString()}
							rankMove={data?.params?.red?.teams?.[0]?.rankMove}
						/>
						<TeamBanner
							alliance="red"
							teamNumber={data?.params?.red?.teams?.[1]?.number}
							teamName={data?.params?.red?.teams?.[1]?.name}
							rank={data?.params?.red?.teams?.[1]?.ranking?.toString()}
							leagueRank={data?.params?.red?.teams?.[1]?.leagueRanking?.toString()}
							rankMove={data?.params?.red?.teams?.[1]?.rankMove}
						/>
					</div>
				</div>
			</preview>
		</div>
	</results>
</main>

<style lang="scss">
	* {
		z-index: 0;
	}

	main {
		overflow: hidden;
		z-index: -2;
	}

	.hidden {
		opacity: 0;
	}

	#bottom {
		position: absolute;
		bottom: 1.2vw;
		align-items: end;
	}

	.results {
		position: relative;
		padding: 0.8vw;
		border-radius: 2.4vw;
		background: linear-gradient(to right, #04589e66, #b6191f66);
		box-shadow:
			0 0 0 0.5vw #f5e447,
			0 0 0 1vw #9cd9e8,
			0 0 0 1.5vw #0283ae,
			0 0 12vw 6vw rgba(0, 0, 0, 0.5);
		background-clip: padding-box;
	}

	shadow-rect {
		position: absolute;
		top: 100%;
		width: 100vw;
		box-shadow: 0 0 12vw 6vw rgba(0, 0, 0, 0.5);
		z-index: -1;
	}

	preview.vscale0 {
		margin: -5.4vw 0;
		opacity: 0;
	}

	.mt2 {
		margin-top: 2vw;
	}
</style>
