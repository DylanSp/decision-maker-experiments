import { Applicative, isNone } from "fp-ts/lib/Option";
import { Ballot, validateBallots } from "./ballot";
import { array } from "fp-ts";

export type VoteResult<TCandidate> =
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

// TODO - maybe this should only have logToConsole switch? the checks can be run every time without issues and returned as part of the metadata
// being able to put code for checking last place ties behind an if() statement is nice for organization, but there's no real reason not to always track it
export type VoteConfiguration = {
  logToConsole: boolean;
  checkForFiftyPercentWinners: boolean;
  checkForLastPlaceTies: boolean;
};

const defaultVoteConfig: VoteConfiguration = {
  logToConsole: false,
  checkForFiftyPercentWinners: false,
  checkForLastPlaceTies: false,
};

// report on edge cases
type LastPlaceTie<TCandidate> = {
  round: number;
  leastPopularCandidates: Array<TCandidate>;
  removedCandidate: TCandidate;
  // TODO - track number of votes least popular candidates each attracted?
  // TODO - track number of votes for each candidate in that round?
};

export type VoteMetadata<TCandidate> = {
  exactlyFiftyPercentWinnerPresent: boolean;
  lastPlaceTies: Array<LastPlaceTie<TCandidate>>;
};

export function instantRunoffVote<TCandidate>(
  candidates: Set<TCandidate>,
  initialBallots: Array<Ballot<TCandidate>>, // ballots can't be a Set, duplicate ballots are expected
  config: VoteConfiguration = defaultVoteConfig,
): [VoteResult<TCandidate>, VoteMetadata<TCandidate>] {
  if (!validateBallots(candidates, initialBallots)) {
    throw new Error("Invalid ballots");
  }

  const metadata: VoteMetadata<TCandidate> = {
    exactlyFiftyPercentWinnerPresent: false,
    lastPlaceTies: [],
  };

  const candidatesRemaining = new Set([...candidates]); // by-value copy of candidates, so we can mutate this freely
  let ballots = [...initialBallots]; // mutable copy of initialBallots - will be modified with updated ballots as candidates are removed

  let round = 1;

  while (true) {
    if (config.logToConsole) {
      console.log(`Starting round ${round}`);
    }

    const talliedVotes = tallyFirstPreferences(candidatesRemaining, ballots);
    if (config.logToConsole) {
      console.log("talliedVotes:");
      console.log(talliedVotes);
    }

    const sortedVotes = [...talliedVotes]
      .sort(
        ([, numVotesA], [, numVotesB]) => numVotesB - numVotesA, // sorts in descending order
      )
      .map(([candidate, voteCount]) => ({
        candidate,
        voteCount,
      }));
    const firstVote = sortedVotes[0];
    if (config.logToConsole) {
      console.log("sortedVotes:");
      console.log(sortedVotes);
      console.log("leading candidate:");
      console.log(firstVote.candidate);
    }

    // if there's a majority, we have a single winner
    if (firstVote.voteCount > ballots.length / 2) {
      const result = makeWinnerResult(firstVote.candidate);
      return [result, metadata];
    }

    // check for the first candidate having exactly 50% of the votes (can only happen if number of ballots is even)
    if (ballots.length % 2 == 0 && firstVote.voteCount === ballots.length / 2) {
      const secondVote = sortedVotes[1];

      // if there's a tie between two candidates who each have 50% of the votes, there's a tie
      if (firstVote.voteCount === secondVote.voteCount) {
        const result = makeTieResult(firstVote.candidate, secondVote.candidate);
        return [result, metadata];
      }

      // if the second candidate has less than 50%, count first candidate as winner
      // IMPORTANT - this assumes that a candidate with exactly 50% of the votes can win, if no competitor also has 50%
      const result = makeWinnerResult(firstVote.candidate);
      metadata.exactlyFiftyPercentWinnerPresent = true;

      return [result, metadata];
    }

    // no majority candidate; eliminate last place candidate, then loop
    // IMPORTANT - currently eliminates exactly one last-place candidate, doesn't consider multiple last-place candidates with equal numbers of votes

    // non-null assertion should be safe, but TODO - check
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const lastVote = sortedVotes.at(-1)!;
    candidatesRemaining.delete(lastVote.candidate);
    if (config.logToConsole) {
      console.log("Last-place candidate being removed:");
      console.log(lastVote.candidate);
    }

    // check to see if there were multiple last-place candidates, add to metadata report if there were
    if (config.checkForLastPlaceTies) {
      // TODO - see if there's a way to structure this to avoid non-null assertions
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const secondToLastVote = sortedVotes.at(-2)!;
      if (lastVote.voteCount === secondToLastVote.voteCount) {
        const lastPlaceTie: LastPlaceTie<TCandidate> = {
          round,
          leastPopularCandidates: [lastVote.candidate, secondToLastVote.candidate],
          removedCandidate: lastVote.candidate,
        };

        for (const vote of sortedVotes.toReversed().slice(2)) {
          if (vote.voteCount === lastVote.voteCount) {
            lastPlaceTie.leastPopularCandidates.push(vote.candidate);
          }
        }

        metadata.lastPlaceTies.push(lastPlaceTie);
      }
    }

    // remove the least popular candidate from all ballots; if removeElement() returns None for any ballot, throw error
    // `Applicative` here is the Applicative instance for Option
    // need to specify the type of `ballot` in the lambda because TS can't infer it
    const newBallots = array.traverse(Applicative)((ballot: Ballot<TCandidate>) =>
      ballot.removeCandidate(lastVote.candidate),
    )(ballots);

    if (isNone(newBallots)) {
      throw new Error("Invariant violated - all candidates were removed from a ballot before finding a winner");
    }

    ballots = newBallots.value;
    round++;

    if (config.logToConsole) {
      console.log();
    }
  }
}
