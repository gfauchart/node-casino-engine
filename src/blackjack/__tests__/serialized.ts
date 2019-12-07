import BlackjackEngine, { EngineState, BlackjackActions } from '../index';


test('BlackJack Engine serialize to return a string', () => {
  const engine = new BlackjackEngine();
  engine
    .deposit(200)
    .placeBet(50)
    .deal()

  expect(typeof engine.serialize()).toBe('string');
});
