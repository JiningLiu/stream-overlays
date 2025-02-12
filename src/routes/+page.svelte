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
//
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
				return 'IN_MATCH';
			case 3:
				return 'AWAIT_RESULTS';
			case 4:
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
		private phaseTotalTime: number = 0;
		private timerStates: number[] = [30, 8, 120]; // 30 seconds, 8 seconds, and 2 minutes (120 seconds)
		private currentStateIndex: number = 0;
		private timerRunning: boolean = false;

		// Start the timer
		start(): void {
			if (this.timerRunning) return; // Prevent starting the timer if it's already running
			console.log("timer start");
			this.timerRunning = true;
			this.phaseTotalTime = this.timerStates[this.currentStateIndex];
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
			console.log("abort");
			this.timerRunning = false;
		}
		// set timer to 0
		clear(): void{
			console.log("clear")
			this.timerRunning = false;
			this.phaseTotalTime = 0;
			time = 0;
		}
		// Reset the timer to its initial state
		reset(): void {
			console.log("reset");
			this.timerRunning = false;
			this.currentStateIndex = 0; // Start from the first timer state (30 seconds)
		}

		// Internal function that calculates time based on performance.now() and remaining time
		private tick(): void {
			if (!this.timerRunning) return;

			const now = performance.now();
			const elapsedTime = (now - this.startTime) / 1000; // time in seconds
			const timeLeft = this.phaseTotalTime - elapsedTime;

			// console.log("tick debug", "now: "+now, "elapsedTime: "+elapsedTime, "timeLeft: "+timeLeft, "startTime: "+this.startTime, "remainingTime: "+this.remainingTime);

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
				this.phaseTotalTime = this.timerStates[this.currentStateIndex];
			} else {
				this.timerRunning = false;
				mode = 'Review';
				beforeTeleop = false;
				return;
			}
			this.timerRunning = false;
			this.start();
		}

		//only for use of the special start match
		setTime(timeElapsed:number, beginTime:number): void {
			console.log("av2","timeElapse: "+timeElapsed,"beginTime: "+beginTime);
			this.timerRunning = true;
			if (timeElapsed >= 158){
				console.log("over");
				this.clear();
				mode = 'Standby';
				beforeTeleop = false;
			}
			// if past auto and transition
			else if(timeElapsed>=38){
				this.startTime = beginTime+38000;

				console.log("tele");
				this.currentStateIndex = 2;
				mode = 'TeleOp';
				beforeTeleop = false;
			}
			//if past auto
			else if (timeElapsed>=30){
				this.startTime = beginTime+30000;

				console.log("trans");
				this.currentStateIndex = 1;
				mode = 'Wait';
				beforeTeleop = true;

			}
			//if in auto
			else{
				this.startTime = beginTime;

				console.log("def: auto");
				this.currentStateIndex = 0;
				mode = 'Auto';
				beforeTeleop = true;

			}
			// console.log("setTime");
			this.phaseTotalTime = this.timerStates[this.currentStateIndex];
			
			// console.log(this.remainingTime, this.currentStateIndex);
			this.tick();
		}
	}

	//for thing that I'm trying to do
	let startTime = -1;

	//data
	let data: GameUpdate | undefined;
	let resultsData: GameUpdate | undefined;

	//banner
	let time = 0;
	let mode = 'Standby';
	let beforeTeleop = true;
	let infoBannerText = '';

	//results things
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
				setTimeout(() => {
					started = true;

					let maxTS: number = 0; //finds the highest TS value
					let maxIndex: number = 0; //finds the index of the highest TS

					let maxStartTS: number = 0; //get the most recent start match
					for (let index = 0; index < chaosArray.length; index++) {
						let num = JSON.parse(chaosArray[index].data)['ts'];
						if(!processingTypes.includes(JSON.parse(chaosArray[index].data)['type'])){
							continue;
						}
						if(JSON.parse(chaosArray[index].data)['type'] == 'START_MATCH'){
							if (maxStartTS < num) {
								maxStartTS = JSON.parse(chaosArray[index].data)['ts'];
							}
						}
						if (maxTS < num) {
							maxIndex = index;
							maxTS = JSON.parse(chaosArray[index].data)['ts'];
						}
					}
					let recentData = JSON.parse(chaosArray[maxIndex].data);

					// console.log(JSON.parse(chaosArray[maxIndex].data)['type']);
					if(recentData['type']=='START_MATCH'|| recentData['type']=='SCORE_UPDATE'){
						data = JSON.parse(chaosArray[maxIndex].data);
						timer.setTime((Date.now()-maxStartTS)/1000, maxStartTS-Date.now());
						state = State.IN_MATCH;
						matchTimeout = setTimeout(endGame, 158000+maxStartTS-Date.now());
					}else if(recentData['type']=='SHOW_PREVIEW'||recentData['type']=='SHOW_MATCH'){
						data = JSON.parse(chaosArray[maxIndex].data);
						mode = 'Standby';
						state = State.AWAIT_MATCH;
					}else{
						fieldUpdate(chaosArray[maxIndex]);
					}
				}, 1000);
				console.log('FTCLive display WebSocket connected.');
			};

			socket.onmessage = (event) => {
				
				if (!started) {					
					chaosArray.push(event);
				}
				else
					fieldUpdate(event);
			};

			socket.onclose = () => {
				console.log('FTCLive display WebSocket closed.');
			};
		} else {
			location.href = './generate';
		}
	});

	let endGame = () => {
		// timer.reset();
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
		let oldState = parseState(state);
		timer.reset(); //just in case
		beforeTeleop = true;
		mode = 'Standby';
		state = State.AWAIT_MATCH;
		console.log('DEBUG INFO','prior:'+oldState,'post: '+ parseState(state), 'type: showMethod');

	};

	let startMatch = (field: number) => {
		let oldState = parseState(state);
		beforeTeleop = true;
		
		timer.reset();
		timer.start();
		resultsData = undefined;
		if (matchTimeout != undefined) {
			console.log("Match Timeout didn't abort or end");
			clearTimeout(matchTimeout);
		}
		matchTimeout = setTimeout(endGame, 158000);
		state = State.IN_MATCH;
		console.log('DEBUG INFO','prior:'+oldState,'post: '+ parseState(state), 'type: startMethod');

	};

	function fieldUpdate(message: MessageEvent) {
		try {
			const field = JSON.parse(message.data)['params']['field'];
			const type = JSON.parse(message.data)['type'];

			if (processingTypes.includes(type)) {
				let oldState = parseState(state);
				switch (state) {
					case State.PRE_START:
						timer.reset();
						if (type == 'SHOW_PREVIEW' || type == 'SHOW_MATCH') {
							showMatch();
							data = JSON.parse(message.data);
						} else if (type == 'START_MATCH'||type == 'SCORE_UPDATE') {
							startMatch(field);
							data = JSON.parse(message.data);
						}else if (type == 'SHOW_RESULTS') {
							state = State.RESULTS_SHOWN;
							resultsTimeout = setTimeout(closeResults, 20000);
						}
						break;
					case State.AWAIT_MATCH:
						current = field;
						if (type == 'START_MATCH') {
							startMatch(field);
							data = JSON.parse(message.data);
						}
						break;
					case State.IN_MATCH:
						if (type == 'ABORT_MATCH') {
							mode = 'Aborted';
							timer.clear();
							clearTimeout(matchTimeout);
							matchTimeout = undefined;

							beforeTeleop = true;

							state = State.AWAIT_MATCH;
						} else if (current == field) {
							data = JSON.parse(message.data);
						}
						break;
					case State.AWAIT_RESULTS:
						if (type == 'SHOW_RESULTS') {
							state = State.RESULTS_SHOWN;
							resultsTimeout = setTimeout(closeResults, 20000);
						} else if (type == 'START_MATCH') {
							startMatch(field);
							data = JSON.parse(message.data);
						} else if (type == 'SHOW_MATCH') {
							showMatch();
							data = JSON.parse(message.data);
						}
						break;
					case State.RESULTS_SHOWN:
						if (type == 'START_MATCH') {
							clearTimeout(resultsTimeout);
							resultsTimeout = undefined;

							startMatch(field);
							data = JSON.parse(message.data);
						} else if (type == 'SHOW_MATCH') {
							clearTimeout(resultsTimeout);
							resultsTimeout = undefined;

							showMatch();
							data = JSON.parse(message.data);
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
							resultsData = JSON.parse(message.data);

							resultsState = ResultsState.FULL_RESULTS;
							showFullResults = true;
						} else if (
							state == State.AWAIT_MATCH ||
							state == State.IN_MATCH
						) {
							awaitMini = true;
							resultsState = ResultsState.AWAIT_MINI;
						}
						break;

					case ResultsState.FULL_RESULTS:
						if (
							state == State.AWAIT_MATCH ||
							state == State.IN_MATCH
						) {
							showFullResults = false;
							resultsState = ResultsState.NO_RESULTS;
						}
						break;

					case ResultsState.AWAIT_MINI:
						if (type == 'SHOW_RESULTS') {
							resultsData = JSON.parse(message.data);

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
				console.log('DEBUG INFO','prior:'+oldState,'post: '+ parseState(state), 'type: '+type);
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
					<!-- the blue and red ones that have the big number in it -->
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
