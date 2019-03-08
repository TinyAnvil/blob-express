import _ from 'lodash'
import blobs from 'blobs'
import { convert } from 'convert-svg-to-png'
import randomcolor from 'randomcolor'
import shajs from 'sha.js'

const isDev = process.env.NODE_ENV === 'development'

export default async function(req, res, next) {
  let svg = ''

  const title = req.query.title
  const subtitle = req.query.subtitle

  _.each(_.range(2), (i) => {
    const seed = req.query.seed ? shajs('sha256').update(req.query.seed + i).digest('hex') : null

    let blob = blobs({
      size: 1200,
      complexity: 0.4,
      contrast: 0.6,
      color: randomcolor({
        seed,
        format: 'rgba',
        alpha: 1 / 2
      }),
      stroke: {
        color: 'none',
        width: 0
      },
      seed,
      guides: false
    })

    blob = blob
      .replace(/(<svg)([^<]*|[^>]*)/g, '')
      .replace(/<\/svg>/g, '')

    switch (i) {
      case 0:
      blob = `<g transform="translate(-500, -500)"> ${blob} </g>`
      break;

      case 1:
      blob = `<g transform="translate(100, -100)"> ${blob} </g>`
      break;

      // case 2:
      // blob = `<g transform="translate(50, 150)"> ${blob} </g>`
      // break;
    }

    svg += blob
  })

  if (title) svg += `
    <text 
      y="49%" 
      x="50%" 
      text-anchor="middle" 
      alignment-baseline="baseline" 
      fill="#022c43"
      style="
        font-size: 50px; 
        font-weight: 600; 
        font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol;
      ">
    ${title}
    </text>
  `

  if (subtitle) svg += `
    <text 
      y="51%" 
      x="50%" 
      text-anchor="middle" 
      alignment-baseline="hanging" 
      fill="rgba(2, 44, 67, 0.5)"
      style="
        font-size: 30px; 
        font-weight: 600; 
        font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol;
      ">
    ${subtitle}
    </text>
  `

  svg = `<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg"> ${svg} </svg>`

  if (req.query.format === 'svg') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Content-Type': 'image/svg+xml',
      'Content-Length': svg.length
    })
    res.end(svg)
  }

  else {
    const png = await convert(svg, {
      background: 'white',
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        executablePath: isDev ? undefined : '/usr/bin/chromium-browser'
      }
    })

    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Content-Type': 'image/png',
      'Content-Length': png.length
    })
    res.end(png)
  }
}
