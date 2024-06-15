import { toRomaji } from 'wanakana'

const classifyKana = (a: string, n: number) => {
  const o = -1 !== smallKanaPrefix.indexOf(a[n]),
    s = -1 !== smallKanaSuffix.indexOf(a[n + 1])
  return {
    hasSmallKana: o || s,
    isSurrounded: o && -1 !== smallKanaSuffix.indexOf(a[n + 2]),
  }
}
const splitIntoMorae = (a: string) => {
  const n = []
  for (let o = 0; o < a.length; o += 1) {
    const { hasSmallKana, isSurrounded } = classifyKana(a, o)
    if (isSurrounded) {
      n.push(a[o] + a[o + 1] + a[o + 2]), (o += 2)
    } else {
      if (hasSmallKana) {
        n.push(a[o] + a[o + 1]), (o += 1)
      } else {
        n.push(a[o])
      }
    }
  }
  return n
}
const smallKanaSuffix = ['ゃ', 'ゅ', 'ょ', 'ャ', 'ュ', 'ョ']
const smallKanaPrefix = ['っ', 'ッ']

export const toIME = (a: string) => {
  return splitIntoMorae(a)
    .map(e =>
      '\u3093' === e || '\u30f3' === e
        ? 'nn'
        : '\u30fc' === e
          ? '-'
          : toRomaji(e),
    )
    .join('')
}
