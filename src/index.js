import axios from 'axios';
import pathModule from 'path';
import urlModule from 'url';
import fs from 'mz/fs';
import cheerio from 'cheerio';
import debug from 'debug';

const ok = debug('page-loader:ok');
const warning = debug('page-loader: warning');
const error = debug('page-loader: ERROR');

const validTags = {
  link: 'href',
  script: 'src',
  img: 'src',
};

const createFileName = (url, extName) => {
  const { host, port, path } = urlModule.parse(url);
  const stringFormatURL = [host, port, path]
    .join('')
    .replace(/[^a-z0-9]/gi, '-');
  return `${stringFormatURL}${extName}`;
};

const createFileNameFromURL = (url) => {
  const linkExtName = pathModule.extname(urlModule.parse(url).pathname);
  const linkWithoutExtName = url.replace(/\.[^/.]+$/, '');
  return createFileName(linkWithoutExtName, linkExtName);
};

const getLocalResourses = (html, url, dirResName) => {
  const { host } = urlModule.parse(url);

  const rexpAbsoluteLink = new RegExp(`^http://${host}`, 'i');
  const rexpRelativeLink = new RegExp('^/[a-z]', 'i');

  const $ = cheerio.load(html);

  const linksRes = [];
  const validTag = Object.keys(validTags).join(',');

  $(validTag).each((i, el) => {
    const curentTag = $(el)[0].tagName;
    const attrTag = validTags[curentTag];
    const attrVal = $(el).attr(attrTag);
    if (attrVal) {
      if (attrVal.match(rexpRelativeLink) || attrVal.match(rexpAbsoluteLink)) {
        const link = (attrVal.match(rexpRelativeLink) ? urlModule.resolve(url, attrVal) : attrVal);
        const fileNameRes = createFileNameFromURL(link);
        const newLink = `./${dirResName}/${fileNameRes}`;
        linksRes.push(link);
        $(el).attr(attrTag, newLink);
      }
    }
  });
  const resHTML = $.html();
  return { linksRes, resHTML };
};

const loadResourses = (links, pathResDir, url, html) => {
  const promises = [];
  links.forEach((srcLink) => {
    const fileNameRes = createFileNameFromURL(srcLink);
    const pathResFile = pathModule.resolve(pathResDir, fileNameRes);

    const promise = axios.get(srcLink, { responseType: 'stream' })
      .then((res) => {
        ok(`${srcLink} loading`);
        res.data.pipe(fs.createWriteStream(pathResFile));
      })
      .then(() => ok(`${pathResFile} saved`))
      .catch((err) => {
        warning(`File  not loaded and skip ${srcLink}. ${err.message}`);
        return Promise.resolve();
      });
    promises.push(promise);
  });
  return axios.all(promises)
    .then(() => {
      ok('All resource files was loading');
      return html;
    });
};

const makeResDir = (path, html) =>
  fs.mkdir(path)
    .then(() => {
      ok(`Directory for resources available: ${path}`);
      return html;
    })
    .catch((err) => {
      if (err.code === 'EEXIST') {
        warning('Directory alreade exist. Program use this directory');
        return html;
      }
      return err;
    });

export default (url, outputPath = __dirname) => {
  const dirResName = createFileName(url, '_files');
  const pathResDir = pathModule.resolve(outputPath, dirResName);
  const fileNameHTML = createFileName(url, '.html');
  const pathHTMLfile = pathModule.resolve(outputPath, fileNameHTML);

  return axios.get(url)
    .then((res) => {
      ok(`Connection with url ${url} established. Status: ${res.status}`);
      return res.data;
    })
    .then(res => makeResDir(pathResDir, res))
    .then((res) => {
      const { linksRes, resHTML } = getLocalResourses(res, url, dirResName);
      ok(`Founded links: ${linksRes}`);
      return loadResourses(linksRes, pathResDir, url, resHTML);
    })
    .then(res => fs.writeFile(pathHTMLfile, res))
    .then(() => ok(`HTML document saved successfully ${pathHTMLfile}`))
    .catch((err) => {
      error(`${err.message}`);
      return Promise.reject(err);
    });
};
