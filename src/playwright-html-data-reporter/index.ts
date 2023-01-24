import * as fs from 'fs'
import path from 'path'
// eslint-disable-next-line import/no-extraneous-dependencies
import { Reporter } from '@playwright/test/reporter'
import { ResolvedHtmlReporterDataReporterConfig, HtmlReporterConfig, FullConfigInternal, HtmlReporterDataReporterConfig } from './types'

const PLAYWRIGHT_HTML_REPORT_DATA_START_TOKEN = 'window.playwrightReportBase64 ='
const PLAYWRIGHT_HTML_REPORT_FILE_NAME = 'index.html'

const DEFAULT_CONFIG: ResolvedHtmlReporterDataReporterConfig = {
  outputFileName: 'data.txt',
}

const folderToPackageJsonPath = new Map<string, string>()

const getPackageJsonPath = (folderPath: string): string => {
  const cached = folderToPackageJsonPath.get(folderPath)
  if (cached !== undefined)
    return cached

  const packageJsonPath = path.join(folderPath, 'package.json')
  if (fs.existsSync(packageJsonPath)) {
    folderToPackageJsonPath.set(folderPath, packageJsonPath)
    return packageJsonPath
  }

  const parentFolder = path.dirname(folderPath)
  if (folderPath === parentFolder) {
    folderToPackageJsonPath.set(folderPath, '')
    return ''
  }

  const result = getPackageJsonPath(parentFolder)
  folderToPackageJsonPath.set(folderPath, result)
  return result
}

const defaultReportFolder = (searchForPackageJson: string): string => {
  let basePath = getPackageJsonPath(searchForPackageJson)
  if (basePath)
    basePath = path.dirname(basePath)
  else
    basePath = process.cwd()
  return path.resolve(basePath, 'playwright-report')
}

const reportFolderFromEnv = (): string | null => (
  process.env.PLAYWRIGHT_HTML_REPORT != null
    ? path.resolve(process.cwd(), process.env.PLAYWRIGHT_HTML_REPORT)
    : null
)

const determineHtmlReporterOutputDir = (
  htmlReporterConfig: HtmlReporterConfig | null,
  fullConfig: FullConfigInternal,
): string => reportFolderFromEnv()
  ?? (htmlReporterConfig?.outputFolder != null
    ? path.resolve(fullConfig._configDir, htmlReporterConfig.outputFolder)
    : null)
  ?? defaultReportFolder(fullConfig._configDir)

const getHtmlReporterConfig = (
  fullConfig: FullConfigInternal,
): HtmlReporterConfig => fullConfig.reporter.find(item => item[0] === 'html')[1]

export const getResults = async (
  outputDir: string,
): Promise<string | null> => {
  const htmlReportFilePath = path.join(outputDir, PLAYWRIGHT_HTML_REPORT_FILE_NAME)
  // If report file doesn't exist, skip
  if (!fs.existsSync(htmlReportFilePath))
    return null

  // Read in report file text
  const htmlReportString = fs.readFileSync(htmlReportFilePath, { encoding: 'utf8' })
  // Find the point at a bit before where the report data starts
  const indexOfMarker = htmlReportString.indexOf(PLAYWRIGHT_HTML_REPORT_DATA_START_TOKEN)
  if (indexOfMarker === -1)
    return null

  // Find the point at where the report data starts
  const startOfBase64String = htmlReportString.indexOf('"', indexOfMarker) + 1
  if (startOfBase64String === -1)
    return null

  // Find the point at where the report data ends
  const endOfBase64String = htmlReportString.indexOf('"', startOfBase64String)
  if (endOfBase64String === -1)
    return null

  // Extract the report data string
  const dataString = htmlReportString.substring(startOfBase64String, endOfBase64String).substring('data:application/zip;base64,'.length)
  if (dataString.length < 5) // TODO: What should be the lower bound?
    return null

  return dataString
}

export class HtmlReporterDataReporter implements Reporter {
  config: HtmlReporterDataReporterConfig | null
  htmlReporterConfig: HtmlReporterConfig
  outputDir: string
  fullConfig: FullConfigInternal

  constructor(_config: HtmlReporterDataReporterConfig | null) {
    this.config = _config
  }

  onBegin(_fullConfig: FullConfigInternal) {
    this.fullConfig = _fullConfig
    this.htmlReporterConfig = getHtmlReporterConfig(this.fullConfig)
    this.outputDir = determineHtmlReporterOutputDir(this.htmlReporterConfig, this.fullConfig)
  }

  async onEnd() {
    const results = await getResults(this.outputDir)
    if (results == null) {
      console.error('Could not get the Playwright results.')
      return
    }

    const outputFilePath = path.join(this.outputDir, this.config?.outputFileName ?? DEFAULT_CONFIG.outputFileName)
    fs.writeFileSync(outputFilePath, results)
  }
}
