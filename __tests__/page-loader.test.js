// @flow
import path from 'path';
import nock from 'nock';
import fs from 'mz/fs';
import axios from 'axios';
import os from 'os';
import httpAdapter from 'axios/lib/adapters/http';
import loadPage from '../src';

axios.defaults.adapter = httpAdapter;

const testURL = 'http://cafefrida.ca';

const expectFileName = 'cafefrida-ca-.html';
const expectResDirName = 'cafefrida-ca-_files';
const expectNameLogoFile = 'cafefrida-ca-img-logo-svg.svg';
const pathToExpectLogoFile = '__tests__/__fixtures__/logo.svg';
const pathToExpectHTMLFile = '__tests__/__fixtures__/expect.html';
const pathToExpectHTMLFileBefore = '__tests__/__fixtures__/expect1.html';

describe('page-loader test', () => {
  let pathToTempDir;
  let pathToFile;
  let pathToDirRes;
  let pathToResFile;

  beforeAll(async () => {
    pathToTempDir = await fs.mkdtemp(`${os.tmpdir()}${path.sep}`);

    nock(testURL)
      .get('/')
      .replyWithFile(200, pathToExpectHTMLFileBefore)
      .get('/img/logo.svg')
      .replyWithFile(200, pathToExpectLogoFile);

    await loadPage(testURL, pathToTempDir);
  });

  it('Step 1 testing html file...', async () => {
    const exceptContant = await fs.readFile(pathToExpectHTMLFile, 'utf8');
    pathToFile = path.join(pathToTempDir, expectFileName);
    const receivedContant = await fs.readFile(pathToFile, 'utf8');
    expect(exceptContant).toEqual(receivedContant);
  });

  it('Step 2 testing count resource files...', async () => {
    pathToDirRes = path.resolve(pathToTempDir, expectResDirName);
    const files = await fs.readdir(pathToDirRes);
    const countResFiles = files.length;

    expect(1).toEqual(countResFiles);
  });

  it('Step 3 testing content resource files...', async () => {
    const exceptContant = await fs.readFile(pathToExpectLogoFile);
    pathToResFile = path.join(pathToDirRes, expectNameLogoFile);
    const receivedContant = await fs.readFile(pathToResFile);
    expect(exceptContant).toEqual(receivedContant);
  });
});
