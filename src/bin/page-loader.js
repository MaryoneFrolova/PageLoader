#!/usr/bin/env node

import program from 'commander';
import { version, description } from '../../package.json';
import loadPage from '..';

program
  .version(version)
  .description(description)
  .option('-o, --output [path]', 'Path to save')
  .arguments('<url>')
  .action(url =>
    loadPage(url, program.output))
  .parse(process.argv);
