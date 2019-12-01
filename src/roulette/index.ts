import LZUTF8  from 'lzutf8'

export enum SlotColor {
  Red,
  Black,
  Green,
}

export enum SlotBetType {
  Straight = 'Straight',
  Odd = 'Odd',
  Even = 'Even',
  Red = 'Red',
  Black = 'Black',
}


interface RouletteSlotBet {
  type: SlotBetType;
  value?: number | number[];
  amount: number;
}

interface RouletteSlot {
  number: number;
  color: SlotColor;
}

const Wheel : RouletteSlot[] = [
  {number : 0, color: SlotColor.Green},
  {number : 1, color: SlotColor.Red},
  {number : 2, color: SlotColor.Black},
  {number : 3, color: SlotColor.Red},
  {number : 4, color: SlotColor.Black},
  {number : 5, color: SlotColor.Red},
  {number : 6, color: SlotColor.Black},
  {number : 7, color: SlotColor.Red},
  {number : 8, color: SlotColor.Black},
  {number : 9, color: SlotColor.Red},
  {number : 10, color: SlotColor.Black},
  {number : 11, color: SlotColor.Black},
  {number : 12, color: SlotColor.Red},
  {number : 13, color: SlotColor.Black},
  {number : 14, color: SlotColor.Red},
  {number : 15, color: SlotColor.Black},
  {number : 16, color: SlotColor.Red},
  {number : 17, color: SlotColor.Black},
  {number : 18, color: SlotColor.Red},
  {number : 19, color: SlotColor.Red},
  {number : 20, color: SlotColor.Black},
  {number : 21, color: SlotColor.Red},
  {number : 22, color: SlotColor.Black},
  {number : 23, color: SlotColor.Red},
  {number : 24, color: SlotColor.Black},
  {number : 25, color: SlotColor.Red},
  {number : 26, color: SlotColor.Black},
  {number : 27, color: SlotColor.Red},
  {number : 28, color: SlotColor.Black},
  {number : 29, color: SlotColor.Black},
  {number : 30, color: SlotColor.Red},
  {number : 31, color: SlotColor.Black},
  {number : 32, color: SlotColor.Red},
  {number : 33, color: SlotColor.Black},
  {number : 34, color: SlotColor.Red},
  {number : 35, color: SlotColor.Black},
  {number : 36, color: SlotColor.Red},
]

interface RoulettePlayer {
  playerId: string;
  balance: number;
}

interface RouletteBet {
  playerId: string;
  amount: number;
  winningSlots: RouletteSlot[];
  multiplier: number;
  won?: boolean;
}

interface RouletteResult {
  slot: RouletteSlot;
  players: RoulettePlayer[];
  bets: RouletteBet[];
}

export default class RouletteEngine {

  private players: RoulettePlayer[] = [];
  private bets: RouletteBet[] = [];

  constructor(serialized? : string) {
    if (serialized) {
      const decompressed = LZUTF8.decompress(serialized, {
        inputEncoding : "Base64",
        outputEncoding : "String",
      });

      const {players, bets} = JSON.parse(decompressed);
      this.players = players;
      this.bets = bets;
    }
  }

  public registerPlayer(player : RoulettePlayer) : RouletteEngine {
    const {balance, playerId} = player;

    if (balance <= 0) {
      throw new Error(`Invalid player ${playerId} balance`);
    }

    if (this.players.find(p => p.playerId === playerId)) {
      throw new Error(`Player ${playerId} already exist`);
    }

    this.players.push(player);
    return this;
  }

  public placeBet(playerId: string, bet : RouletteSlotBet) : RouletteEngine {
    var multiplier = 1;
    const player = this.players.find(p => p.playerId == playerId);

    if (!player) {
      throw new Error(`Player ${playerId} is not registered`);
    }

    let winningSlots : RouletteSlot[] = [];

    if (bet.type === SlotBetType.Straight) {
      const slot = Wheel.find(w => w.number === bet.value);
      if (!slot) {
        throw new Error(`invalid slot ${bet.value}`);
      }
      winningSlots = [slot]
      multiplier = 35;
    } else if (bet.type === SlotBetType.Red || bet.type === SlotBetType.Black) {
      winningSlots = Wheel.filter(w => w.color === (bet.type === SlotBetType.Red ? SlotColor.Red : SlotColor.Black));
      multiplier = 1;
    } else if (bet.type === SlotBetType.Odd || bet.type === SlotBetType.Even) {
      winningSlots = Wheel
        .filter(w => w.number !== 0)
        .filter(w => w.number % 2 === (bet.type === SlotBetType.Odd ? 0 : 1));
      multiplier = 1;
    } else {
      throw new Error(`invalid bet`);
    }

    if (player.balance < bet.amount ) {
      throw new Error(`Player do not have enough funds`);
    }
    player.balance -= bet.amount;

    this.bets.push({
      playerId,
      amount: bet.amount,
      winningSlots,
      multiplier,
    })

    return this;
  }

  public getBets() : RouletteBet[] {
    return this.bets;
  }


  public spin() : RouletteResult {
    const draft : RouletteSlot = Wheel[Math.floor(Wheel.length * Math.random())];

    this.bets.forEach(b => {
      b.won = !!b.winningSlots.find(s => s.number === draft.number);
      if (b.won) {
        const player = this.players.find(p => p.playerId === b.playerId);
        if (player) {
          player.balance += (b.amount + (b.amount * b.multiplier));
        }
      }
    })

    return {
      slot: draft,
      players: this.players,
      bets: this.bets,
    };
  }


  public serialize() : string {
    const payload = JSON.stringify({
       player: this.players,
       bets: this.bets,
    });
    return LZUTF8.compress(payload, { outputEncoding : "Base64" });
  }

}
