import { allScenarios } from "./scenarios";
import { VoteConfiguration, VoteMetadata, instantRunoffVote } from "./voting/voting";

function printReport<TCandidate>(metadata: VoteMetadata<TCandidate>) {
  if (!metadata.exactlyFiftyPercentWinnerPresent && metadata.lastPlaceTies.length === 0) {
    console.log("No exactly 50% winner present, no last place ties");
    return;
  }

  if (metadata.exactlyFiftyPercentWinnerPresent) {
    console.log("Winner won with exactly 50% of votes");
  }

  if (metadata.lastPlaceTies.length === 0) {
    console.log("No last-place ties");
  } else {
    for (const lastPlaceTie of metadata.lastPlaceTies) {
      console.log(`Last-place tie in round ${lastPlaceTie.round}`);
      console.log(
        `Least popular candidates: ${lastPlaceTie.leastPopularCandidates}` /*, lastPlaceTie.leastPopularCandidates*/,
      );
      console.log(`Removed candidate: ${lastPlaceTie.removedCandidate}`);
      console.log();
    }
  }
}

const config: VoteConfiguration = {
  logToConsole: true,
  checkForFiftyPercentWinners: false,
  checkForLastPlaceTies: true,
};

const scenario = allScenarios.lastPlaceTie;

const [result, metadata] = instantRunoffVote(scenario.candidates, scenario.ballots, config);

console.log(result);
console.log();
printReport(metadata);
