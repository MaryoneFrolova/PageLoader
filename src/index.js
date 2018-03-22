import axios from 'axios';
import pathModule from 'path';
import urlModule from 'url';
import fs from 'mz/fs';
import cheerio from 'cheerio';

const validTags = {
  link: 'href',
  script: 'src',
  img: 'src',
};

const getFullFilePath = (currentURL, outputPath, extention = '.html') => {
  const { host, port, path } = urlModule.parse(currentURL);
  const stringFormatURL = [host, port, path]
    .join('')
    .replace(/[^a-z0-9]/gi, '-');
  const currentPath = pathModule.resolve(outputPath, stringFormatURL);
  return `${currentPath}${extention}`;
};


const getFileName = (link, basename) => {
  const { pathname } = urlModule.parse(link);
  return `${basename}/${pathModule.basename(getFullFilePath(link, basename, pathModule.extname(pathname)))}`;
};

const getOldAndNewLink = (attrVal, url, pathToSrcDir) => {
  const { host } = urlModule.parse(url);
  const basename = `./${pathModule.basename(pathToSrcDir)}`;
  const regExp = new RegExp(`^http.://${host}`, 'i');

  let link;
  let newLink;
  if (attrVal && attrVal.match(/^(\/[a-z])/i)) {
    link = urlModule.resolve(url, attrVal);
    newLink = getFileName(link, basename);
    return { link, newLink };
  }
  if (attrVal && attrVal.match(regExp)) {
    link = attrVal;
    newLink = getFileName(attrVal, basename);
    return { link, newLink };
  }
  return null;
};

const getLocalResourses = (html, url, pathToSrcDir) => {
  const $ = cheerio.load(html);

  const linksRes = [];
  const validTag = Object.keys(validTags).join(',');

  $(validTag).each((i, el) => {
    const curTagName = $(el)[0].tagName;
    const curAttrName = validTags[curTagName];
    const res = getOldAndNewLink($(el).attr(curAttrName), url, pathToSrcDir);
    if (res) {
      linksRes.push(res.link);
      $(el).attr(curAttrName, res.newLink);
    }
  });
  const resHTML = $.html();
  return { linksRes, resHTML };
};

const loadResourses = (links, pathToSrcDir, url, html) => {
  links.forEach((srcLink) => {
    const { pathname } = urlModule.parse(srcLink);
    const saveLoc = getFullFilePath(srcLink, pathToSrcDir, pathModule.extname(pathname));

    return axios.get(srcLink, { responseType: 'arraybuffer' })
      .then(res => res.data)
      .then((res) => {
        fs.writeFile(saveLoc, res);
      })
      .catch(() => Promise.resolve());
  });

  return html;
};

export default (url, outputPath = __dirname) => {
  const fileName = getFullFilePath(url, outputPath, '.html');
  const dirResName = getFullFilePath(url, outputPath, '_files');

  return axios.get(url)
    .then((res) => {
      console.log('Connection success');
      return res.data;
    })
    .then((res) => {
      fs.mkdir(dirResName);
      console.log(`Add new dir for Resourcer: ${dirResName}`);
      return res;
    })
    .then((res) => {
      const { linksRes, resHTML } = getLocalResourses(res, url, dirResName);
      console.log(`Links: ${linksRes}`);
      const html = loadResourses(linksRes, dirResName, url, resHTML);
      return html;
    })
    .then(res => fs.writeFile(fileName, res))
    .catch(error => Promise.reject(error));
};
