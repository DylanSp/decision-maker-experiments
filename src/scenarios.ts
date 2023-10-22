import { Ballot, constructBallotPool, mustCreateBallot } from "./voting/ballot";

export type BasicScenario<TCandidate> = {
  candidates: Set<TCandidate>;
  ballots: Array<Ballot<TCandidate>>;
};

// should return "gore" as winner
// first round - no one has majority, Nader gets eliminated, nader ballots move down to Gore as their new first preference
// second round - Gore has 5 votes, Bush has 4, Gore has majority
export function secondPreferenceScenario(): BasicScenario<string> {
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

// should return "B" as winner, logging one instance of a last place tie
// first round - no one has a majority (A has 5/13), candidates C and D should be tied for last-place vote
// regardless of whether it's C or D that gets removed, the slate for that candidate moves down to B
// second round - no one has majority (B has 6/13), surviving C/D candidate is removed, slate for that candidate moves down to B
// third round - B has majority (8/13)
export function lastPlaceTieScenario(): BasicScenario<string> {
  const candidateA = "A";
  const candidateB = "B";
  const candidateC = "C";
  const candidateD = "D";
  const candidates = new Set([candidateA, candidateB, candidateC, candidateD]);

  const aSlate = mustCreateBallot([candidateA, candidateB, candidateC, candidateD]);
  const bSlate = mustCreateBallot([candidateB, candidateA, candidateC, candidateD]);
  const cSlate = mustCreateBallot([candidateC, candidateB, candidateD, candidateA]);
  const dSlate = mustCreateBallot([candidateD, candidateB, candidateC, candidateA]);

  const ballots = constructBallotPool([
    [aSlate, 5],
    [bSlate, 4],
    [cSlate, 2],
    [dSlate, 2],
  ]);

  return {
    candidates,
    ballots,
  };
}

export const allScenarios = {
  secondPreference: secondPreferenceScenario(),
  lastPlaceTie: lastPlaceTieScenario(),
};
