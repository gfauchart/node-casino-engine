import RouletteEngine, { SlotBetType } from '../index';

const playerId = '112233';

test('Roulette Engine', () => {
  const engine = new RouletteEngine();

  const serialized = engine
    .registerPlayer({playerId, balance: 110 })
    .placeBet(playerId, {type : SlotBetType.Straight, value: 2, amount: 2})
    .serialize();

  const bets = new RouletteEngine(serialized).getBets()

  expect(bets).toHaveLength(1);
  expect(bets).toMatchSnapshot();
});
