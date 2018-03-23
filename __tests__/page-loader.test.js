// @flow
import path from 'path';
import nock from 'nock';
import fs from 'mz/fs';
import axios from 'axios';
import os from 'os';
import httpAdapter from 'axios/lib/adapters/http';
import loadPage from '../src';

axios.defaults.adapter = httpAdapter;

const testURL = 'http://helloworldquiz.com';

const expectFileName = 'helloworldquiz-com-.html';
const expectResDirName = 'helloworldquiz-com-_files';
/*  const expectFile1 =
    'helloworldquiz-com-assets-javascripts-app-c1fefd695f8b5a7b1922d7ed5daa83be.js';
    const expectFile2 = 'helloworldquiz-com-public-favicon.ico';
 const expectFile3 =
    'helloworldquiz-com-assets-javascripts-main-34247236b923e9ec71aeed7a16ef2bf6.js';
  const expectFile4 =
    'helloworldquiz-com-assets-stylesheets-app-64f049c2230c2b71a4ae3a06d5d95cc3.css';
  const expectFile5 =
    'helloworldquiz-com-assets-stylesheets-main-157d81688d2f7019fa56a07c70898d52.css';  */
const pathToExpectFile1 = '__tests__/__fixtures__/file1.js';
const pathToExpectFile2 = '__tests__/__fixtures__/file2.ico';
const pathToExpectFile3 = '__tests__/__fixtures__/file3.js';
const pathToExpectFile4 = '__tests__/__fixtures__/file4.css';
const pathToExpectFile5 = '__tests__/__fixtures__/file5.css';
const pathToExpectHTMLFileBefore = '__tests__/__fixtures__/expectBefore.html';
const pathToExpectHTMLFileResult = '__tests__/__fixtures__/expectResult.html';

describe('page-loader test', () => {
  let pathToTempDir;
  let pathToFile;
  let pathToDirRes;

  beforeAll(async () => {
    pathToTempDir = await fs.mkdtemp(`${os.tmpdir()}${path.sep}`);

    nock(testURL)
      .get('/')
      .replyWithFile(200, pathToExpectHTMLFileBefore)
      .get('/assets/stylesheets/app-64f049c2230c2b71a4ae3a06d5d95cc3.css')
      .replyWithFile(200, pathToExpectFile4)
      .get('/public/favicon.ico')
      .replyWithFile(200, pathToExpectFile2)
      .get('/public/favicon.ico')
      .replyWithFile(200, pathToExpectFile2)
      .get('/assets/stylesheets/main-157d81688d2f7019fa56a07c70898d52.css')
      .replyWithFile(200, pathToExpectFile5)
      .get('/assets/javascripts/app-c1fefd695f8b5a7b1922d7ed5daa83be.js')
      .replyWithFile(200, pathToExpectFile1)
      .get('/assets/javascripts/main-34247236b923e9ec71aeed7a16ef2bf6.js')
      .replyWithFile(200, pathToExpectFile3);

    await loadPage(testURL, pathToTempDir);
  });

  it('Step 1 testing html file...', async () => {
    const exceptContant = await fs.readFile(pathToExpectHTMLFileResult, 'utf8');
    pathToFile = path.join(pathToTempDir, expectFileName);
    const receivedContant = await fs.readFile(pathToFile, 'utf8');
    expect(exceptContant).toEqual(receivedContant);
  });

  it('Step 2 testing count resource files...', async () => {
    pathToDirRes = path.resolve(pathToTempDir, expectResDirName);
    const files = await fs.readdir(pathToDirRes);
    const countResFiles = files.length;

    expect(5).toEqual(countResFiles);
  });
});
