import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

let file = readFileSync(resolve('./src/region.csv'), 'utf-8');
