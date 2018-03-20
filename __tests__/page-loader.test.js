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
  const osTempDir = os.tmpdir();
  let pathToTemp;
  let openedExceptContant;
  let loadedData;

  beforeAll(async () => {
    pathToTemp = await fs.mkdtemp(osTempDir);
    openedExceptContant = await fs.readFile(pathToExpectContantFile, 'utf8');

    nock(testURL)
      .get('')
      .replyWithFile(200, pathToExpectContantFile);
  });

  it('testing...', async () => {
    const pathToFile = path.join(pathToTemp, expectFileName);
    await loadPage(testURL, pathToTemp);

    loadedData = await fs.readFile(pathToFile, 'utf-8');

    expect(loadedData).toEqual(openedExceptContant);
  });
});
