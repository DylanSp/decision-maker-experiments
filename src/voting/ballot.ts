import { Option, isNone, none, some } from "fp-ts/lib/Option";
import { areAllElementsDistinct, repeatNTimes } from "../utils";

export class Ballot<TCandidate> {
  private ranking: Array<TCandidate>;

  private constructor(elements: Array<TCandidate>) {
    this.ranking = elements;
  }

  public static createBallot<TCandidate>(ranking: Array<TCandidate>): Option<Ballot<TCandidate>> {
    // check invariants, return None if any are violated:
    // * all members of elements should be unique
    if (!areAllElementsDistinct(ranking)) {
      return none;
    }

    // * should have at least one candidate
    if (ranking.length === 0) {
      return none;
    }

    const ballot = new Ballot(ranking);
    return some(ballot);
  }

  public size(): number {
    return this.ranking.length;
  }

  // assumes that our invariant of having at least one candidate holds
  public getFirstPreference(): TCandidate {
    // TODO - add assertion (how?) that this.ranking.length > 0
    return this.ranking[0];
  }

  private has(item: TCandidate): boolean {
    return this.ranking.some((element) => element === item);
  }

  public ranksAllCandidates(candidates: Set<TCandidate>): boolean {
    if (candidates.size !== this.size()) {
      console.log(`Size mismatch: candidates.size is ${candidates.size}, this.size is ${this.size()}`);
      return false;
    }

    for (const candidate of candidates) {
      if (!this.has(candidate)) {
        console.log(`Doesn't rank candidate ${candidate}`);
        return false;
      }
    }
    return true;
  }

  // doesn't mutate this ballot - returns either a new ballot with at least one entry (but without candidateToRemove), or None for a now-empty ballot
  public removeCandidate(candidateToRemove: TCandidate): Option<Ballot<TCandidate>> {
    const newRanking = this.ranking.filter((candidate) => candidate !== candidateToRemove);
    // TODO - add assertion (how?) that newElements.length = this.elements.length - 1

    return Ballot.createBallot(newRanking);
  }
}

export function validateBallots<TCandidate>(candidates: Set<TCandidate>, ballots: Array<Ballot<TCandidate>>): boolean {
  // must be at least one ballot
  if (ballots.length === 0) {
    console.log("no ballots");
    return false;
  }

  // must be at least one candidate
  if (candidates.size === 0) {
    console.log("no candidates");
    return false;
  }

  // all ballots must be the same size as candidates
  // all ballots must rank every candidate
  return ballots.every((ballot) => ballot.ranksAllCandidates(candidates));
}

// utility function to streamline ballot creation
export function mustCreateBallot<TCandidate>(rankedCandidates: Array<TCandidate>): Ballot<TCandidate> {
  const possibleBallot = Ballot.createBallot(rankedCandidates);
  if (isNone(possibleBallot)) {
    throw new Error("Unable to construct ballot");
  }

  return possibleBallot.value;
}

// utility function to streamline creating all ballots for an election
// given an array of slates and the number of voters for each slate, create array of all ballots
export function constructBallotPool<TCandidate>(
  slatesWithCounts: Array<[Ballot<TCandidate>, number]>,
): Array<Ballot<TCandidate>> {
  const allBallots: Array<Ballot<TCandidate>> = [];

  for (const [slate, numVotes] of slatesWithCounts) {
    const ballotsFromSlate = repeatNTimes(slate, numVotes);
    allBallots.push(...ballotsFromSlate);
  }

  return allBallots;
}
