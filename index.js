#!/usr/bin/env node

const puppeteer = require('puppeteer')
const devices = require('puppeteer/DeviceDescriptors')
const program = require('commander')

var urlvalue, emulate = "";

program
    .option('--url, [url]', 'The url')
    .option('--emulate, [emulate]', 'emulate device')
    .option('--fullpage, [fullpage]', 'Full Page')
    .option('--pdf, [pdf]', 'Generate PDF')
    .option('--w, [w]', 'width')
    .option('--h, [h]', 'height')
    .option('--waitfor, [waitfor]', 'Wait time in milliseconds')
    .option('--el, [el]', 'element css selector')
    .parse(process.argv);

if (program.url) urlvalue = program.url
else process.exit(console.log("Please add --url parameter. Something like this: $ screenshoteer --url http:www.example.com"));

!program.fullpage ? fullPage = true : fullPage = JSON.parse(program.fullpage); 

console.log(urlvalue);
console.log(fullPage);

(async () => {

  try {
    await execute();
  } catch(e) {
    console.error(e);
    process.exit(1);
  }

  async function execute() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    const d = new Date()
    if (program.w || program.h) {
      const newWidth = !program.w?600:program.w
      const newHeight = !program.h?'0':program.h
      if (program.h && !program.fullpage) fullPage = false;
      await page.setViewport({width: Number(newWidth), height: Number(newHeight)})
    }
    if (program.emulate) await page.emulate(devices[program.emulate]);
    await page.goto(urlvalue)
    const title = await page.title()
    const t = title.replace(/[/\\?%*:|"<> ]/g, '-')
    var arglist = new Array()
    //set arglist
    if (urlvalue) arglist.push(urlvalue.replace(/:\/\//g, '-'))
    if (program.emulate) arglist.push(program.emulate)
    if (program.w) arglist.push('w_' + program.w)
    if (program.h) arglist.push('h_' + program.h)
    if (program.pdf) arglist.push('pdf')
    if (program.el) arglist.push('el_' + program.el)
    if (program.fullpage) arglist.push('fullpage')
    const args = arglist.join('-').replace(/[/\\?%*:|"<> ]/g, '-')
    if (program.waitfor) await page.waitFor(Number(program.waitfor))
    var filename = t + "_" +  args  + "_" + d.getTime() + '.png'
    if (program.el) {
      const el = await page.$(program.el);
      await el.screenshot({path: `${filename}`});
    } else {
      await page.screenshot({path: filename, fullPage: fullPage})
    }
    await page.emulateMedia('screen')
    if (program.pdf) {
      filename = t + "_" +  args  + "_" + d.getTime() + '.pdf'
      await page.pdf({
        path: filename
      })
    }
    console.log(filename)
    await browser.close()
  }
})()