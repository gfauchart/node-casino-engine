import BlackjackEngine, { EngineState } from '../index';

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

// test('BlackJack Engine should being able to deal', () => {
//   const engine = new BlackjackEngine();
//
//   engine
//     .deposit(200)
//     .placeBet(50)
//     .deal()
//
//   engine.action()
//
//   expect(bets[0].cards).toHaveLength(2);
// });
