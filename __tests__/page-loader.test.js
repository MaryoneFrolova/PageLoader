// @flow
import path from 'path';
import nock from 'nock';
import fs from 'mz/fs';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import loadPage from '../src';
import os from 'os';
import fsSync from 'fs';

axios.defaults.adapter = httpAdapter;

const testURL = 'https://hexlet.io/courses';
const testOutputPath = path.resolve(__dirname, 'temp');

const expectFileName = 'hexlet-io-courses.html';
const pathToExpectContantFile = '__tests__/__fixtures__/expect.html';

describe('page-loader test', () => {
  const osTempDir = os.tmpdir();
  let pathToTemp;
  let openedExceptContant;
  let loadedData;

  beforeAll(async () => {
    
    pathToTemp = await fs.mkdtemp(path.join(osTempDir));
    openedExceptContant = await fs.readFile(pathToExpectContantFile, 'utf8');

    nock(testURL)
      .get('')
      .replyWithFile(200, pathToExpectContantFile);
  });

  it('testing...', async () => {

    
    //await loadPage(testURL, pathToTemp);
    //console.log(path.join(pathToTemp, expectFileName));
    const filepath = path.join(pathToTemp, expectFileName);
    await loadPage(testURL, pathToTemp);
   
    console.log(pathToTemp);

    loadedData = await fs.readFile(filepath, 'utf-8');
    console.log(pathToTemp);
    console.log(testURL);
    console.log(loadedData);
    expect(loadedData).toEqual(openedExceptContant);
  });
});
