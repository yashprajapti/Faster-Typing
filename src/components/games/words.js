// Word pools by difficulty. Games move to the next pool as the player improves.
export const WORDS = [
  ['cat', 'dog', 'sun', 'map', 'pen', 'hat', 'cup', 'box', 'fan', 'bag', 'red', 'big', 'run', 'sit', 'fox', 'egg', 'ice', 'key', 'sky', 'bus', 'tea', 'wind', 'frog', 'milk', 'leaf'],
  ['apple', 'happy', 'water', 'garden', 'school', 'paper', 'window', 'friend', 'orange', 'pencil', 'jungle', 'planet', 'rocket', 'castle', 'bridge', 'coffee', 'dragon', 'forest', 'puzzle', 'silver'],
  ['keyboard', 'practice', 'journey', 'pattern', 'balance', 'context', 'quality', 'culture', 'village', 'thunder', 'mystery', 'fashion', 'quarter', 'shadow', 'gravity', 'horizon', 'lantern'],
  ['accurate', 'velocity', 'algorithm', 'dedication', 'hypothesis', 'resilient', 'strategy', 'precision', 'challenge', 'momentum', 'brilliant', 'extraordinary', 'concentrate'],
];
export const tierFor = (n) => WORDS[Math.min(WORDS.length - 1, n)];
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const LETTERS = {
  home: 'asdfjkl'.split(''),
  top: 'qwertyuiop'.split(''),
  all: 'abcdefghijklmnopqrstuvwxyz'.split(''),
};
