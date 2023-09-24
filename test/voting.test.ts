import { isNone } from "fp-ts/lib/Option";
import { repeatNTimes } from "../src/utils";
import { Ballot } from "../src/voting/ballot";
import { instantRunoffVote, makeTieResult, makeWinnerResult } from "../src/voting/voting";

// utility for testing - given an array of slates and the number of voters for each slate, create array of all ballots
function constructBallotPool<TCandidate>(
  slatesWithCounts: Array<[Ballot<TCandidate>, number]>,
): Array<Ballot<TCandidate>> {
  const allBallots: Array<Ballot<TCandidate>> = [];

  for (const [slate, numVotes] of slatesWithCounts) {
    const ballotsFromSlate = repeatNTimes(slate, numVotes);
    allBallots.push(...ballotsFromSlate);
  }

  return allBallots;
}

// utility for testing to avoid unnecessary checks for None everywhere
function mustCreateBallot<TCandidate>(rankedCandidates: Array<TCandidate>): Ballot<TCandidate> {
  const possibleBallot = Ballot.createBallot(rankedCandidates);
  if (isNone(possibleBallot)) {
    throw new Error("Unable to construct ballot");
  }

  return possibleBallot.value;
}

describe("Instant-runoff voting algorithm", () => {
  it("Finds the winner in a simple majority", () => {
    const expectedWinner = "A";
    const expectedLoser = "B";

    const winningSlate = mustCreateBallot([expectedWinner, expectedLoser]);
    const losingSlate = mustCreateBallot([expectedLoser, expectedWinner]);

    const ballots = constructBallotPool([
      [winningSlate, 2],
      [losingSlate, 1],
    ]);
    const candidates = new Set([expectedWinner, expectedLoser]);

    const actualResult = instantRunoffVote(candidates, ballots);

    const expectedResult = makeWinnerResult(expectedWinner);
    expect(actualResult).toEqual(expectedResult);
  });

  it("Returns a tied result in a simple tie", () => {
    const candidateA = "A";
    const candidateB = "B";
    const aSlate = mustCreateBallot([candidateA, candidateB]);
    const bSlate = mustCreateBallot([candidateB, candidateA]);
    const ballots = constructBallotPool([
      [aSlate, 1],
      [bSlate, 1],
    ]);
    const candidates = new Set([candidateA, candidateB]);

    const actualResult = instantRunoffVote(candidates, ballots);

    const expectedResult = makeTieResult(candidateA, candidateB);
    expect(actualResult).toEqual(expectedResult);
  });

  it("Should return a candidate with 50% of the vote as the winner, if the other 50% is divided", () => {
    const candidateA = "A";
    const candidateB = "B";
    const candidateC = "C";

    const aSlate = mustCreateBallot([candidateA, candidateB, candidateC]);
    const bSlate = mustCreateBallot([candidateB, candidateC, candidateA]);
    const cSlate = mustCreateBallot([candidateC, candidateB, candidateA]);

    const ballots = constructBallotPool([
      [aSlate, 5],
      [bSlate, 3],
      [cSlate, 2],
    ]);
    const candidates = new Set([candidateA, candidateB, candidateC]);

    const actualResult = instantRunoffVote(candidates, ballots);

    const expectedResult = makeWinnerResult(candidateA);
    expect(actualResult).toEqual(expectedResult);
  });

  it("Should use lower preferences if not decided on the first round", () => {
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

    const actualResult = instantRunoffVote(candidates, ballots);

    // should return "gore" as winner
    // first round - no one has majority, Nader gets eliminated, nader ballots move down to Gore as their new first preference
    // second round - Gore has 5 votes, Bush has 4, Gore has majority
    const expectedResult = makeWinnerResult(gore);
    expect(actualResult).toEqual(expectedResult);
  });
});
