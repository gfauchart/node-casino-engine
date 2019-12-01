import RouletteEngine, { SlotBetType } from '../index';

const playerId = '112233';

test('Roulette Engine should throw when player is not registered', () => {
  const engine = new RouletteEngine();
  expect(() =>
    engine.placeBet(playerId, {type : SlotBetType.Straight, value: 2, amount: 2})
  ).toThrowError(/not registered/i);
});

test('Roulette Engine should throw when player does not have enough fund', () => {
  const engine = new RouletteEngine();
  expect(() =>
    engine
      .registerPlayer({playerId, balance: 100 })
      .placeBet(playerId, {type : SlotBetType.Straight, value: 2, amount: 60})
      .placeBet(playerId, {type : SlotBetType.Straight, value: 2, amount: 60})
  ).toThrowError(/do not have enough funds/i);
});

test('Roulette Engine should throw when player is placing a bet on an invalid slot', () => {
  const engine = new RouletteEngine();
  expect(() =>
    engine
      .registerPlayer({playerId, balance: 100 })
      .placeBet(playerId, {type : SlotBetType.Straight, value: 45, amount: 60})
  ).toThrowError(/invalid slot/i);
});

test('Roulette Engine spin should return bets', () => {
  const engine = new RouletteEngine();
  const bets  = engine
    .registerPlayer({playerId, balance: 100 })
    .placeBet(playerId, {type : SlotBetType.Odd, amount: 5})
    .placeBet(playerId, {type : SlotBetType.Even, amount: 5})
    .getBets();

  expect(bets).toHaveLength(2);
  expect(bets).toMatchSnapshot();
});

test('Roulette Engine spin should return bets', () => {
  const engine = new RouletteEngine();
  const bets  = engine
    .registerPlayer({playerId, balance: 100 })
    .placeBet(playerId, {type : SlotBetType.Red, amount: 5})
    .placeBet(playerId, {type : SlotBetType.Black, amount: 5})
    .getBets();

  expect(bets).toHaveLength(2);
  expect(bets).toMatchSnapshot();
});

test('Roulette Engine spin should return only 1 win when betting on odd, even and 0', () => {
  const engine = new RouletteEngine();
  const { bets } = engine
    .registerPlayer({playerId, balance: 100 })
    .placeBet(playerId, {type : SlotBetType.Straight, value: 0, amount: 5})
    .placeBet(playerId, {type : SlotBetType.Odd, amount: 5})
    .placeBet(playerId, {type : SlotBetType.Even, amount: 5})
    .spin();
  const winningBets = bets.filter(b => b.won)
  const lostBets = bets.filter(b => !b.won)
  expect(winningBets).toHaveLength(1);
  expect(lostBets).toHaveLength(2);
});

test('Roulette Engine spin should return only 1 win when betting on red, black and 0', () => {
  const engine = new RouletteEngine();
  const { bets } = engine
    .registerPlayer({playerId, balance: 100 })
    .placeBet(playerId, {type : SlotBetType.Straight, value: 0, amount: 5})
    .placeBet(playerId, {type : SlotBetType.Red, amount: 5})
    .placeBet(playerId, {type : SlotBetType.Black, amount: 5})
    .spin();
  const winningBets = bets.filter(b => b.won)
  const lostBets = bets.filter(b => !b.won)
  expect(winningBets).toHaveLength(1);
  expect(lostBets).toHaveLength(2);
});
