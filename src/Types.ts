/**
 * Represents a simulation node.
 * @description Coordinate and identifier data for points.
 */
export interface SimulationNode {
  /** Time axis coordinate. */
  timeCoordinate: number
  /** Price axis coordinate. */
  priceCoordinate: number
  /** Digital root identifier. */
  nodeIdentifier: number
}

/**
 * Represents a vortex line.
 * @description Line data connecting two nodes.
 */
export interface SimulationVortex {
  /** Descriptive line name. */
  lineName: string
  /** Starting X coordinate. */
  startX: number
  /** Starting Y coordinate. */
  startY: number
  /** Ending X coordinate. */
  endX: number
  /** Ending Y coordinate. */
  endY: number
  /** Flow type category. */
  flowType: string
}

/**
 * Represents intersection results.
 * @description Data point where lines intersect.
 */
export interface IntersectionResult {
  /** Intersection price value. */
  priceValue: number
  /** Intersection time value. */
  timeValue: number
  /** Source lines origin. */
  originSource: string
}
