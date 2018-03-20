// @flow
import path from 'path';
import nock from 'nock';
import fs from 'mz/fs';
import axios from 'axios';
import os from 'os';
import httpAdapter from 'axios/lib/adapters/http';
import loadPage from '../src';

axios.defaults.adapter = httpAdapter;

const testURL = 'https://hexlet.io/courses';

const expectFileName = 'hexlet-io-courses.html';
const pathToExpectContantFile = '__tests__/__fixtures__/expect.html';

describe('page-loader test', () => {
  let exceptContant;
  let receivedContant;
  let pathToTemp;
  let pathToFile;

  beforeAll(async () => {
    pathToTemp = await fs.mkdtemp(`${os.tmpdir()}${path.sep}`);
    pathToFile = path.join(pathToTemp, expectFileName);

    exceptContant = await fs.readFile(pathToExpectContantFile, 'utf8');
    nock(testURL)
      .get('')
      .replyWithFile(200, pathToExpectContantFile);
  });

  it('Step 1 testing...', async () => {
    await loadPage(testURL, pathToTemp);
    receivedContant = await fs.readFile(pathToFile, 'utf8');

    expect(receivedContant).toEqual(exceptContant);
  });
});
