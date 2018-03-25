import axios from 'axios';
import pathModule from 'path';
import urlModule from 'url';
import fs from 'mz/fs';
import cheerio from 'cheerio';
import debug from 'debug';
import listr from 'listr';

const log = debug('page-loader:log');

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

const loadResourses = (links, pathResDir) =>
  axios.all(links.map((srcLink) => {
    const fileNameRes = createFileNameFromURL(srcLink);
    const pathResFile = pathModule.resolve(pathResDir, fileNameRes);
    
    const tasks = new listr([{
    title: `loading resourse file ${srcLink}`,
    task: () => {return axios.get(srcLink, { responseType: 'stream' })
      .then((res) => {
        log(`${srcLink} loading`);
        res.data.pipe(fs.createWriteStream(pathResFile));
      })
      .then(() => log(`${pathResFile} saved`))
      .catch((err) => {
        log(`Warning: File  not loaded and skip ${srcLink}. ${err.message}`);
        return Promise.resolve();
      });
    }
    }])
    return tasks.run();
  }))
    .then(() => {
      log('All resource files was loading');
    });


const makeResDir = path =>
  fs.mkdir(path)
    .then((res) => {
      log(`Directory for resources available: ${path}`);
      return res;
    })
    .catch((err) => {
      if (err.code === 'EEXIST') {
        log(`Warning: Directory alreade exist. Program will use this directory ${path}`);
        return;
      }
      return Promise.reject(err);
    });

export default (url, outputPath = __dirname) => {
  const dirResName = createFileName(url, '_files');
  const pathResDir = pathModule.resolve(outputPath, dirResName);
  const fileNameHTML = createFileName(url, '.html');
  const pathHTMLfile = pathModule.resolve(outputPath, fileNameHTML);
  let linksToResources;

  return makeResDir(pathResDir)
    .then(() => axios.get(url))
    .then((res) => {
      log(`Connection with url ${url} established. Status: ${res.status}`);
      return res.data;
    })
    .then((res) => {
      const { linksRes, resHTML } = getLocalResourses(res, url, dirResName);
      linksToResources = linksRes;
      return fs.writeFile(pathHTMLfile, resHTML);
    })
    .then(() => {
      log(`HTML document saved successfully ${pathHTMLfile}`);
      //  const linksRes = ['http://helloworldquiz.com/public/favicon.ico', 'http://hsdfa.com/public/favicoasdfn.ico'];
      log(`Founded links: ${linksToResources}`);
      return loadResourses(linksToResources, pathResDir);
    })
    .then(() => log('Success'))
    .catch((err) => {
      log(`${err.message}`);
      throw err;
    });
};
