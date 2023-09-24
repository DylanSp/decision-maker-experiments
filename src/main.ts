import { constructBallotPool, mustCreateBallot } from "./voting/ballot";
import { VoteConfiguration, instantRunoffVote } from "./voting/voting";

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

const config: VoteConfiguration = {
  logToConsole: true,
  checkForFiftyPercentWinners: false,
  checkForLastPlaceTies: false,
};

const result = instantRunoffVote(candidates, ballots, config);

// should return "gore" as winner
// first round - no one has majority, Nader gets eliminated, nader ballots move down to Gore as their new first preference
// second round - Gore has 5 votes, Bush has 4, Gore has majority
console.log(result);
