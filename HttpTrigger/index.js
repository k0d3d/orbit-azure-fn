const puppeteer = require("puppeteer");
const {returnResponse} = require('../utils')
const { isAwaitingReview } = require('../strategies')

module.exports = async function(context, req, pageCookiesIn) {
  const log = context.log
  log("Started working function");
  if (!req.body ||
      !req.body.username ||
      !req.body.password) {
        context.res = {
          status: 400,
          body: "Request Parameters not set // expecting {username: 'xxx', password: 'xxx'} in req.body"
        }
        return
      }
  const browser = await puppeteer.connect({
    browserWSEndpoint: "ws://d.ixit.com.ng"
  });
  
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1237, height: 670 });
  
  await page.goto("https://www.instagram.com/accounts/login");

  
  let userHasExisitingSession = false

  if (pageCookiesIn) {
    userHasExisitingSession = Object.values(context.bindings.pageCookiesIn[0])
    userHasExisitingSession = userHasExisitingSession.filter(o => o instanceof Object)
    await page.setCookie(...userHasExisitingSession)
  }
  
  // attempt login
  await page.waitForSelector("[name=username]");
  await page.type("[name=username]", req.body.username);
  await page.type("[name=password]", req.body.password);
  await page.click("[type=submit]");
  
  try {
    await page.waitForNavigation({ timeout: 2000 });
    let ob = { ...await page.cookies(), id: req.body.username }
    // Cosmos DB output binding
    // create a new document
    context.bindings.pageCookiesOut = JSON.stringify(ob);

    // start testing strategies
    await isAwaitingReview(context, page).catch(e => log(e))
    
    await returnResponse(context, page)

    // await browser.close();
  } catch (e) {
    // the page does not refresh because, of ....
    // many possible errors. 
    // Instagram displays an error alert message
    // if authentication fails.
    try {
      await page.waitForSelector("[role=alert]");
      const alertElement = await page.$eval(
        "[role=alert]",
        node => node.innerHTML
      );
      // check for that then respond
      returnResponse(context, page, 401)
      // await browser.close();
    } catch (e) {
      returnResponse(context, page, 500)
      // await browser.close();
    }

  }

};
