import { counter, add } from './module1';
import * as m2 from './module2';

console.log(`pre_${counter}`);

add();

console.log(`after_${counter}`);