import { createRandomizedScenario } from "./randomScenarios";
import { VoteConfiguration, VoteMetadata, VoteResult, instantRunoffVote } from "./voting/voting";

// TODO - probably extract some of this into separate file
// TODO - probably reorganize presentation logic some

const ITERATIONS = 1000;

const config: VoteConfiguration = {
  logToConsole: false,
  checkForFiftyPercentWinners: true,
  checkForLastPlaceTies: true,
};

function runSingleScenario(numCandidates: number, numVoters: number): [VoteResult<string>, VoteMetadata<string>] {
  const scenario = createRandomizedScenario(numCandidates, numVoters);
  return instantRunoffVote(scenario.candidates, scenario.ballots, config);
}

type SimulationReport = {
  probabilityOfTie: number;
  probabilityOfWinnerWithExactlyFiftyPercent: number;
  probabilityOfLastPlaceTie: number;
};

// TODO - "scenario" is somewhat misused here; this uses it just to mean (numCandidates, numVoters),
// TODO - everywhere else in the code, "scenario" includes a ballot pool
// TODO - adjust wording to eliminate ambiguity
function simulateScenario(numCandidates: number, numVoters: number): SimulationReport {
  let tiedResults = 0;
  let winnersWithExactlyFiftyPercent = 0;
  let votesWithLastPlaceTies = 0; // number of votes with at least one last-place tie in them

  for (let i = 0; i < ITERATIONS; i++) {
    const [result, metadata] = runSingleScenario(numCandidates, numVoters);

    if (result.kind === "tie") {
      tiedResults++;
    }

    if (metadata.exactlyFiftyPercentWinnerPresent) {
      winnersWithExactlyFiftyPercent++;
    }

    if (metadata.lastPlaceTies.length > 0) {
      votesWithLastPlaceTies++;
    }
  }

  return {
    probabilityOfTie: tiedResults / ITERATIONS,
    probabilityOfWinnerWithExactlyFiftyPercent: winnersWithExactlyFiftyPercent / ITERATIONS,
    probabilityOfLastPlaceTie: votesWithLastPlaceTies / ITERATIONS,
  };
}

function formatProbabilityAsPercentage(prob: number): string {
  // TODO - adjust this when I tune ITERATIONS
  // if ITERATIONS=100, all percentages will be whole numbers
  // if ITERATIONS=1000, all percentages will have at most one digit after decimal point
  const DIGITS_AFTER_DECIMAL_POINT = 1;
  return `${(prob * 100).toFixed(DIGITS_AFTER_DECIMAL_POINT)}%`;
}

const possibleNumCandidates = [3, 4, 5, 6, 7];
const possibleNumVoters = [3, 4, 5, 6];

// TODO - improve presentation (maybe in separate function/file)
// TODO - potentially display this as tables, with numCandidates on one axis, numVoters on the other?
// (would probably have three tables, one for each field in simulationReport)
for (const numCandidates of possibleNumCandidates) {
  for (const numVoters of possibleNumVoters) {
    const simulationReport = simulateScenario(numCandidates, numVoters);
    console.log(`Report for ${numVoters} voters with ${numCandidates} candidates`);
    console.log(`Tied result: ${formatProbabilityAsPercentage(simulationReport.probabilityOfTie)}`);

    // TODO - only really need to report this when numVoters is even (otherwise, will always be 0%)
    // TODO - if I modify this function to return a data structure and put presentation elsewhere, presentation logic should be responsible for not displaying this for odd numVoters
    console.log(
      `Winner had exactly 50% of votes: ${formatProbabilityAsPercentage(
        simulationReport.probabilityOfWinnerWithExactlyFiftyPercent,
      )}`,
    );

    console.log(
      `Last place tie occurred: ${formatProbabilityAsPercentage(simulationReport.probabilityOfLastPlaceTie)}`,
    );
    console.log();
  }
}
