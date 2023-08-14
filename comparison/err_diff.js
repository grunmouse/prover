'use strict';

const 
  ArrayPrototypeJoin = (...a)=>(Array.prototype.join.call(...a)),
  ArrayPrototypePop = (...a)=>(Array.prototype.pop.call(...a)),
  //Error,
  ErrorCaptureStackTrace = Error.captureStackTrace,
  MathMax = Math.max,
  ObjectDefineProperty = Object.defineProperty,
  ObjectGetPrototypeOf = Object.getPropertyOf,
  ObjectKeys = Object.keys,
  //String,
  StringPrototypeEndsWith = (...a)=>(String.prototype.endsWith.call(...a)),
  StringPrototypeRepeat = (...a)=>(String.prototype.repeat.call(...a)),
  StringPrototypeSlice = (...a)=>(String.prototype.slice.call(...a)),
  StringPrototypeSplit = (...a)=>(String.prototype.split.call(...a));

const { inspect } = require('util');

const { inspect:myInspect } = require('./inspect');



const removeColors = require('./inspect/internal/util2.js');
const colors = Object.fromEntries(
	Object.entries(inspect.colors).map(
		([key, value])=>([key, value.slice(0,1).map(a=>('\x1b['+a+'m')).join('')])
	)
);

//console.log(colors);
const { validateObject} = require('./inspect/internal/validators');
const isErrorStackTraceLimitWritable  = ()=>(true);


const kReadableOperator = {
  deepStrictEqual: 'Expected values to be strictly deep-equal:',
  strictEqual: 'Expected values to be strictly equal:',
  strictEqualObject: 'Expected "actual" to be reference-equal to "expected":',
  deepEqual: 'Expected values to be loosely deep-equal:',
  notDeepStrictEqual: 'Expected "actual" not to be strictly deep-equal to:',
  notStrictEqual: 'Expected "actual" to be strictly unequal to:',
  notStrictEqualObject:
    'Expected "actual" not to be reference-equal to "expected":',
  notDeepEqual: 'Expected "actual" not to be loosely deep-equal to:',
  notIdentical: 'Values have same structure but are not reference-equal:',
  notDeepEqualUnequal: 'Expected values not to be loosely deep-equal:',
};

// Comparing short primitives should just show === / !== instead of using the
// diff.
const kMaxShortLength = 12;

function copyError(source) {
  const keys = ObjectKeys(source);
  const target = { __proto__: ObjectGetPrototypeOf(source) };
  for (const key of keys) {
    target[key] = source[key];
  }
  ObjectDefineProperty(target, 'message', { __proto__: null, value: source.message });
  return target;
}

const inspectConfig =  {
      compact: false,
      customInspect: false,
      depth: 1000,
      maxArrayLength: Infinity,
      // Assert compares only enumerable properties (with a few exceptions).
      showHidden: false,
      // Assert does not detect proxies currently.
      showProxy: false,
      sorted: true,
      // Inspect getters as we also check them when comparing entries.
      getters: true,
    };

function inspectValue(val) {
  // The util.inspect default values could be changed. This makes sure the
  // error messages contain the necessary information nevertheless.
  return inspect(
    val,
    inspectConfig
  );
}

function createErrDiff(actual, expected, operator) {
	const actualInspected = inspectValue(actual);
	const expectedInspected = inspectValue(expected);
	
	return inspectLinesDiff(actual, expected, actualInspected, expectedInspected, operator);
}

function compareInspectors(actual, original, sample, config){
	config = config || inspectConfig;
	const actualInspected = actual(sample, config);
	const expectedInspected = original(sample, config);

	return inspectLinesDiff(sample, sample, actualInspected, expectedInspected, 'compareInspectors');
}

function inspectLinesDiff(actual, expected, actualInspected, expectedInspected, operator) {
  let other = '';
  let res = '';
  let end = '';
  let skipped = false;

  const actualLines = StringPrototypeSplit(actualInspected, '\n');
  const expectedLines = StringPrototypeSplit(expectedInspected, '\n');

  let i = 0;
  let indicator = '';

 // Если оба значения являются объектами или функциями, меняем `strictEqual` на strictEqualObject.
  if (operator === 'strictEqual' &&
      ((typeof actual === 'object' && actual !== null &&
        typeof expected === 'object' && expected !== null) ||
       (typeof actual === 'function' && typeof expected === 'function'))) {
    operator = 'strictEqualObject';
  }

  // If "actual" and "expected" однострочные и их inspect-строки не равны
  if (actualLines.length === 1 && expectedLines.length === 1 &&
    actualLines[0] !== expectedLines[0]) {
    // Check for the visible length using the `removeColors()` function, if
    // appropriate.
    const c = inspect.defaultOptions.colors;
    const actualRaw = c ? removeColors(actualLines[0]) : actualLines[0];
    const expectedRaw = c ? removeColors(expectedLines[0]) : expectedLines[0];
    const inputLength = actualRaw.length + expectedRaw.length;
    // If the character length of "actual" and "expected" together is less than
    // kMaxShortLength and if neither is an object and at least one of them is
    // not `zero`, use the strict equal comparison to visualize the output.
    if (inputLength <= kMaxShortLength) {
      if ((typeof actual !== 'object' || actual === null) &&
          (typeof expected !== 'object' || expected === null) &&
          (actual !== 0 || expected !== 0)) { // -0 === +0
        return `${kReadableOperator[operator]}\n\n` +
            `${actualLines[0]} !== ${expectedLines[0]}\n`;
      }
    } 
	else if (operator !== 'strictEqualObject') {
      // If the stderr is a tty and the input length is lower than the current
      // columns per line, add a mismatch indicator below the output. If it is
      // not a tty, use a default value of 80 characters.
      const maxLength = process.stderr.isTTY ? process.stderr.columns : 80;
      if (inputLength < maxLength) {
        while (actualRaw[i] === expectedRaw[i]) {
          i++;
        }
        // Ignore the first characters.
        if (i > 2) {
          // Add position indicator for the first mismatch in case it is a
          // single line and the input length is less than the column length.
          indicator = `\n  ${StringPrototypeRepeat(' ', i)}^`;
          i = 0;
        }
      }
    }
  }

  // Remove all ending lines that match (this optimizes the output for
  // readability by reducing the number of total changed lines).
  let a = actualLines[actualLines.length - 1];
  let b = expectedLines[expectedLines.length - 1];
  while (a === b) {
    if (i++ < 3) {
      end = `\n  ${a}${end}`;
    } else {
      other = a;
    }
    ArrayPrototypePop(actualLines);
    ArrayPrototypePop(expectedLines);
    if (actualLines.length === 0 || expectedLines.length === 0)
      break;
    a = actualLines[actualLines.length - 1];
    b = expectedLines[expectedLines.length - 1];
  }

  const maxLines = MathMax(actualLines.length, expectedLines.length);
  // Strict equal with identical objects that are not identical by reference.
  // E.g., assert.deepStrictEqual({ a: Symbol() }, { a: Symbol() })
  if (maxLines === 0) {
    // We have to get the result again. The lines were all removed before.
    const actualLines = StringPrototypeSplit(actualInspected, '\n');

    // Only remove lines in case it makes sense to collapse those.
    // TODO: Accept env to always show the full error.
    if (actualLines.length > 50) {
      actualLines[46] = `${colors.blue}...${colors.white}`;
      while (actualLines.length > 47) {
        ArrayPrototypePop(actualLines);
      }
    }

    return `${kReadableOperator.notIdentical}\n\n` +
           `${ArrayPrototypeJoin(actualLines, '\n')}\n`;
  }

  // There were at least five identical lines at the end. Mark a couple of
  // skipped.
  if (i >= 5) {
    end = `\n${colors.blue}...${colors.white}${end}`;
    skipped = true;
  }
  if (other !== '') {
    end = `\n  ${other}${end}`;
    other = '';
  }

  let printedLines = 0;
  let identical = 0;
  const msg = kReadableOperator[operator] +
        `\n${colors.green}+ actual${colors.white} ${colors.red}- expected${colors.white}`;
  const skippedMsg = ` ${colors.blue}...${colors.white} Lines skipped`;

  let lines = actualLines;
  let plusMinus = `${colors.green}+${colors.white}`;
  let maxLength = expectedLines.length;
  if (actualLines.length < maxLines) {
    lines = expectedLines;
    plusMinus = `${colors.red}-${colors.white}`;
    maxLength = actualLines.length;
  }

  for (i = 0; i < maxLines; i++) {
    if (maxLength < i + 1) {
      // If more than two former lines are identical, print them. Collapse them
      // in case more than five lines were identical.
      if (identical > 2) {
        if (identical > 3) {
          if (identical > 4) {
            if (identical === 5) {
              res += `\n  ${lines[i - 3]}`;
              printedLines++;
            } else {
              res += `\n${colors.blue}...${colors.white}`;
              skipped = true;
            }
          }
          res += `\n  ${lines[i - 2]}`;
          printedLines++;
        }
        res += `\n  ${lines[i - 1]}`;
        printedLines++;
      }
      // No identical lines before.
      identical = 0;
      // Add the expected line to the cache.
      if (lines === actualLines) {
        res += `\n${plusMinus} ${lines[i]}`;
      } else {
        other += `\n${plusMinus} ${lines[i]}`;
      }
      printedLines++;
    // Only extra actual lines exist
    // Lines diverge
    } 
	else {
      const expectedLine = expectedLines[i];
      let actualLine = actualLines[i];
      // If the lines diverge, specifically check for lines that only diverge by
      // a trailing comma. In that case it is actually identical and we should
      // mark it as such.
      let divergingLines =
        actualLine !== expectedLine &&
        (!StringPrototypeEndsWith(actualLine, ',') ||
         StringPrototypeSlice(actualLine, 0, -1) !== expectedLine);
      // If the expected line has a trailing comma but is otherwise identical,
      // add a comma at the end of the actual line. Otherwise the output could
      // look weird as in:
      //
      //   [
      //     1         // No comma at the end!
      // +   2
      //   ]
      //
      if (divergingLines &&
          StringPrototypeEndsWith(expectedLine, ',') &&
          StringPrototypeSlice(expectedLine, 0, -1) === actualLine) {
        divergingLines = false;
        actualLine += ',';
      }
      if (divergingLines) {
        // If more than two former lines are identical, print them. Collapse
        // them in case more than five lines were identical.
        if (identical > 2) {
          if (identical > 3) {
            if (identical > 4) {
              if (identical === 5) {
                res += `\n  ${actualLines[i - 3]}`;
                printedLines++;
              } else {
                res += `\n${colors.blue}...${colors.white}`;
                skipped = true;
              }
            }
            res += `\n  ${actualLines[i - 2]}`;
            printedLines++;
          }
          res += `\n  ${actualLines[i - 1]}`;
          printedLines++;
        }
        // No identical lines before.
        identical = 0;
        // Add the actual line to the result and cache the expected diverging
        // line so consecutive diverging lines show up as +++--- and not +-+-+-.
        res += `\n${colors.green}+${colors.white} ${actualLine}`;
        other += `\n${colors.red}-${colors.white} ${expectedLine}`;
        printedLines += 2;
      // Lines are identical
      } 
	  else {
        // Add all cached information to the result before adding other things
        // and reset the cache.
        res += other;
        other = '';
        identical++;
        // The very first identical line since the last diverging line is be
        // added to the result.
        if (identical <= 2) {
          res += `\n  ${actualLine}`;
          printedLines++;
        }
      }
    }
    // Inspected object to big (Show ~50 rows max)
    if (printedLines > 50 && i < maxLines - 2) {
      return `${msg}${skippedMsg}\n${res}\n${colors.blue}...${colors.white}${other}\n` +
             `${colors.blue}...${colors.white}`;
    }
  }

  return `${msg}${skipped ? skippedMsg : ''}\n${res}${other}${end}${indicator}`;
}

function addEllipsis(string) {
  const lines = StringPrototypeSplit(string, '\n', 11);
  if (lines.length > 10) {
    lines.length = 10;
    return `${ArrayPrototypeJoin(lines, '\n')}\n...`;
  } else if (string.length > 512) {
    return `${StringPrototypeSlice(string, 512)}...`;
  }
  return string;
}


//console.log(createErrDiff([1,2,3, {a:1, b:2}], [2,3,4, {a:1, b:3}]));
//console.log(createErrDiff({a:1, b:2}, {a:2, c:3}));
//console.log(createErrDiff(3, 4));

//console.log(compareInspectors(myInspect, inspect, [1,2,3, {a:1, b:2}], [2,3,4, {a:1, b:3}]));

module.exports = {
	createErrDiff,
	compareInspectors
}