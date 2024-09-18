// AI Generated
import { XMLParser, XMLBuilder } from 'fast-xml-parser'
import * as csstree from 'css-tree'

type ClassStyles = {
  [className: string]: { [key: string]: string }
}

// Utility function to convert kebab-case to camelCase
const toCamelCase = (str: string): string =>
  str.replace(/-([a-z])/g, g => g[1].toUpperCase())

export function convertSvg(svgString: string): string {
  const options = {
    ignoreAttributes: false,
    attributeNamePrefix: '@',
    parseAttributeValue: false,
    textNodeName: '#text',
  }

  const parser = new XMLParser(options)
  const svgObject = parser.parse(svgString)
  const svgElement = svgObject.svg

  // Extract and parse CSS styles
  const styleElements = findElementsWithTagName(svgElement, 'style')
  let cssText = ''
  for (const styleElement of styleElements) {
    if (typeof styleElement === 'string') {
      // If styleElement is a string, append it directly
      cssText += styleElement
    } else if (styleElement['#text']) {
      // If styleElement is an object with '#text', append the text content
      cssText += styleElement['#text']
    }
  }

  const cssAst = csstree.parse(cssText)
  const classStyles: ClassStyles = {}
  csstree.walk(cssAst, {
    visit: 'Rule',
    enter: (node: any) => {
      if (node.type === 'Rule' && node.prelude && node.block) {
        const selector = csstree.generate(node.prelude).trim()
        const classNames = selector.split(',').map(s => s.trim())
        for (const sel of classNames) {
          if (sel.startsWith('.')) {
            const className = sel.substring(1) // Remove leading '.'
            const declarations: { [key: string]: string } = {}
            node.block.children.forEach((declNode: any) => {
              if (declNode.type === 'Declaration') {
                const property = declNode.property
                let value = csstree.generate(declNode.value).trim()
                value = resolveCssVariables(value)

                // Replace stroke with 'currentColor'
                if (property === 'stroke') {
                  value = 'currentColor'
                }

                declarations[property] = resolveCssVariables(value)
              }
            })
            if (classStyles[className]) {
              Object.assign(classStyles[className], declarations)
            } else {
              classStyles[className] = declarations
            }
          }
        }
      }
    },
  })

  // Apply styles inline as attributes
  applyStylesAsAttributes(svgElement, classStyles)

  // Remove unsupported elements and attributes except 'defs' and 'clipPath'
  removeUnsupported(svgElement, ['defs', 'clipPath'])

  // Serialize back to SVG string
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@',
    textNodeName: '#text',
    format: false,
  })
  const newSvgString = builder.build(svgObject)

  return newSvgString
}

function findElementsWithTagName(node: any, tagName: string): any[] {
  let result: any[] = []
  if (node && typeof node === 'object') {
    for (const key of Object.keys(node)) {
      if (key === tagName) {
        const element = node[key]
        if (Array.isArray(element)) {
          result.push(...element)
        } else {
          result.push(element)
        }
      } else if (typeof node[key] === 'object') {
        result.push(...findElementsWithTagName(node[key], tagName))
      }
    }
  }
  return result
}

function applyStylesAsAttributes(node: any, classStyles: ClassStyles) {
  if (node && typeof node === 'object') {
    // Process attributes
    if (node['@class']) {
      const classAttr = node['@class']
      const classNames = classAttr.split(/\s+/)
      const combinedStyles: { [key: string]: string } = {}

      for (const className of classNames) {
        if (classStyles[className]) {
          Object.assign(combinedStyles, classStyles[className])
        }
      }

      // Apply styles as individual attributes
      for (const [property, value] of Object.entries(combinedStyles)) {
        const camelCaseProperty = toCamelCase(property)
        node[`@${camelCaseProperty}`] = value
      }

      // Handle inline style attribute if present
      if (node['@style']) {
        const inlineStyles = parseStyleAttribute(node['@style'])
        for (const [property, value] of Object.entries(inlineStyles)) {
          const camelCaseProperty = toCamelCase(property)
          node[`@${camelCaseProperty}`] = value
        }
        delete node['@style']
      }

      // Remove the class attribute
      delete node['@class']
    }

    // Handle elements with existing style attributes but no class
    if (node['@style'] && !node['@class']) {
      const inlineStyles = parseStyleAttribute(node['@style'])
      for (const [property, origValue] of Object.entries(inlineStyles)) {
        const camelCaseProperty = toCamelCase(property)
        let value = origValue
        if (property === 'stroke') {
          value = 'currentColor'
        }

        node[`@${camelCaseProperty}`] = value
      }
      delete node['@style']
    }

    // Recurse on child nodes
    for (const key of Object.keys(node)) {
      if (!key.startsWith('@') && key !== '#text') {
        const child = node[key]
        if (Array.isArray(child)) {
          child.forEach((c: any) => applyStylesAsAttributes(c, classStyles))
        } else {
          applyStylesAsAttributes(child, classStyles)
        }
      }
    }
  }
}

function parseStyleAttribute(style: string): { [key: string]: string } {
  const styles: { [key: string]: string } = {}
  const declarations = style.split(';')
  for (const decl of declarations) {
    if (decl.trim()) {
      const [property, value] = decl.split(':')
      if (property && value) {
        styles[property.trim()] = resolveCssVariables(value.trim())
      }
    }
  }
  return styles
}

function stringifyStyleAttribute(styles: { [key: string]: string }): string {
  return Object.entries(styles)
    .map(([property, value]) => `${property}: ${value}`)
    .join('; ')
}

function resolveCssVariables(value: string): string {
  const varRegex = /var\(--[^,]+,\s*([^)]+)\)/g
  return value.replace(varRegex, '$1')
}

function removeUnsupported(node: any, exceptions: string[] = []) {
  const unsupportedElements = ['style', 'mask']
  const unsupportedAttributes = ['clip-path'] // Add more if needed

  if (node && typeof node === 'object') {
    for (const key of Object.keys(node)) {
      if (unsupportedElements.includes(key) && !exceptions.includes(key)) {
        delete node[key]
      } else if (!key.startsWith('@') && key !== '#text') {
        const child = node[key]
        if (Array.isArray(child)) {
          node[key] = child.filter(
            (c: any) => !unsupportedElements.includes(Object.keys(c)[0]),
          )
          node[key].forEach((c: any) => removeUnsupported(c, exceptions))
        } else {
          removeUnsupported(child, exceptions)
        }
      }
    }

    const attributes = node
    for (const attr of unsupportedAttributes) {
      if (attributes[`@${attr}`]) {
        // Optionally handle unsupported attributes here
        // For now, we'll keep them if they are necessary (like clip-path)
        // So we won't delete them
        // Uncomment the next line if you want to remove them
        // delete attributes[`@${attr}`];
      }
    }
  }
}
