import { getCardsCount } from '../helpers';

test('simple addition', () => {
  const results = getCardsCount([
    {values: [2]},
    {values: [3]},
  ])

  expect(results).toHaveLength(1);
  expect(results).toContain(5);
});


test('double additions', () => {

  const results = getCardsCount([
    {values: [2]},
    {values: [1,11]},
  ])

  expect(results).toHaveLength(2);
  expect(results).toContain(3);
  expect(results).toContain(13);
});

test('complex additions', () => {
  const results = getCardsCount([
    {values: [2]},
    {values: [1,11]},
    {values: [3]},
    {values: [1,11]},
  ])

  expect(results).toHaveLength(3);
  expect(results).toContain(7);
  expect(results).toContain(17);
  expect(results).toContain(27);
});

test('blackjack test', () => {
  const results = getCardsCount([
    {values: [10]},
    {values: [1,11]},
  ])

  expect(results).toContain(21);
});

test('result should be in order', () => {
  const results = getCardsCount([
    {values: [1]},
    {values: [11,1]},
  ])

  expect(results[0]).toEqual(2);
  expect(results[1]).toEqual(12);
});
