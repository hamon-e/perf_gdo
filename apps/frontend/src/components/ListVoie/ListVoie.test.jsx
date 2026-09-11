import { formatDifficulty, parseDifficulty } from './ListVoie';

describe('route grades', () => {
  test.each([
    [4.25, '4a'],
    [4.35, '4a+'],
    [5.5, '5b'],
    [6.6, '6b+'],
    [7.85, '7c+'],
  ])('displays %s as %s', (storedDifficulty, grade) => {
    expect(formatDifficulty(storedDifficulty)).toBe(grade);
  });

  test.each([
    ['5a', 5.25],
    ['6B+', 6.6],
    [' 7c ', 7.75],
  ])('stores %s with its numeric equivalent', (grade, storedDifficulty) => {
    expect(parseDifficulty(grade)).toBeCloseTo(storedDifficulty);
  });

  test('rejects a numeric or unsupported grade', () => {
    expect(parseDifficulty('4.25')).toBeNull();
    expect(parseDifficulty('5d')).toBeNull();
  });
});
