import LZUTF8  from 'lzutf8'
import { shuffle, getCardsCount } from './helpers';

export enum CardsEmum {
  AS = "AS",
  TWO = "TWO",
  THREE = "THREE",
  FOUR = "FOUR",
  FIVE = "FIVE",
  SIX = "SIX",
  SEVEN = "SEVEN",
  EIGHT = "EIGHT",
  NINE = "NINE",
  TEN = "TEN",
  JACK = "JACK",
  QUEEN = "QUEEN",
  KING = "KING",
}

interface Card {
  name: CardsEmum;
  values: number[];
}

const DefaultCardsList = [
  { name : CardsEmum.AS,    values: [1,11] },
  { name : CardsEmum.TWO,   values: [2] },
  { name : CardsEmum.THREE, values: [3] },
  { name : CardsEmum.FOUR,  values: [4] },
  { name : CardsEmum.FIVE,  values: [5] },
  { name : CardsEmum.SIX,   values: [6] },
  { name : CardsEmum.SEVEN, values: [7] },
  { name : CardsEmum.EIGHT, values: [8] },
  { name : CardsEmum.NINE,  values: [9] },
  { name : CardsEmum.TEN,   values: [10] },
  { name : CardsEmum.JACK,  values: [10] },
  { name : CardsEmum.QUEEN, values: [10] },
  { name : CardsEmum.KING,  values: [10] },
]

export enum EngineState {
  BETTING = 0,
  PLAYING = 1,
  DONE = 2,
}

export enum BlackjackActions {
  HIT,
  STAND,
  DOUBLE,
  SPLIT,
}

export enum BlackjackWonState {
  UNKNOWN,
  LOST,
  TIE,
  WON,
}

interface BlackjackBet {
  amount: number;
  cards: Card[];
  completed: boolean;
  count: number[];
  won?: BlackjackWonState;
}


interface BlackjackGameState {
  state : EngineState;
  bets : BlackjackBet[];
  currentBet?: BlackjackBet;
  balance : number;
}


export default class BlackjackEngine {

  private cards: Card[];
  private state = EngineState.BETTING;
  private bets : BlackjackBet[] = []
  private balance : number = 0;

  private houseHand : BlackjackBet = {
    cards: [],
    count: [0],

    //unessary
    completed: false,
    amount: 0,
  }

  constructor(serialized? : string) {
    if (serialized) {
      const decompressed = LZUTF8.decompress(serialized, {
        inputEncoding : "Base64",
        outputEncoding : "String",
      });

      const {
        cards,
        state,
        bets,
        balance,
        houseHand
      } = JSON.parse(decompressed);

      this.cards = cards;
      this.state = state;
      this.bets = bets;
      this.balance = balance;
      this.houseHand = houseHand;
    }

    var cards : Card[] = [];
    const NUMBER_OF_DECK = 16;
    for (var i = 0; i < NUMBER_OF_DECK; i++) {
      cards = cards.concat(DefaultCardsList)
    }

    this.cards = shuffle(cards);
  }

  deposit(newBalance: number) : BlackjackEngine {
    this.balance = newBalance;
    return this;
  }

  placeBet(amount: number) : BlackjackEngine {
    if (amount > this.balance) {
      throw new Error('insufficient balance');
    } else if (this.state === EngineState.BETTING) {
      this.balance -= amount;
      this.bets.push({
        amount,
        cards: [],
        count: [0],
        completed: false,
      })
    } else {
      throw new Error('betting is over now');
    }
    return this;
  }

  clearBets(amount: number): BlackjackEngine  {
    if (this.state === EngineState.BETTING) {
      this.balance += this.bets.reduce((acc, {amount}) => acc + amount, 0);
      this.bets = [];
    } else {
      throw new Error('cannot clear bets after game is started');
    }
    return this;
  }

  private getCurrentBet() {
    return this.bets.find(bet => !bet.completed);
  }

  getState() : BlackjackGameState {
    return {
      state: this.state,
      bets: this.bets,
      currentBet: this.getCurrentBet(),
      balance: this.balance,
    }
  }

  private dealCard() : Card {
    const idx = Math.floor(Math.random()*this.cards.length);
    const card = this.cards[idx];
    this.cards.splice(idx, 1);

    return card;
  }

  deal() : BlackjackGameState {
    if (this.state === EngineState.BETTING) {

      this.bets.forEach((bet) => {
        bet.cards.push(this.dealCard());
        bet.cards.push(this.dealCard());

        bet.count = getCardsCount(bet.cards);
      })

      this.state = EngineState.PLAYING;
    } else {
      throw new Error('game is already dealt');
    }
    return this.getState();
  }

  action(name: BlackjackActions) {

    // HIT,
    // STAND,
    // DOUBLE,
    // SPLIT,

    const currentBet = this.getCurrentBet();
    if (currentBet && this.state === EngineState.PLAYING) {

      if (name === BlackjackActions.STAND) {
        currentBet.completed = true;
      } else if (name === BlackjackActions.HIT) {
        currentBet.cards.push(this.dealCard());
      } else if (name === BlackjackActions.DOUBLE) {
        if (currentBet.amount > this.balance) {
          throw new Error('double is not allowed');
        }
        this.balance -= currentBet.amount;
        currentBet.amount *= 2;
        currentBet.cards.push(this.dealCard());
        currentBet.completed = true;
      } else {
        throw new Error('uknown action');
      }

      currentBet.count = getCardsCount(currentBet.cards);
      if (!currentBet.completed) {

        // blackjack
        if (currentBet.count.indexOf(21) >= 0) {
          currentBet.completed = true;
          if (currentBet.cards.length === 2) {
            currentBet.won = BlackjackWonState.WON;
            this.balance += (currentBet.amount) + ((currentBet.amount) * 1.5)
          }
        }

        // lost
        if (currentBet.count[0] > 21) {
          currentBet.won = BlackjackWonState.LOST;
        }
      }

      this.finaliseGameIfNeeded();
    } else {
      throw new Error('game is not in playing state');
    }

    return this.getState();
  }

  private finaliseGameIfNeeded() {
    const currentBet = this.getCurrentBet();

    if (!currentBet) {
      this.state = EngineState.DONE;

      let houseHand = this.houseHand;
      houseHand.cards.push(this.dealCard());
      houseHand.cards.push(this.dealCard());

      houseHand.count = getCardsCount(houseHand.cards);

      while (houseHand.count[houseHand.count.length - 1] < 16) {
        houseHand.cards.push(this.dealCard());
        houseHand.count = getCardsCount(houseHand.cards);
      }

      var houseScore = houseHand.count[houseHand.count.length - 1];

      this.bets.forEach((bet) => {
        if (typeof bet.won === 'undefined' || bet.won === BlackjackWonState.UNKNOWN) {
          let userScore = bet.count.filter(f => f <= 21).pop();

          if (!userScore) {
            bet.won = BlackjackWonState.LOST;
            return bet;
          }

          if (houseScore > 21) {
            bet.won = BlackjackWonState.WON;
          } else if (houseScore === userScore) {
            bet.won = BlackjackWonState.TIE;
          } else {
            bet.won = houseScore > userScore ? BlackjackWonState.LOST : BlackjackWonState.WON;
          }

          if (bet.won === BlackjackWonState.WON) {
            this.balance += (bet.amount * 2)
          } else if (bet.won === BlackjackWonState.TIE) {
            this.balance += bet.amount;
          }
        }
      })

    }
  }

  public serialize() : string {
    const payload = JSON.stringify({
       cards: this.cards,
       state: this.state,
       bets: this.bets,
       balance: this.balance,
       houseHand: this.houseHand,
    });
    return LZUTF8.compress(payload, { outputEncoding : "Base64" });
  }

}
