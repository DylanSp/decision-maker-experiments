import { isNone } from "fp-ts/lib/Option";
import { Ballot, validateBallots } from "./ballot";

type VoteResult<TCandidate> =
  | {
      // assumes tie is only between two candidates;
      // if we need to account for more, replace winnerA and winnerB with winners: Array<TCandidate>
      kind: "tie";
      winnerA: TCandidate;
      winnerB: TCandidate;
    }
  | {
      kind: "winner";
      winner: TCandidate;
    };

export function makeWinnerResult<TCandidate>(winner: TCandidate): VoteResult<TCandidate> {
  return {
    kind: "winner",
    winner,
  };
}

export function makeTieResult<TCandidate>(winnerA: TCandidate, winnerB: TCandidate): VoteResult<TCandidate> {
  return {
    kind: "tie",
    winnerA,
    winnerB,
  };
}

function tallyFirstPreferences<TCandidate>(
  candidates: Set<TCandidate>,
  ballots: Array<Ballot<TCandidate>>,
): Map<TCandidate, number> {
  // using a Map<TCandidate, number> is the best solution for arbitrary TCandidates, or even TCandidate extends string;
  // everything else loses type safety somewhere
  const talliedVotes = new Map([...candidates].map((candidate) => [candidate, 0]));

  for (const ballot of ballots) {
    const firstPreference = ballot.getFirstPreference();
    const currentTallyForCandidate = talliedVotes.get(firstPreference) ?? 0;
    talliedVotes.set(firstPreference, currentTallyForCandidate + 1);
  }
  return talliedVotes;
}

export function instantRunoffVote<TCandidate>(
  candidates: Set<TCandidate>,
  initialBallots: Array<Ballot<TCandidate>>, // ballots can't be a Set, duplicate ballots are expected
): VoteResult<TCandidate> {
  if (!validateBallots(candidates, initialBallots)) {
    throw new Error("Invalid ballots");
  }

  const candidatesRemaining = new Set([...candidates]); // by-value copy of candidates, so we can mutate this freely
  let ballots = [...initialBallots]; // mutable copy of initialBallots - will be modified with updated ballots as candidates are removed

  while (true) {
    // console.log("Starting round");

    const talliedVotes = tallyFirstPreferences(candidatesRemaining, ballots);
    // console.log("talliedVotes:");
    // console.log(talliedVotes);

    const sortedVotes = [...talliedVotes].sort(
      ([, numVotesA], [, numVotesB]) => numVotesB - numVotesA, // sorts in descending order
    );
    const [firstCandidate, votesForFirstCandidate] = sortedVotes[0];
    // console.log("sortedVotes:");
    // console.log(sortedVotes);
    // console.log(sortedVotes[0]);

    // if there's a majority, we have a single winner
    if (votesForFirstCandidate > ballots.length / 2) {
      return {
        kind: "winner",
        winner: firstCandidate,
      };
    }

    // check for the first candidate having exactly 50% of the votes (can only happen if number of ballots is even)
    if (ballots.length % 2 == 0 && votesForFirstCandidate === ballots.length / 2) {
      const [secondCandidate, votesForSecondCandidate] = sortedVotes[1];

      // if there's a tie between two candidates who each have 50% of the votes
      if (votesForSecondCandidate === votesForFirstCandidate) {
        return {
          kind: "tie",
          winnerA: firstCandidate,
          winnerB: secondCandidate,
        };
      }

      // if the second candidate has less than 50%, count first candidate as winner
      // IMPORTANT - this assumes that a candidate with exactly 50% of the votes can win, if no competitor also has 50%
      return {
        kind: "winner",
        winner: firstCandidate,
      };
    }

    // no majority candidate; eliminate last place candidate, then loop

    // non-null assertion should be safe, but TODO - check
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [leastPopularCandidate] = sortedVotes.at(-1)!;
    candidatesRemaining.delete(leastPopularCandidate);

    // TODO - with a proper Option type and FP library, this could potentially be rewritten as:
    // 1. map ballots (ballot => ballot.removeElement(leastPopularCandidate)) - Array<Option<Ballot<TCandidate>>>
    // 2. do whatever transform converts Array<Option<>> into Option<Array<>>
    // 2a. (in Haskell terms, looks like this is `traverse`)
    // 2b. ChatGPT-provided example with fp-ts: https://chat.openai.com/share/ae0412b2-aeba-495e-89c0-df38f9798080
    // 2c. probably don't need pipe(), just call array.traverse(Option)(ballot => ballot.removeElement(leastPopularCandidate))(ballots)
    // 3. check Option<Array<Ballot<TCandidate>>>, throw error if None, otherwise assign ballots = newBallots
    const newBallots: Array<Ballot<TCandidate>> = [];
    for (const ballot of ballots) {
      const updatedBallot = ballot.removeElement(leastPopularCandidate);
      if (isNone(updatedBallot)) {
        throw new Error("Invariant violated - all candidates were removed from a ballot before finding a winner");
      }
      newBallots.push(updatedBallot.value);
    }
    ballots = newBallots;
  }
}
