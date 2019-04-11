
module.exports.isAwaitingReview = async function isAwaitingReview(context, page) {
  return new Promise(async (resolve, reject) => {
    let currentUrl = await page.url()
    if (currentUrl.indexOf('terms/unblock') > -1) {
      let dialogButton
      try {
        // const dialog = await page.$('[role=dialog]')
        dialogButton = await page.$('[role=dialog] button')
      } catch (e) {
        return reject(e)
      }
      if (!dialogButton) {
        return reject(page)
      }
      await dialogButton.click()
      
      let is18 = await page.$('[role=dialog] [name=ageRadio]')
      await is18.click()
      // should enable agree button
      await page.evaluate(el => {
        el.removeAttribute('disabled')
      }, dialogButton)
      await dialogButton.click()
      resolve(page)
    } else {
      reject(page)
    }
  })
}