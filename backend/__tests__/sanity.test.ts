test('sanity check - tests are running', () => {
  expect(true).toBe(true);
});

test('basic math', () => {
  expect(1 + 1).toBe(2);
});

test('string operations', () => {
  expect('hello'.toUpperCase()).toBe('HELLO');
});

test('array operations', () => {
  const arr = [1, 2, 3];
  expect(arr.length).toBe(3);
  expect(arr[0]).toBe(1);
});

test('object operations', () => {
  const obj = { name: 'test', value: 42 };
  expect(obj.name).toBe('test');
  expect(obj.value).toBe(42);
});
