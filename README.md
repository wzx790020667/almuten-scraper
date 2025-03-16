# almuten-scraper

A TypeScript library for scraping astrological chart data from [almuten.net](https://almuten.net).

## Features

- Fetches detailed astrological chart data based on birth information
- Retrieves information about planets, houses, and aspects
- Identifies astrological patterns like Grand Trines, Grand Crosses, Kites, and Stelliums
- Calculates flying houses and other astrological features
- Supports both English and Chinese localization
- Properly handles timezone conversions

## Installation

```bash
npm install almuten-scraper
# or
yarn add almuten-scraper
# or
bun add almuten-scraper
```

## Usage

### ESM (ECMAScript Modules)

```typescript
import { AlmutenScraper, BirthInfo } from "almuten-scraper";

// Create birth information object
const birthInfo: BirthInfo = {
	name: "John Doe",
	year: 1990,
	month: 1,
	day: 15,
	hour: 12,
	minute: 30,
	location: "New York, USA",
	latitude: 40.7128,
	longitude: -74.006,
};

// Create scraper instance
const scraper = new AlmutenScraper({
	birthInfo,
	options: {
		timeout: 5000, // Optional: HTTP request timeout in ms
		traditional: false, // Optional: Use traditional astrology settings
	},
});

// Get horoscope data
try {
	const horoscopeData = await scraper.getHoroscopeData();
	console.log(horoscopeData);
} finally {
	// Always close the scraper when done
	await scraper.close();
}
```

### CommonJS

```javascript
// For CommonJS environments (Node.js without "type": "module" in package.json)
const { AlmutenScraper } = require("almuten-scraper");

// Or alternatively using dynamic import
async function run() {
	const { AlmutenScraper } = await import("almuten-scraper");

	// Rest of the code...
}
```

## API Reference

### `BirthInfo` Interface

Information required to generate an astrological chart:

| Property  | Type   | Description              |
| --------- | ------ | ------------------------ |
| name      | string | Name of the person       |
| year      | number | Birth year               |
| month     | number | Birth month (1-12)       |
| day       | number | Birth day (1-31)         |
| hour      | number | Birth hour (0-23)        |
| minute    | number | Birth minute (0-59)      |
| location  | string | Birth location name      |
| latitude  | number | Birth location latitude  |
| longitude | number | Birth location longitude |

### `AlmutenScraper` Class

Main class for scraping astrological data:

#### Constructor

```typescript
constructor(config: ScraperConfig)
```

- `config`: Configuration object containing `birthInfo` and optional `options`

#### Methods

- `getHoroscopeData()`: Fetches and returns complete horoscope data
- `fetchPage(url: string)`: Fetches raw HTML from almuten.net
- `close()`: Closes connections and resources

### `HoroscopeData` Interface

The returned data structure includes:

- `birthInfo`: Original birth information
- `planets`: Array of planet positions and information
- `houses`: Array of house positions and information
- `aspects`: Array of aspects between planets
- `ascendant`: Ascendant information
- `midheaven`: Midheaven information
- `specialPoints`: Other special points in the chart

## License

See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
