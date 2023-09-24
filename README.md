# Experiments for Decision Maker

Repo for experimenting with the instant-runoff voting algorithm I'd like to use for decision-maker.

## Terminology

- "Candidate" - a possible choice in an election
- "Ballot" - a single voter's ranked list of candidates
- "Ballot pool" - all ballots submitted in an election
- "Slate" - a ranked list of candidates that multiple voters copy to create their ballots

## Questions to consider

- Biggest question - does IRV avoid ties enough to be useful?
- How to handle the case where there are multiple candidates with the least number of votes in a single round?
  - Example: Candidate A has 4 votes, Candidate B has 3 votes, Candidate C and Candidate D both have 2 votes. Should both C and D be eliminated? Choose one at random?
- Should a candidate with exactly 50% of the vote be the winner, if the other 50% of votes are divided between different candidates?

## Productionizing

If I have a workable IRV implementation, this code can be used as the base for a production version of a decision-maker site/app. I'd want to:

- Look at the various TODO items to clean up the code.
- Add assertions of various invariants.
- Potentially add property-based testing for `Ballot` class, `instantRunoffVote` function, to make sure invariants hold.
