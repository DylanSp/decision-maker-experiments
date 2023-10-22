import { BasicScenario } from "./scenarios";
import { Ballot, mustCreateBallot } from "./voting/ballot";

export function createRandomizedScenario(numCandidates: number, numVoters: number): BasicScenario<string> {
  const candidates = new Set<string>();
  for (let i = 0; i < numCandidates; i++) {
    const candidate = `candidate${i}`;
    candidates.add(candidate);
  }

  const ballots: Array<Ballot<string>> = [];
  for (let i = 0; i < numVoters; i++) {
    const ballot = createRandomBallot(candidates);
    ballots.push(ballot);
  }

  const scenario: BasicScenario<string> = {
    ballots,
    candidates,
  };

  return scenario;
}

// assumes candidates is non-empty
function createRandomBallot<TCandidate>(candidates: Set<TCandidate>): Ballot<TCandidate> {
  const arr = [...candidates];

  // randomize order of candidates with Fisher-Yates shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    // use (i + 1) instead of i so there's a chance that j = i; see https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#Implementation_errors
    // may not be perfectly random, see https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#Modulo_bias
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return mustCreateBallot(arr);
}
