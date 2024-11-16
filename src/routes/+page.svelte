<script lang="ts">
	import ScoreBadge from './overlay/ScoreBadge.svelte';
	import InfoBanner from './overlay/InfoBanner.svelte';
	import TotalScoreCard from './overlay/TotalScoreCard.svelte';
	import TimerCard from './overlay/TimerCard.svelte';
	import TeamBanner from './overlay/TeamBanner.svelte';

	import ResultsInfoBanner from './results/ResultsInfoBanner.svelte';
	import ResultsTeamBanner from './results/ResultsTeamBanner.svelte';
	import ResultsTotalScoreCard from './results/ResultsTotalScoreCard.svelte';
	import ResultsScoreBadge from './results/ResultsScoreBadge.svelte';
	import ResultsLocationBadge from './results/ResultsLocationBadge.svelte';
	import ResultsScoreSectionTitle from './results/ResultsScoreSectionTitle.svelte';
	import ResultsScoreElementText from './results/ResultsScoreElementText.svelte';

	import { onMount } from 'svelte';

	const processingTypes = [
		'START_MATCH',
		'ABORT_MATCH',
		'SHOW_PREVIEW',
		'SHOW_MATCH',
		'SCORE_UPDATE',
		'SHOW_RESULTS'
	];

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
					mode = 'AUTO';
					beforeTeleop = true;
					break;
				case 1:
					mode = 'WAIT';
					beforeTeleop = true;
					break;
				case 2:
					mode = 'TELEOP';
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
				mode = 'JUDGING';
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

	let data: GameUpdate = {
		type: '',
		params: {
			liveScoringComplete: false,
			someLocked: false,
			redScores: {
				robot1Auto: undefined,
				robot2Auto: undefined,
				autoSampleNet: undefined,
				autoSampleLow: undefined,
				autoSampleHigh: undefined,
				autoSpecimenLow: undefined,
				autoSpecimenHigh: undefined,
				teleopSampleNet: undefined,
				teleopSampleLow: undefined,
				teleopSampleHigh: undefined,
				teleopSpecimenLow: undefined,
				teleopSpecimenHigh: undefined,
				robot1Teleop: undefined,
				robot2Teleop: undefined,
				minorFouls: undefined,
				majorFouls: undefined,
				autoSamplePoints: undefined,
				autoSpecimenPoints: undefined,
				autoParkPoints: undefined,
				autoAscentPoints: undefined,
				teleopSamplePoints: undefined,
				teleopSpecimenPoints: undefined,
				teleopParkPoints: undefined,
				teleopAscentPoints: undefined,
				autoPoints: undefined,
				teleopPoints: undefined,
				foulPointsCommitted: undefined,
				preFoulTotal: undefined,
				adjust: undefined
			},
			blueScores: {
				robot1Auto: undefined,
				robot2Auto: undefined,
				autoSampleNet: undefined,
				autoSampleLow: undefined,
				autoSampleHigh: undefined,
				autoSpecimenLow: undefined,
				autoSpecimenHigh: undefined,
				teleopSampleNet: undefined,
				teleopSampleLow: undefined,
				teleopSampleHigh: undefined,
				teleopSpecimenLow: undefined,
				teleopSpecimenHigh: undefined,
				robot1Teleop: undefined,
				robot2Teleop: undefined,
				minorFouls: undefined,
				majorFouls: undefined,
				autoSamplePoints: undefined,
				autoSpecimenPoints: undefined,
				autoParkPoints: undefined,
				autoAscentPoints: undefined,
				teleopSamplePoints: undefined,
				teleopSpecimenPoints: undefined,
				teleopParkPoints: undefined,
				teleopAscentPoints: undefined,
				autoPoints: undefined,
				teleopPoints: undefined,
				foulPointsCommitted: undefined,
				preFoulTotal: undefined,
				adjust: undefined
			},
			hrReview: undefined,
			number: undefined,
			series: undefined,
			displayNumber: undefined,
			matchName: undefined,
			field: undefined,
			elims: undefined,
			red: {},
			blue: {},
			singleTeam: undefined
		},
		field: undefined,
		init: undefined,
		ts: undefined
	};

	let time = 0;
	let mode = 'STANDBY';
	let beforeTeleop = true;

	let infoBannerText = '';
	let showResults = false;

	const timer = new CountdownTimer();

	let socket: WebSocket;
	onMount(() => {
		const params = new URLSearchParams(location.search);
		infoBannerText = params.get('infoBannerText') + ' • ';
		const socketUrl = params.get('socketUrl');
		if (socketUrl) {
			socket = new WebSocket(socketUrl);

			socket.onopen = () => {
				console.log('FTCLive display WebSocket connected.');
			};

			socket.onmessage = (event) => {
				if (processingTypes.includes(JSON.parse(event.data).type)) {
					data = JSON.parse(event.data);
					if (data.type === 'SHOW_RESULTS') {
						timer.abort();
						time = 30;
						mode = 'STANDBY';
						beforeTeleop = false;
						showResults = true;
						return;
					} else if (data.type === 'START_MATCH') {
						timer.reset();
						timer.start();
					} else if (data.type === 'ABORT_MATCH') {
						timer.abort();
						mode = 'ABORTED';
					} else if (['SHOW_PREVIEW', 'SHOW_MATCH'].includes(data.type || '')) {
						timer.abort();
						time = 30;
						mode = 'STANDBY';
						beforeTeleop = true;
					}
					showResults = false;
				}
			};

			socket.onclose = () => {
				console.log('FTCLive display WebSocket closed.');
			};
		} else {
			alert(
				'No FTCLive display WebSocket URL defined. Please create a valid link in the overlay console.'
			);
			location.reload();
		}
	});
</script>

<main>
	<overlay class={showResults ? 'hidden' : ''}>
		<div id="top" class="hstack s64 {showResults ? 'hidden' : ''}">
			<div class="hstack s8">
				<ScoreBadge
					alliance="blue"
					order="0"
					type="2"
					pos="0"
					score={data.params?.blueScores?.teleopSampleNet?.toString()}
				/>
				<ScoreBadge
					alliance="blue"
					order="0"
					type="0"
					pos="1"
					score={data.params?.blueScores?.teleopSampleLow?.toString()}
				/>
				<ScoreBadge
					alliance="blue"
					order="0"
					type="0"
					pos="0"
					score={data.params?.blueScores?.teleopSampleHigh?.toString()}
				/>
				<ScoreBadge
					alliance="blue"
					order="0"
					type="1"
					pos="1"
					score={data.params?.blueScores?.teleopSpecimenLow?.toString()}
				/>
				<ScoreBadge
					alliance="blue"
					order="0"
					type="1"
					pos="0"
					score={data.params?.blueScores?.teleopSpecimenHigh?.toString()}
				/>
			</div>

			<div class="hstack s8">
				<ScoreBadge
					alliance="red"
					order="1"
					type="2"
					pos="0"
					score={data.params?.redScores?.teleopSampleNet?.toString()}
				/>
				<ScoreBadge
					alliance="red"
					order="1"
					type="0"
					pos="1"
					score={data.params?.redScores?.teleopSampleLow?.toString()}
				/>
				<ScoreBadge
					alliance="red"
					order="1"
					type="0"
					pos="0"
					score={data.params?.redScores?.teleopSampleHigh?.toString()}
				/>
				<ScoreBadge
					alliance="red"
					order="1"
					type="1"
					pos="1"
					score={data.params?.redScores?.teleopSpecimenLow?.toString()}
				/>
				<ScoreBadge
					alliance="red"
					order="1"
					type="1"
					pos="0"
					score={data.params?.redScores?.teleopSpecimenHigh?.toString()}
				/>
			</div>
		</div>

		<div id="bottom" class="hgrid s12">
			<div class="vgrid s8">
				<TeamBanner
					alliance="blue"
					teamNumber={data.params?.blue?.teams?.[0]?.number}
					teamName={data.params?.blue?.teams?.[0]?.name}
					rank={data.params?.blue?.teams?.[0]?.ranking?.toString()}
					leagueRank={data.params?.blue?.teams?.[0]?.leagueRanking?.toString()}
					rankMove={data.params?.blue?.teams?.[0]?.rankMove}
				/>
				<TeamBanner
					alliance="blue"
					teamNumber={data.params?.blue?.teams?.[1]?.number}
					teamName={data.params?.blue?.teams?.[1]?.name}
					rank={data.params?.blue?.teams?.[1]?.ranking?.toString()}
					leagueRank={data.params?.blue?.teams?.[1]?.leagueRanking?.toString()}
					rankMove={data.params?.blue?.teams?.[1]?.rankMove}
				/>
			</div>

			<div class="vgrid s12">
				<InfoBanner text="{infoBannerText}{data.params?.matchName}" />
				<div class="hgrid s12">
					<TotalScoreCard
						alliance="blue"
						score={(
							((beforeTeleop
								? data.params?.blueScores?.autoPoints
								: data.params?.blueScores?.preFoulTotal) || 0) +
							(data.params?.redScores?.foulPointsCommitted || 0)
						).toString()}
					/>
					<TimerCard timer={time.toString()} {mode} />
					<TotalScoreCard
						alliance="red"
						score={(
							((beforeTeleop
								? data.params?.redScores?.autoPoints
								: data.params?.redScores?.preFoulTotal) || 0) +
							(data.params?.blueScores?.foulPointsCommitted || 0)
						).toString()}
					/>
				</div>
			</div>

			<div class="vgrid s8">
				<TeamBanner
					alliance="red"
					teamNumber={data.params?.red?.teams?.[0]?.number}
					teamName={data.params?.red?.teams?.[0]?.name}
					rank={data.params?.red?.teams?.[0]?.ranking?.toString()}
					leagueRank={data.params?.red?.teams?.[0]?.leagueRanking?.toString()}
					rankMove={data.params?.red?.teams?.[0]?.rankMove}
				/>
				<TeamBanner
					alliance="red"
					teamNumber={data.params?.red?.teams?.[1]?.number}
					teamName={data.params?.red?.teams?.[1]?.name}
					rank={data.params?.red?.teams?.[1]?.ranking?.toString()}
					leagueRank={data.params?.red?.teams?.[1]?.leagueRanking?.toString()}
					rankMove={data.params?.red?.teams?.[1]?.rankMove}
				/>
			</div>
		</div>

		<shadow-rect></shadow-rect>
	</overlay>

	<results>
		<div class="vstack s16 vcenter {showResults ? '' : 'hidden'}">
			<ResultsInfoBanner text="{infoBannerText}{data.params?.matchName}" />

			<div class="vstack s12 vcenter">
				<div class="hstack s8">
					<div class="vstack s8">
						<ResultsTeamBanner
							alliance="blue"
							teamNumber={data.params?.blue?.teams?.[0]?.number}
							teamName={data.params?.blue?.teams?.[0]?.name}
							rank={data.params?.blue?.teams?.[0]?.ranking?.toString()}
							leagueRank={data.params?.blue?.teams?.[0]?.leagueRanking?.toString()}
							rankMove={data.params?.blue?.teams?.[0]?.rankMove}
						/>
						<ResultsTeamBanner
							alliance="blue"
							teamNumber={data.params?.blue?.teams?.[1]?.number}
							teamName={data.params?.blue?.teams?.[1]?.name}
							rank={data.params?.blue?.teams?.[1]?.ranking?.toString()}
							leagueRank={data.params?.blue?.teams?.[1]?.leagueRanking?.toString()}
							rankMove={data.params?.blue?.teams?.[1]?.rankMove}
						/>
					</div>

					<div class="vstack s8">
						<ResultsTeamBanner
							alliance="red"
							teamNumber={data.params?.red?.teams?.[0]?.number}
							teamName={data.params?.red?.teams?.[0]?.name}
							rank={data.params?.red?.teams?.[0]?.ranking?.toString()}
							leagueRank={data.params?.red?.teams?.[0]?.leagueRanking?.toString()}
							rankMove={data.params?.red?.teams?.[0]?.rankMove}
						/>
						<ResultsTeamBanner
							alliance="red"
							teamNumber={data.params?.red?.teams?.[1]?.number}
							teamName={data.params?.red?.teams?.[1]?.name}
							rank={data.params?.red?.teams?.[1]?.ranking?.toString()}
							leagueRank={data.params?.red?.teams?.[1]?.leagueRanking?.toString()}
							rankMove={data.params?.red?.teams?.[1]?.rankMove}
						/>
					</div>
				</div>
			</div>

			<div class="vstack vcenter s8">
				<div class="hstack s12">
					<ResultsTotalScoreCard
						alliance="blue"
						score={(
							(data.params?.blueScores?.preFoulTotal || 0) +
							(data.params?.redScores?.foulPointsCommitted || 0)
						).toString()}
						won={(data.params?.blueScores?.preFoulTotal || 0) +
							(data.params?.redScores?.foulPointsCommitted || 0) >=
							(data.params?.redScores?.preFoulTotal || 0) +
								(data.params?.blueScores?.foulPointsCommitted || 0)}
					/>
					<ResultsTotalScoreCard
						alliance="red"
						score={(
							(data.params?.redScores?.preFoulTotal || 0) +
							(data.params?.blueScores?.foulPointsCommitted || 0)
						).toString()}
						won={(data.params?.redScores?.preFoulTotal || 0) +
							(data.params?.blueScores?.foulPointsCommitted || 0) >=
							(data.params?.blueScores?.preFoulTotal || 0) +
								(data.params?.redScores?.foulPointsCommitted || 0)}
					/>
				</div>

				<div class="hstack s8">
					<ResultsScoreBadge
						alliance="blue"
						score={data.params?.redScores?.foulPointsCommitted?.toString()}
						otherAllianceScore={data.params?.blueScores?.foulPointsCommitted?.toString()}
					/>
					<ResultsScoreElementText text="Fouls Awarded" />
					<ResultsScoreBadge
						alliance="red"
						score={data.params?.blueScores?.foulPointsCommitted?.toString()}
						otherAllianceScore={data.params?.redScores?.foulPointsCommitted?.toString()}
					/>
				</div>

				<div class="shiftUp hstack s64">
					<div class="vstack vcenter s8">
						<ResultsScoreSectionTitle text="AUTO" />

						<div class="hstack s8">
							<ResultsScoreBadge
								alliance="blue"
								score={data.params?.blueScores?.teleopSampleNet?.toString()}
								otherAllianceScore={data.params?.redScores?.teleopSampleNet?.toString()}
							/>
							<ResultsScoreElementText text="Net Zone Samples" />
							<ResultsScoreBadge
								alliance="red"
								score={data.params?.redScores?.teleopSampleNet?.toString()}
								otherAllianceScore={data.params?.blueScores?.teleopSampleNet?.toString()}
							/>
						</div>

						<div class="hstack s8">
							<ResultsScoreBadge
								alliance="blue"
								score={data.params?.blueScores?.teleopSampleLow?.toString()}
								otherAllianceScore={data.params?.redScores?.teleopSampleLow?.toString()}
							/>
							<ResultsScoreElementText text="Low Basket Samples" />
							<ResultsScoreBadge
								alliance="red"
								score={data.params?.redScores?.teleopSampleLow?.toString()}
								otherAllianceScore={data.params?.blueScores?.teleopSampleLow?.toString()}
							/>
						</div>

						<div class="hstack s8">
							<ResultsScoreBadge
								alliance="blue"
								score={data.params?.blueScores?.teleopSampleHigh?.toString()}
								otherAllianceScore={data.params?.redScores?.teleopSampleHigh?.toString()}
							/>
							<ResultsScoreElementText text="High Basket Samples" />
							<ResultsScoreBadge
								alliance="red"
								score={data.params?.redScores?.teleopSampleHigh?.toString()}
								otherAllianceScore={data.params?.blueScores?.teleopSampleHigh?.toString()}
							/>
						</div>

						<div class="hstack s8">
							<ResultsScoreBadge
								alliance="blue"
								score={data.params?.blueScores?.teleopSampleHigh?.toString()}
								otherAllianceScore={data.params?.redScores?.teleopSampleHigh?.toString()}
							/>
							<ResultsScoreElementText text="High Basket Samples" />
							<ResultsScoreBadge
								alliance="red"
								score={data.params?.redScores?.teleopSampleHigh?.toString()}
								otherAllianceScore={data.params?.blueScores?.teleopSampleHigh?.toString()}
							/>
						</div>

						<div class="hstack s8">
							<ResultsScoreBadge
								alliance="blue"
								score={data.params?.blueScores?.teleopSpecimenLow?.toString()}
								otherAllianceScore={data.params?.redScores?.teleopSpecimenLow?.toString()}
							/>
							<ResultsScoreElementText text="Low Chamber Specimen" />
							<ResultsScoreBadge
								alliance="red"
								score={data.params?.redScores?.teleopSpecimenLow?.toString()}
								otherAllianceScore={data.params?.blueScores?.teleopSpecimenLow?.toString()}
							/>
						</div>

						<div class="hstack s8">
							<ResultsScoreBadge
								alliance="blue"
								score={data.params?.blueScores?.teleopSpecimenHigh?.toString()}
								otherAllianceScore={data.params?.redScores?.teleopSpecimenHigh?.toString()}
							/>
							<ResultsScoreElementText text="High Chamber Specimen" />
							<ResultsScoreBadge
								alliance="red"
								score={data.params?.redScores?.teleopSpecimenHigh?.toString()}
								otherAllianceScore={data.params?.blueScores?.teleopSpecimenHigh?.toString()}
							/>
						</div>

						<div class="hstack s8 hcenter vcenter">
							<div class="vstack s8">
								<ResultsLocationBadge
									alliance="blue"
									location={data.params?.blueScores?.robot1Auto}
									sizeDeterminingLocation={[
										data.params?.blueScores?.robot1Auto || '',
										data.params?.blueScores?.robot2Auto || '',
										data.params?.redScores?.robot1Auto || '',
										data.params?.redScores?.robot2Auto || ''
									].reduce((a, b) => (b.length > a.length ? b : a))}
								/>
								<ResultsLocationBadge
									alliance="blue"
									location={data.params?.blueScores?.robot2Auto}
									sizeDeterminingLocation={[
										data.params?.blueScores?.robot1Auto || '',
										data.params?.blueScores?.robot2Auto || '',
										data.params?.redScores?.robot1Auto || '',
										data.params?.redScores?.robot2Auto || ''
									].reduce((a, b) => (b.length > a.length ? b : a))}
								/>
							</div>

							<ResultsScoreElementText text="Location" />

							<div class="vstack s8">
								<ResultsLocationBadge
									alliance="red"
									location={data.params?.redScores?.robot1Auto}
									sizeDeterminingLocation={[
										data.params?.blueScores?.robot1Auto || '',
										data.params?.blueScores?.robot2Auto || '',
										data.params?.redScores?.robot1Auto || '',
										data.params?.redScores?.robot2Auto || ''
									].reduce((a, b) => (b.length > a.length ? b : a))}
								/>
								<ResultsLocationBadge
									alliance="red"
									location={data.params?.redScores?.robot2Auto}
									sizeDeterminingLocation={[
										data.params?.blueScores?.robot1Auto || '',
										data.params?.blueScores?.robot2Auto || '',
										data.params?.redScores?.robot1Auto || '',
										data.params?.redScores?.robot2Auto || ''
									].reduce((a, b) => (b.length > a.length ? b : a))}
								/>
							</div>
						</div>
					</div>

					<div class="vstack vcenter s8">
						<ResultsScoreSectionTitle text="TELEOP" />

						<div class="hstack s8">
							<ResultsScoreBadge
								alliance="blue"
								score={data.params?.blueScores?.teleopSampleNet?.toString()}
								otherAllianceScore={data.params?.redScores?.teleopSampleNet?.toString()}
							/>
							<ResultsScoreElementText text="Net Zone Samples" />
							<ResultsScoreBadge
								alliance="red"
								score={data.params?.redScores?.teleopSampleNet?.toString()}
								otherAllianceScore={data.params?.blueScores?.teleopSampleNet?.toString()}
							/>
						</div>

						<div class="hstack s8">
							<ResultsScoreBadge
								alliance="blue"
								score={data.params?.blueScores?.teleopSampleLow?.toString()}
								otherAllianceScore={data.params?.redScores?.teleopSampleLow?.toString()}
							/>
							<ResultsScoreElementText text="Low Basket Samples" />
							<ResultsScoreBadge
								alliance="red"
								score={data.params?.redScores?.teleopSampleLow?.toString()}
								otherAllianceScore={data.params?.blueScores?.teleopSampleLow?.toString()}
							/>
						</div>

						<div class="hstack s8">
							<ResultsScoreBadge
								alliance="blue"
								score={data.params?.blueScores?.teleopSampleHigh?.toString()}
								otherAllianceScore={data.params?.redScores?.teleopSampleHigh?.toString()}
							/>
							<ResultsScoreElementText text="High Basket Samples" />
							<ResultsScoreBadge
								alliance="red"
								score={data.params?.redScores?.teleopSampleHigh?.toString()}
								otherAllianceScore={data.params?.blueScores?.teleopSampleHigh?.toString()}
							/>
						</div>

						<div class="hstack s8">
							<ResultsScoreBadge
								alliance="blue"
								score={data.params?.blueScores?.teleopSampleHigh?.toString()}
								otherAllianceScore={data.params?.redScores?.teleopSampleHigh?.toString()}
							/>
							<ResultsScoreElementText text="High Basket Samples" />
							<ResultsScoreBadge
								alliance="red"
								score={data.params?.redScores?.teleopSampleHigh?.toString()}
								otherAllianceScore={data.params?.blueScores?.teleopSampleHigh?.toString()}
							/>
						</div>

						<div class="hstack s8">
							<ResultsScoreBadge
								alliance="blue"
								score={data.params?.blueScores?.teleopSpecimenLow?.toString()}
								otherAllianceScore={data.params?.redScores?.teleopSpecimenLow?.toString()}
							/>
							<ResultsScoreElementText text="Low Chamber Specimen" />
							<ResultsScoreBadge
								alliance="red"
								score={data.params?.redScores?.teleopSpecimenLow?.toString()}
								otherAllianceScore={data.params?.blueScores?.teleopSpecimenLow?.toString()}
							/>
						</div>

						<div class="hstack s8">
							<ResultsScoreBadge
								alliance="blue"
								score={data.params?.blueScores?.teleopSpecimenHigh?.toString()}
								otherAllianceScore={data.params?.redScores?.teleopSpecimenHigh?.toString()}
							/>
							<ResultsScoreElementText text="High Chamber Specimen" />
							<ResultsScoreBadge
								alliance="red"
								score={data.params?.redScores?.teleopSpecimenHigh?.toString()}
								otherAllianceScore={data.params?.blueScores?.teleopSpecimenHigh?.toString()}
							/>
						</div>

						<div class="hstack s8 hcenter vcenter">
							<div class="vstack s8">
								<ResultsLocationBadge
									alliance="blue"
									location={data.params?.blueScores?.robot1Teleop}
									sizeDeterminingLocation={[
										data.params?.blueScores?.robot1Teleop || '',
										data.params?.blueScores?.robot2Teleop || '',
										data.params?.redScores?.robot1Teleop || '',
										data.params?.redScores?.robot2Teleop || ''
									].reduce((a, b) => (b.length > a.length ? b : a))}
								/>
								<ResultsLocationBadge
									alliance="blue"
									location={data.params?.blueScores?.robot2Teleop}
									sizeDeterminingLocation={[
										data.params?.blueScores?.robot1Teleop || '',
										data.params?.blueScores?.robot2Teleop || '',
										data.params?.redScores?.robot1Teleop || '',
										data.params?.redScores?.robot2Teleop || ''
									].reduce((a, b) => (b.length > a.length ? b : a))}
								/>
							</div>

							<ResultsScoreElementText text="Location" />

							<div class="vstack s8">
								<ResultsLocationBadge
									alliance="red"
									location={data.params?.redScores?.robot1Teleop}
									sizeDeterminingLocation={[
										data.params?.blueScores?.robot1Teleop || '',
										data.params?.blueScores?.robot2Teleop || '',
										data.params?.redScores?.robot1Teleop || '',
										data.params?.redScores?.robot2Teleop || ''
									].reduce((a, b) => (b.length > a.length ? b : a))}
								/>
								<ResultsLocationBadge
									alliance="red"
									location={data.params?.redScores?.robot2Teleop}
									sizeDeterminingLocation={[
										data.params?.blueScores?.robot1Teleop || '',
										data.params?.blueScores?.robot2Teleop || '',
										data.params?.redScores?.robot1Teleop || '',
										data.params?.redScores?.robot2Teleop || ''
									].reduce((a, b) => (b.length > a.length ? b : a))}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div></results
	>
</main>

<style lang="scss">
	* {
		z-index: 0;
	}

	main {
		z-index: -2;
	}

	.hidden {
		opacity: 0;
	}

	#top {
		position: absolute;
		bottom: 14.6vw;
		align-items: end;
	}

	#bottom {
		position: absolute;
		bottom: 1.2vw;
		align-items: end;
	}

	shadow-rect {
		position: absolute;
		top: 100%;
		width: 100vw;
		box-shadow: 0 0 12vw 6vw rgba(0, 0, 0, 0.5);
		z-index: -1;
	}

	.shiftUp {
		margin-top: -2vw;
	}
</style>
