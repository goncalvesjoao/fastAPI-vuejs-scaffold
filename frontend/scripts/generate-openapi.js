import { generateApi } from 'swagger-typescript-api'
import path from 'path'
import fs from 'fs'

async function build() {
  await generateApi({
    input: path.resolve(process.cwd(), './openapi.json'),
    output: path.resolve(process.cwd(), './src/lib/openapi'),
    // modular: true,
    // typeSuffix: 'Type',
  })

  // Read the broken Api.ts file
  const apiPath = path.resolve(process.cwd(), './src/lib/openapi/Api.ts')
  let content = fs.readFileSync(apiPath, 'utf8')

  // Regex to turn data-contracts imports into type imports
  content = content.replace(
    /import\s+{(.*?)}\s+from\s+['"]\.\/data-contracts['"]/g,
    'import type { $1 } from "./data-contracts"',
  )

  fs.writeFileSync(apiPath, content, 'utf8')
  console.log('Successfully fixed type-only imports in Api.ts!')
}

build()
