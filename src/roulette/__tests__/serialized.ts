import RouletteEngine, { SlotBetType } from '../index';

const playerId = '112233';

test('Roulette Engine serialize should remenber bets', () => {
  const engine = new RouletteEngine();

  const serialized = engine
    .registerPlayer({playerId, balance: 110 })
    .placeBet(playerId, {type : SlotBetType.Straight, value: 2, amount: 2})
    .serialize();

  const bets = new RouletteEngine(serialized).getBets()

  expect(bets).toHaveLength(1);
  expect(bets).toMatchSnapshot();
});

test('Roulette Engine serialize should remenber players', () => {
  const engine = new RouletteEngine();

  const serialized = engine
    .registerPlayer({playerId, balance: 110 })
    .placeBet(playerId, {type : SlotBetType.Straight, value: 2, amount: 2})
    .serialize();

  const players = new RouletteEngine(serialized).getPlayers()

  expect(players).toHaveLength(1);
  expect(players).toMatchSnapshot();
});
