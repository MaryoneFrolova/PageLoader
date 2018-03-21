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

export default (url, outputPath = __dirname) => {
  const fileName = getFilaName(url, outputPath);

  return axios.get(url)
    .then(res => fs.writeFile(fileName, res.data))
    .then(() => console.log(`Success. File was load and save on path ${fileName}`));
};
