import BlackjackEngine, { EngineState, BlackjackActions } from '../index';

import { ICardPicker, CardsEmum, Card } from '../deck';

const CARD_KING = {name: CardsEmum.KING, values: [10]};
const CARD_AS  = {name: CardsEmum.AS, values: [1, 11]};
const CARD_SEVEN  = {name: CardsEmum.SEVEN, values: [7]};

export class MockSequenceCardPicker implements ICardPicker {
  private idx_seq: number = 0;

  constructor(private seq: Card[]) {}

  getCards() {
    return [];
  }
  setCards() {}

  dealCard() {
    return this.seq[(this.idx_seq++) % this.seq.length];
  }
}

test('BlackJack Engine should throw when player do not deposit enough', () => {
  const engine = new BlackjackEngine();
  expect(() =>
    engine
      .deposit(200)
      .placeBet(100)
      .placeBet(150)
  ).toThrowError(/insufficient balance/i);
});

test('BlackJack Engine should being able to place bets', () => {
  const engine = new BlackjackEngine();
  const {balance, bets, state} = engine
    .deposit(200)
    .placeBet(100)
    .placeBet(50)
    .getState()

  expect(bets).toHaveLength(2);
  expect(bets[0].cards).toHaveLength(0);
  expect(balance).toBe(50);
  expect(state).toBe(EngineState.BETTING);
  expect(bets).toMatchSnapshot();
});

test('BlackJack Engine should being able to deal', () => {
  const engine = new BlackjackEngine();
  const stateEngine = engine
    .deposit(200)
    .placeBet(50)
    .deal()
  const {balance, bets, state} = stateEngine;

  expect(bets[0].cards).toHaveLength(2);
});

test('BlackJack Engine should throw dealing twice', () => {
  const engine = new BlackjackEngine();
  expect(() => {
    engine
      .deposit(200)
      .placeBet(50)
      .deal()

    engine.deal();
  }).toThrowError(/already dealt/i);
});

test('BlackJack Engine should deal 1 card to the dealer and 2 to each player', () => {
  const engine = new BlackjackEngine(undefined, new MockSequenceCardPicker([
    CARD_KING,
  ]));

  const {houseHand, bets} = engine
    .deposit(200)
    .placeBet(30)
    .placeBet(40)
    .deal()


  expect(houseHand.cards).toHaveLength(1);
  bets.forEach(bet => {
    expect(bet.cards).toHaveLength(2);
  });

});

test('BlackJack Engine should make player win without playing if he blackjack', () => {
  const engine = new BlackjackEngine(undefined, new MockSequenceCardPicker([
    CARD_KING, // house

    CARD_AS, //player card 1
    CARD_KING, //player card 2
  ]));

  const results = engine
    .deposit(200)
    .placeBet(30)
    .deal()

  expect(results.state).toBe(EngineState.DONE);
  expect(results.balance).toBe(245);
});

test('BlackJack Engine should being to stand to end the game', () => {
  const engine = new BlackjackEngine(undefined, new MockSequenceCardPicker([
    CARD_KING,
  ]));

  engine
    .deposit(200)
    .placeBet(30)
    .placeBet(40)
    .deal()

  engine.action(BlackjackActions.STAND);
  const results = engine.action(BlackjackActions.STAND);

  expect(results.state).toBe(EngineState.DONE);
});

test('BlackJack Engine should stay in progress while game is not over', () => {
  const engine = new BlackjackEngine(undefined, new MockSequenceCardPicker([
    CARD_KING,
  ]));

  engine
    .deposit(200)
    .placeBet(30)
    .placeBet(40)
    .deal()

  const results = engine.action(BlackjackActions.STAND);

  expect(results.state).toBe(EngineState.PLAYING);
});

test('BlackJack Engine should finish bet when using double', () => {
  const engine = new BlackjackEngine(undefined, new MockSequenceCardPicker([
    CARD_KING,
  ]));

  engine
    .deposit(200)
    .placeBet(30)
    .placeBet(40)
    .deal()

  engine.action(BlackjackActions.DOUBLE);
  const results = engine.action(BlackjackActions.DOUBLE);

  expect(results.state).toBe(EngineState.DONE);
});

test('BlackJack double should decrease the player balance', () => {
  const engine = new BlackjackEngine(undefined, new MockSequenceCardPicker([
    CARD_KING,
  ]));

  engine
    .deposit(200)
    .placeBet(30)
    .placeBet(40)
    .deal()

  const results = engine.action(BlackjackActions.DOUBLE);

  expect(results.state).toBe(EngineState.PLAYING);
  expect(results.balance).toBe(100);
});
