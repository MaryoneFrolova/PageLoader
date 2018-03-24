#!/usr/bin/env node

import program from 'commander';
import { version, description } from '../../package.json';
import loadPage from '..';

program
  .version(version)
  .description(description)
  .option('-o, --output [path]', 'Path to save')
  .arguments('<url>')
  .action((url) => {
    loadPage(url, program.output)
      .catch((error) => {
        console.error(`Error: ${error.message}`);
        if (error.path) {
          console.error(error.path);
        }
        if (error.config) {
          console.error(error.config.url);
        }
        process.exit(1);
      });
  })
  .parse(process.argv);
