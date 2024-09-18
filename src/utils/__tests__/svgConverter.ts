import { convertSvg } from '../svgConverter'

describe('svgConverter', () => {
  test('convert evening radical svg', () => {
    const orig = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><clipPath id="a"><path d="M260 300h583l-.03 143.35L780 521.42 571.44 780H260V300z" class="a"/></clipPath><clipPath id="b"><path d="M1097 1103 0 1106V855.77L523.2 60H1097v1043z" class="a"/></clipPath><style>.a,.c{fill:none}.c{stroke:var(--color-text, #000);stroke-linecap:square;stroke-miterlimit:2;stroke-width:68px}</style></defs><path d="m421 489 244 175" class="c" style="clip-path:url(#a)"/><path d="M418 220h442c-80 360-240 600-640 720" class="c" style="clip-path:url(#b)"/><path d="M469 60c-41 200-159 378-329 480" class="c"/></svg>`
    const expected = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><clipPath id="a"><path d="M260 300h583l-.03 143.35L780 521.42 571.44 780H260V300z" fill="none"></path></clipPath><clipPath id="b"><path d="M1097 1103 0 1106V855.77L523.2 60H1097v1043z" fill="none"></path></clipPath></defs><path d="m421 489 244 175" fill="none" stroke="currentColor" strokeLinecap="square" strokeMiterlimit="2" strokeWidth="68px" clipPath="url(#a)"></path><path d="M418 220h442c-80 360-240 600-640 720" fill="none" stroke="currentColor" strokeLinecap="square" strokeMiterlimit="2" strokeWidth="68px" clipPath="url(#b)"></path><path d="M469 60c-41 200-159 378-329 480" fill="none" stroke="currentColor" strokeLinecap="square" strokeMiterlimit="2" strokeWidth="68px"></path></svg>`

    const converted = convertSvg(orig)
    expect(converted).toMatch(expected)
  })
})
