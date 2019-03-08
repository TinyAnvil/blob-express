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
  const width = parseInt(req.query.w, 10) || 800
  const height = parseInt(req.query.h, 10) || 600
  const size = _.min([width, height]) * 2

  _.each(_.range(4), (i) => {
    const seed = shajs('sha256').update((req.query.seed || Math.random().toString()) + i).digest('hex')

    let blob = blobs({
      size,
      complexity: 0.4,
      contrast: 0.6,
      // complexity: 0.000000001,
      // contrast: 0,
      color: randomcolor({
        seed,
        format: 'rgba',
        alpha: i % 2 ? 1 / 2 : 1 / 4
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
      .replace(/(<g)([^<]*|[^>]*)/g, '')
      .replace(/<\/g>/g, '')

    // translate(left-right, top-bottom)

    switch (i) {
      case 0:
      blob = `<g transform="translate(${- size * 0.65}, ${- size * 0.10})"> ${blob} </g>`
      break;

      case 1:
      blob = `<g transform="translate(${- size * 0.45}, ${- size * 0.45})"> ${blob} </g>`
      break;

      case 2:
      blob = `<g transform="translate(${width - size * 0.40}, ${height - size * 0.65})"> ${blob} </g>`
      break;

      case 3:
      blob = `<g transform="translate(${width - size * 0.55}, ${height - size * 0.45})"> ${blob} </g>`
      break;
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

  svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"> ${svg} </svg>`

  // console.log(svg)

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
