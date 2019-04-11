module.exports.returnResponse = async function returnResponse (context, page, status) {
  context.res = {
    status,
    body: await page.content(),
    headers: {
      "Content-Type": "text/html",
      "Current-Page_Url": await page.url()
    }
  };  
  return true
}