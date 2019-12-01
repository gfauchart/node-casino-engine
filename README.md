# node-casino-engines


## Roulette engine
```
import RouletteEngine, { SlotBetType } from '../index';

const engine = new RouletteEngine();

const { bets } = engine
  .registerPlayer({playerId: '1', balance: 100 })
  .placeBet('1', {type : SlotBetType.Straight, value: 0, amount: 5})
  .placeBet('1', {type : SlotBetType.Red, amount: 5})
  .placeBet('1', {type : SlotBetType.Black, amount: 5})
  .spin();
 ```
 
 
 ### Resume a game from serialized token
 
 ```
import RouletteEngine, { SlotBetType } from '../index';

const engine = new RouletteEngine();

const serialToken = engine
  .registerPlayer({playerId: '1', balance: 100 })
  .placeBet('1', {type : SlotBetType.Straight, value: 0, amount: 5})
  .serialize();
   
(new RouletteEngine(serialToken))
  .placeBet('1', {type : SlotBetType.Red, amount: 5})
  .placeBet('1', {type : SlotBetType.Black, amount: 5})
  .spin();
 ```
 
