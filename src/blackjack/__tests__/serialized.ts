import BlackjackEngine, { EngineState, BlackjackActions } from '../index';

test('BlackJack Engine serialize to return a string', () => {
  const engine = new BlackjackEngine();
  engine
    .deposit(200)
    .placeBet(50)
    .deal()

  expect(typeof engine.serialize()).toBe('string');
});

test('BlackJack Engine serialize should preserve state through process', () => {
  const engine = new BlackjackEngine();

  engine
    .deposit(200)
    .placeBet(50)
    .placeBet(50)
    .placeBet(50)
    .deal();

  engine.action(BlackjackActions.STAND);

  const engineSerialized = new BlackjackEngine(engine.serialize());
  expect(engineSerialized.getState()).toStrictEqual(engine.getState());
});
