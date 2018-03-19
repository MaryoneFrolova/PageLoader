#!/usr/bin/env node

import program from 'commander';
import { version, description } from '../../package.json';
import loadPages from '..';

program
  .version(version)
  .description(description)
  .option('-o, --output [path]', 'Path to save')
  .arguments('<url>')
  .action(url =>
    console.log(loadPages(url, program.output)))
  .parse(process.argv);
