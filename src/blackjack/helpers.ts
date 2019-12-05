import Combinatorics  from 'js-combinatorics';


export function shuffle(a: Array<any>) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}


export function getCardsCount(cards: Array<{values: number[]}>) : number[] {
  var counts = [0];

  cards.forEach(({values}) => {
    counts = Combinatorics.cartesianProduct(counts, values)
      .toArray()
      .map(a => a.reduce((acc, v) => acc + v, 0))

    //remove duplicate
    counts = [ ...new Set(counts) ];
  })

  return counts.sort((a,b) => a - b);
}
