import CardPicker, { CardsEmum } from '../deck';

test('should have 52 cards with one deck', () => {
  const picker = new CardPicker(1);

  expect(picker.getCards()).toHaveLength(52);
});

test('should have loose a card after draw', () => {
  const picker = new CardPicker(1);

  expect(picker.getCards()).toHaveLength(52);
  picker.dealCard();
  expect(picker.getCards()).toHaveLength(51);
});

test('should being able to set cards', () => {
  const picker = new CardPicker(1);
  const card = {name: CardsEmum.KING, values: [10]}

  picker.setCards([card]);
  expect(picker.dealCard()).toBe(card);
  expect(picker.getCards()).toHaveLength(0);
});
