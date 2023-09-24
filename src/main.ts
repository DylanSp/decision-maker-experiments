import { Ballot, constructBallotPool, mustCreateBallot } from "./voting/ballot";
import { VoteConfiguration, instantRunoffVote } from "./voting/voting";

type BasicScenario<TCandidate> = {
  candidates: Set<TCandidate>;
  ballots: Array<Ballot<TCandidate>>;
};

// should return "gore" as winner
// first round - no one has majority, Nader gets eliminated, nader ballots move down to Gore as their new first preference
// second round - Gore has 5 votes, Bush has 4, Gore has majority
function secondPreferenceScenario(): BasicScenario<string> {
  const bush = "bush";
  const gore = "gore";
  const nader = "nader";

  const bushSlate = mustCreateBallot([bush, gore, nader]);
  const goreSlate = mustCreateBallot([gore, nader, bush]);
  const naderSlate = mustCreateBallot([nader, gore, bush]);

  const ballots = constructBallotPool([
    [bushSlate, 4],
    [goreSlate, 3],
    [naderSlate, 2],
  ]);
  const candidates = new Set([bush, gore, nader]);

  return {
    candidates,
    ballots,
  };
}

const config: VoteConfiguration = {
  logToConsole: true,
  checkForFiftyPercentWinners: false,
  checkForLastPlaceTies: false,
};

const scenario = secondPreferenceScenario();

const [result, metadata] = instantRunoffVote(scenario.candidates, scenario.ballots, config);

console.log(result);
console.log();
console.log(metadata);
