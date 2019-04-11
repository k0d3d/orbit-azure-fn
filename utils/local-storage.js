const fs = require('fs')
module.exports.saveLocalStorage = async function saveLocalStorage(page, filePath) {
  const json = await page.evaluate(() => {
    const json = {};
    for (const i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      json[key] = localStorage.getItem(key);
    }
    return json;
  });
  fs.writeFileSync(filePath, 'utf8', JSON.stringify(json));
}

module.exports.restoreLocalStorage = async function restoreLocalStorage(page, filePath) {
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  await page.evaluate(json => {
    localStorage.clear();
    for (let key in json)
      localStorage.setItem(key, json[key]);
  }, json);
}

