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
      .catch((err) => {
        if (err.response) {
          console.error(`Response from URL: ${err.response.config.url} ${err.response.status} ${err.response.statusText}`);
        } else {
          console.error(err.message);
        }
        process.exit(1);
      });
  })
  .parse(process.argv);
