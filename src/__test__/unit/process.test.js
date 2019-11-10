import _ from 'lodash';
import calculate from '../../logic/calculate';
import process from '../../logic/process';

const randomInteger = () => `${Math.floor(Math.random() * 10)}`;
const randomOperation = () => _.sample(['+', '-', 'x', '÷']);
const emptyState = { queue: [], next: null, total: null };

describe('when buttonName is mutating', () => {});
describe('when buttonName is a number', () => {
  let buttonNumber;
  beforeEach(() => {
    buttonNumber = randomInteger();
  });

  describe('when state.next is null', () => {
    it('sets state.next to the buttonName', () => {
      expect(process(emptyState, buttonNumber)).toEqual({
        ...emptyState,
        next: buttonNumber,
        total: buttonNumber,
      });
    });

    it('resets the queue and sets state.next to the buttonName', () => {
      const queue = [randomInteger()];
      expect(process({ ...emptyState, queue }, buttonNumber)).toEqual({
        ...emptyState,
        next: buttonNumber,
        total: buttonNumber,
      });
    });
  });

  describe('when state.next is number', () => {
    it('appends the buttonName to state.next', () => {
      const next = randomInteger();
      expect(process({ ...emptyState, next }, buttonNumber)).toEqual({
        ...emptyState,
        next: next + buttonNumber,
        total: calculate([next + buttonNumber]),
      });
    });
  });

  describe('when state.next is an operation', () => {
    it('sets state.next to the buttonName and append the operation ot state.queue', () => {
      const queue = [randomInteger(), randomOperation(), randomInteger() + 1];
      const next = randomOperation();
      const totalQueue = [...queue, next];
      const total = calculate(totalQueue);

      expect(process({ queue, next, total }, buttonNumber)).toEqual({
        queue: totalQueue,
        next: buttonNumber,
        total: calculate([...totalQueue, buttonNumber]),
      });
    });

    it('sets total to "Cannot divide by zero" if buttonName is zero', () => {
      const queue = [randomInteger(), randomOperation(), randomInteger()];
      const next = '÷';
      const totalQueue = [...queue, next];
      const total = calculate(totalQueue);

      expect(process({ queue, next, total }, '0')).toEqual({
        queue: totalQueue,
        next: '0',
        total: 'Cannot divide by zero',
      });
    });

    it('sets total to "Cannot divide by zero" if next stays zero', () => {
      const queue = [randomInteger(), '÷'];
      const next = '0.';
      const total = calculate([...queue, next]);

      expect(process({ queue, next, total }, '0')).toEqual({
        queue,
        next: '0.0',
        total: 'Cannot divide by zero',
      });
    });
  });
});

describe('when buttonName is an operation', () => {
  let buttonOperation;
  beforeEach(() => {
    buttonOperation = randomOperation();
  });

  describe('when state.next is null', () => {
    it('sets state.next to the buttonName and state.queue to ["0"]', () => {
      expect(process(emptyState, buttonOperation)).toEqual({
        queue: ['0'],
        next: buttonOperation,
        total: '0',
      });
    });

    it('sets state.next to the buttonName and keeps the queue if it carries past total', () => {
      const queue = [randomInteger()];
      expect(process({ ...emptyState, queue }, buttonOperation)).toEqual({
        queue,
        next: buttonOperation,
        total: '0',
      });
    });
  });

  describe('when state.next is number', () => {
    it('sets state.next to buttonName and appends state.next to state.queue', () => {
      const queue = [randomInteger(), randomOperation()];
      const next = randomInteger() + 1;
      const totalQueue = [...queue, next];
      const total = calculate(totalQueue);

      expect(process({ queue, next, total }, buttonOperation)).toEqual({
        queue: totalQueue,
        next: buttonOperation,
        total: calculate([...totalQueue, buttonOperation]),
      });
    });
  });

  describe('when state.next is an operation', () => {
    it('replaces state.next with buttonName', () => {
      const queue = [randomInteger(), randomOperation(), randomInteger()];
      const next = randomOperation();
      const total = calculate([...queue, next]);

      expect(process({ queue, next, total }, buttonOperation)).toEqual({
        queue,
        next: buttonOperation,
        total,
      });
    });
  });

  describe('when total is division by zero', () => {
    it('sets total to "Cannot divide by zero"', () => {
      const queue = [randomInteger(), '÷'];
      const next = '0';
      const totalQueue = [...queue, next];
      expect(
        process({ queue, next, total: calculate(totalQueue) }, buttonOperation),
      ).toEqual({
        queue: totalQueue,
        next: buttonOperation,
        total: 'Cannot divide by zero',
      });
    });
  });
});

describe('when buttonName is terminal', () => {
  describe('when buttonName is "AC"', () => {
    it('return a reseted state', () => {
      expect(
        process(
          {
            queue: [randomInteger(), randomOperation()],
            next: randomInteger(),
            total: randomInteger(),
          },
          'AC',
        ),
      ).toEqual(emptyState);
    });
  });

  describe('when buttonName is "="', () => {
    it('sets queue to [total] and resests the next and total', () => {
      const total = randomInteger();

      expect(process({ ...emptyState, total }, '=')).toEqual({
        ...emptyState,
        queue: [total],
      });
    });

    it('returns the state unchanged if it contained division by zero', () => {
      const queue = [randomInteger(), '÷'];
      const next = '0';
      const total = calculate([...queue, next]);
      const state = { queue, next, total };

      expect(process(state, '=')).toEqual(state);
    });
  });
});

describe('when buttonName mutates next', () => {
  describe('when buttonName is dot"."', () => {
    describe('when state.next is null', () => {
      it('sets state.next to the "0."', () => {
        expect(process(emptyState, '.')).toEqual({
          ...emptyState,
          next: '0.',
        });
      });

      it('resets the queue and sets state.next to the "0."', () => {
        const queue = [randomInteger()];
        expect(process({ ...emptyState, queue }, '.')).toEqual({
          ...emptyState,
          next: '0.',
        });
      });
    });

    describe('when state.next is number', () => {
      it('appends the "." to state.next', () => {
        const queue = [randomInteger(), randomOperation()];
        const next = randomInteger();
        const total = calculate([...queue, next]);
        const state = { queue, next, total };

        expect(process(state, '.')).toEqual({
          ...state,
          next: `${next}.`,
        });
      });

      it('doesnt append "." to state.next if it already contained a dot', () => {
        const queue = [randomInteger(), randomOperation()];
        const next = `${randomInteger()}.`;
        const total = calculate([...queue, next]);
        const state = { queue, next, total };
        expect(process(state, '.')).toEqual(state);
      });
    });

    describe('when state.next is an operation', () => {
      it('sets next to "0." and push the operation to the queue', () => {
        const queue = [randomInteger()];
        const next = randomOperation();
        const total = calculate([...queue, next]);
        const state = { queue, next, total };

        expect(process(state, '.')).toEqual({
          ...state,
          queue: [...queue, next],
          next: '0.',
        });
      });
    });
  });
});

// describe('when buttonName is not operator or number', () => {
//   describe('when buttonName is "+/-"', () => {
//     let LHS;
//     let RHS;
//     let operation;

//     beforeEach(() => {
//       LHS = randomInteger;
//       RHS = randomInteger;
//       operation = randomOperation;
//     });

//     describe('if operation is NOT null', () => {
//       it('negates the value of RHS if it exists', () => {
//         expect(process({ LHS, operation, RHS }, '+/-')).toEqual({
//           LHS,
//           operation,
//           RHS: operate(RHS, -1, 'x'),
//         });
//       });

//       it('returns the same state if RHS is null', () => {
//         expect(process({ LHS, operation }, '+/-')).toEqual({
//           LHS,
//           operation,
//         });
//       });
//     });

//     describe('if operation is null', () => {
//       it('negates the value of LHS it exists', () => {
//         expect(process({ LHS }, '+/-')).toEqual({
//           LHS: operate(LHS, -1, 'x'),
//         });
//       });

//       it('returns the same state if LHS is null', () => {
//         expect(process({}, '+/-')).toEqual({});
//       });
//     });
//   });

//   describe('when buttonName is "%"', () => {
//     let LHS;
//     let RHS;
//     let operation;

//     beforeEach(() => {
//       LHS = randomInteger;
//       RHS = randomInteger;
//       operation = randomOperation;
//     });

//     describe('if operation is NOT null', () => {
//       it('divides the value of RHS by 100 if it exists', () => {
//         expect(process({ LHS, operation, RHS }, '%')).toEqual({
//           LHS,
//           operation,
//           RHS: operate(RHS, '100', '÷'),
//         });
//       });

//       it('returns the same state if RHS is null', () => {
//         expect(process({ LHS, operation }, '%')).toEqual({
//           LHS,
//           operation,
//         });
//       });
//     });

//     describe('if operation is null', () => {
//       it('divides the value of LHS by 100 it exists', () => {
//         expect(process({ LHS }, '%')).toEqual({
//           LHS: operate(LHS, '100', '÷'),
//         });
//       });

//       it('returns the same state if LHS is null', () => {
//         expect(process({}, '%')).toEqual({});
//       });
//     });
//   });

//   describe('when buttonName is "."', () => {
//     let LHS;
//     beforeEach(() => {
//       LHS = randomInteger;
//     });

//     describe('when operation is null', () => {
//       it('sets LHS to "0." if LHS was null', () => {
//         expect(process({}, '.')).toEqual({ LHS: '0.' });
//       });

//       it('appends LHS with "."', () => {
//         expect(process({ LHS }, '.')).toEqual({
//           LHS: `${LHS}.`,
//         });
//       });

//       it('keeps LHS if it contains"."', () => {
//         LHS = `${LHS}.`;
//         expect(process({ LHS }, '.')).toEqual({ LHS });
//       });
//     });

//     describe('when operation is NOT null', () => {
//       let RHS;
//       let operation;
//       beforeEach(() => {
//         RHS = randomInteger;
//         operation = randomOperation;
//       });

//       it('sets RHS to "0." if RHS was null', () => {
//         expect(process({ LHS, operation }, '.')).toEqual({
//           LHS,
//           operation,
//           RHS: '0.',
//         });
//       });

//       it('appends RHS with "."', () => {
//         expect(process({ LHS, operation, RHS }, '.')).toEqual({
//           LHS,
//           operation,
//           RHS: `${RHS}.`,
//         });
//       });

//       it('keeps LHS if it contains"."', () => {
//         RHS = `${RHS}.`;
//         expect(process({ LHS, operation, RHS }, '.')).toEqual({
//           LHS,
//           operation,
//           RHS,
//         });
//       });
//     });
//   });
// });
