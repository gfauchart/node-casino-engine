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

export interface Card {
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

export interface ICardPicker {
  getCards(): Card[];
  setCards(cards: Card[]): void;

  dealCard(): Card;
}


export default class CardPicker implements ICardPicker {

  private cards: Card[];

  constructor(numberOfDecks: number = 4) {
    var cards : Card[] = [];
    const NUMBER_OF_DECK = 4 * numberOfDecks;
    for (var i = 0; i < NUMBER_OF_DECK; i++) {
      cards = cards.concat(DefaultCardsList)
    }

    this.cards = shuffle(cards);
  }

  dealCard() : Card {
    const idx = Math.floor(Math.random()*this.cards.length);
    const card = this.cards[idx];
    this.cards.splice(idx, 1);

    return card;
  }

  getCards() : Card[] {
    return this.cards;
  }
  setCards(cards: Card[]) : void {
     this.cards = cards;
  }

}
