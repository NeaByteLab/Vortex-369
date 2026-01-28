# Vortex-369 [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Core vortex simulation for rodin math and price processing.

## Installation

To get started with Vortex-369, clone the repository to your local machine:

```bash
git clone https://github.com/NeaByteLab/Vortex-369.git
cd Vortex-369
```

This project uses [Deno](https://deno.com/). Ensure you have Deno installed on your system.

## Usage

You can use the `Vortex` class to calculate pivot levels based on high and low price ranges.

```typescript
import { Vortex } from './src/index.ts'

const priceHigh = 1.085
const priceLow = 1.08

// Calculate vortex intersection results
const results = Vortex.calculate(priceHigh, priceLow)

// Print results to console in a formatted table
Vortex.printResults(results, priceHigh, priceLow)
```

## API Reference

### `Vortex.calculate(priceHigh, priceLow)`

Calculates intersections and pivot levels based on the provided price range using Rodin coil mathematics.

**Parameters:**

- `priceHigh: number` - The highest price level of the session/range.
- `priceLow: number` - The lowest price level of the session/range.

**Returns:** `IntersectionResult[]` - An array of unique intersection results sorted by price value.

### `Vortex.printResults(results, priceHigh, priceLow)`

Prints the intersection results in a formatted table to the console, including the digital root of each price level.

**Parameters:**

- `results: IntersectionResult[]` - The array of results obtained from `calculate()`.
- `priceHigh: number` - High price reference for the header.
- `priceLow: number` - Low price reference for the header.

## Data Structures

```typescript
export interface IntersectionResult {
  priceValue: number // The calculated intersection price level
  timeValue: number // The calculated time coordinate (minutes)
  originSource: string // Description of the intersecting lines
}
```

## Features

- **Rodin Coil Angles**: Uses specific 0°, 40°, 80°, 120°, 160° angles for geometric projection.
- **Doubling Circuit & Flux Pattern**: Implements doubling (1-2-4-8-7-5) and flux (3-6-9) sequences.
- **Digital Root Calculation**: Automatically calculates the digital root for price levels.
- **Recursive Stacking**: Supports multi-level stacking for expanded projections.

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
