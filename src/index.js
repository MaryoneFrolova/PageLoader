import axios from 'axios';
import pathModule from 'path';
import urlModule from 'url';
import fs from 'mz/fs';

const getFilaName = (currentURL, outputPath) => {
  const formatHTML = '.html';
  const { host, port, path } = urlModule.parse(currentURL);
  const stringFormatURL = [host, port, path]
    .join('')
    .replace(/[^a-z0-9]/gi, '-');
  const currentPath = pathModule.resolve(outputPath, stringFormatURL);
  return `${currentPath}${formatHTML}`;
};

const saveData = (fileName, data) => {
  fs.writeFile(fileName, data)
    .then(() => {
      console.log(`Success. Page loading and saved in the file ${fileName}`);
    });
};

export default (url, outputPath = __dirname) => {
  axios.get(url)
    .then(res => res.data)
    .then((res) => {
      const fileName = getFilaName(url, outputPath);
      saveData(fileName, res);
    });
};
