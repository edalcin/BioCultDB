const { isPdfTextEmpty } = require('../../src/acquisition/scripts/pdf-text');

describe('isPdfTextEmpty', () => {
  test('empty string is empty', () => {
    expect(isPdfTextEmpty('')).toBe(true);
  });

  test('null/undefined is empty', () => {
    expect(isPdfTextEmpty(null)).toBe(true);
    expect(isPdfTextEmpty(undefined)).toBe(true);
  });

  test('whitespace-only text is empty', () => {
    expect(isPdfTextEmpty('   \n\n   \t  ')).toBe(true);
  });

  test('a few stray characters (scanned PDF noise) is empty', () => {
    expect(isPdfTextEmpty('. . .')).toBe(true);
  });

  test('real article-length text is not empty', () => {
    const text = 'A etnobotânica estuda a relação entre '.repeat(5);
    expect(isPdfTextEmpty(text)).toBe(false);
  });
});
