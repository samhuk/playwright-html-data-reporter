<h1 align="center">playwright-html-data-reporter</h1>
<p align="center">
  <em>Playwright reporter that makes the data used for it's html-reporter accessible</em>
</p>

<p align="center">
  </a>
  <a href="https://img.shields.io/badge/License-MIT-green.svg" target="_blank">
    <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="license" />
  </a>
  <a href="https://badge.fury.io/js/playwright-html-data-reporter.svg" target="_blank">
    <img src="https://badge.fury.io/js/playwright-html-data-reporter.svg" alt="npm version" />
  </a>
</p>

## Overview

This package provides a [Playwright Reporter](https://playwright.dev/docs/test-reporters#custom-reporters) that makes the data that their [HTML Reporter](https://playwright.dev/docs/test-reporters#html-reporter) produces and uses easily accessible.

## Usage

```typescript
import { PlaywrightTestConfig } from '@playwright/test/types/test'

const playwrightConfig: PlaywrightTestConfig = {
  ...
  reporter: [
    ['html', { open: 'never', outputFolder: './my-playwright-results' }],
    ['playwright-html-data-reporter', { outputFile: 'data.txt' }],
  ],
  ...
}
// Observe file at './my-playwright-results/data.txt' containing the data that the HTML Reporter uses
```

## Why

This package makes it easier to display Playwright test results in third-party apps.

Currently, their HTML Reporter does not expose how it produces it's data, nor makes it available via config, nor makes it otherwise easily accessible, instead only embedding it within it's "self-contained report" `index.html` file. This data, which is a zip-compressed, base-64-encoded string, can then be read and fed into front-end components like their [ReportView](https://github.com/microsoft/playwright/blob/main/packages/html-reporter/src/reportView.tsx) or a completely different component.

This comes off of the declination of [a request](https://github.com/microsoft/playwright/issues/20274) to make that data and the React component the HTML Reporter uses to render it accessible. If/when this is accepted in the future, this package can likely be deprecated.

## Development

See [./contributing/development.md](./contributing/development.md)

---

<a href="https://www.buymeacoffee.com/samhuk" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
