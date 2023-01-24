// eslint-disable-next-line import/no-extraneous-dependencies
import { FullConfig } from '@playwright/test/reporter'

export type HtmlReporterDataReporterConfig = {
  outputFileName?: string
}

export type ResolvedHtmlReporterDataReporterConfig = Required<HtmlReporterDataReporterConfig>

// -- Type shims for Playwright because they expose very little

export type HtmlReporterConfig = {
  outputFolder: string
}

export type FullConfigInternal = FullConfig & { _configDir: string }
