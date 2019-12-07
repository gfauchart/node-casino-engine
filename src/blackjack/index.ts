import LZUTF8  from 'lzutf8'
import { getCardsCount } from './helpers';
import CardPicker, { ICardPicker, Card }  from './deck';

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
  houseHand: BlackjackBet;
  bets : BlackjackBet[];
  currentBet?: BlackjackBet;
  balance : number;
}


export default class BlackjackEngine {

  private state = EngineState.BETTING;
  private bets : BlackjackBet[] = []
  private balance : number = 0;
  private picker : ICardPicker;

  private houseHand : BlackjackBet = {
    cards: [],
    count: [0],

    //unessary
    completed: false,
    amount: 0,
  }

  constructor(serialized? : string, pickerInstance : ICardPicker = new CardPicker()) {
    this.picker = pickerInstance;
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

      this.picker.setCards(cards);
      this.state = state;
      this.bets = bets;
      this.balance = balance;
      this.houseHand = houseHand;
    }

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
      houseHand: this.houseHand,
      state: this.state,
      bets: this.bets,
      currentBet: this.getCurrentBet(),
      balance: this.balance,
    }
  }

  deal() : BlackjackGameState {
    if (this.state === EngineState.BETTING) {

      let houseHand = this.houseHand;
      houseHand.cards.push(this.picker.dealCard());
      houseHand.count = getCardsCount(houseHand.cards);

      this.bets.forEach((bet) => {
        bet.cards.push(this.picker.dealCard());
        bet.cards.push(this.picker.dealCard());

        bet.count = getCardsCount(bet.cards);
        if (bet.count.indexOf(21) >= 0) {
          bet.completed = true;
          bet.won = BlackjackWonState.WON;
          this.balance += (bet.amount) + ((bet.amount) * 1.5)
        }
      })

      this.state = EngineState.PLAYING;
    } else {
      throw new Error('game is already dealt');
    }
    this.finaliseGameIfNeeded(); // all player could blackjack
    return this.getState();
  }

  action(name: BlackjackActions) {

    const currentBet = this.getCurrentBet();
    if (currentBet && this.state === EngineState.PLAYING) {

      if (name === BlackjackActions.STAND) {
        currentBet.completed = true;
      } else if (name === BlackjackActions.HIT) {
        currentBet.cards.push(this.picker.dealCard());
      } else if (name === BlackjackActions.DOUBLE) {
        if (currentBet.amount > this.balance) {
          throw new Error('double is not allowed');
        }
        this.balance -= currentBet.amount;
        currentBet.amount *= 2;
        currentBet.cards.push(this.picker.dealCard());
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

      while (houseHand.count[houseHand.count.length - 1] < 16) {
        houseHand.cards.push(this.picker.dealCard());
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
       cards: this.picker.getCards(),
       state: this.state,
       bets: this.bets,
       balance: this.balance,
       houseHand: this.houseHand,
    });
    return LZUTF8.compress(payload, { outputEncoding : "Base64" });
  }

}
