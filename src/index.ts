import type * as Types from '@app/Types.ts'

/**
 * Vortex simulation core logic.
 * @description Manages vortex calculations and result processing.
 */
export class Vortex {
  /** Center time coordinate. */
  private static readonly timeCenter = 180
  /** Radius for time axis. */
  private static readonly timeRadius = 180
  /** Rodin coil angles. */
  private static readonly rodinAngles = [0, 40, 80, 120, 160]
  /** Primary rodin digits. */
  private static readonly primaryDigits = [9, 8, 7, 6, 5]
  /** Secondary rodin digits. */
  private static readonly secondaryDigits = [9, 1, 2, 3, 4]
  /** Doubling circuit sequence. */
  private static readonly doublingCircuit = [1, 2, 4, 8, 7, 5, 1]
  /** Flux energy pattern. */
  private static readonly fluxPattern = [3, 6, 9, 3]

  /**
   * Calculate intersections and pivot levels.
   * @param priceHigh - Highest price level
   * @param priceLow - Lowest price level
   * @returns Array of unique results
   */
  public static calculate(priceHigh: number, priceLow: number): Types.IntersectionResult[] {
    const priceMidpoint = (priceHigh + priceLow) / 2
    const priceRadius = (priceHigh - priceLow) / 2
    const priceRange = priceHigh - priceLow
    const simulationResults: Types.IntersectionResult[] = []
    const allSimulationLines: Types.SimulationVortex[] = []
    for (let stackOffset = -1; stackOffset <= 1; stackOffset++) {
      const currentMidPrice = priceMidpoint + stackOffset * priceRange
      const stackNodes: Map<number, Types.SimulationNode> = new Map()
      this.rodinAngles.forEach((angleDeg, angleIndex) => {
        const angleRadians = (angleDeg * Math.PI) / 180
        const timeValue = this.timeCenter + this.timeRadius * Math.cos(angleRadians)
        const upperPrice = currentMidPrice + priceRadius * Math.sin(angleRadians)
        const lowerPrice = currentMidPrice - priceRadius * Math.sin(angleRadians)
        const primaryId = this.primaryDigits[angleIndex]
        const secondaryId = this.secondaryDigits[angleIndex]
        if (primaryId !== undefined) {
          stackNodes.set(primaryId, {
            timeCoordinate: timeValue,
            priceCoordinate: upperPrice,
            nodeIdentifier: primaryId
          })
        }
        if (secondaryId !== undefined) {
          stackNodes.set(secondaryId, {
            timeCoordinate: timeValue,
            priceCoordinate: lowerPrice,
            nodeIdentifier: secondaryId
          })
        }
      })
      ;[1, 4, 5, 8].forEach((targetId) => {
        const pivotNode = stackNodes.get(targetId)
        if (pivotNode) {
          simulationResults.push({
            priceValue: pivotNode.priceCoordinate,
            timeValue: pivotNode.timeCoordinate,
            originSource: `Node ${targetId} Pivot (S:${stackOffset})`
          })
        }
      })
      const getLine = (nodeSequence: number[], flowType: 'Circuit' | 'Flux') => {
        for (let nodeIndex = 0; nodeIndex < nodeSequence.length - 1; nodeIndex++) {
          const startId = nodeSequence[nodeIndex]
          const endId = nodeSequence[nodeIndex + 1]
          if (startId === undefined || endId === undefined) {
            continue
          }
          const startNode = stackNodes.get(startId)
          const endNode = stackNodes.get(endId)
          if (startNode && endNode) {
            allSimulationLines.push({
              lineName: `${flowType} ${startId}->${endId} (S:${stackOffset})`,
              startX: startNode.timeCoordinate,
              startY: startNode.priceCoordinate,
              endX: endNode.timeCoordinate,
              endY: endNode.priceCoordinate,
              flowType: flowType
            })
          }
        }
      }
      getLine(this.doublingCircuit, 'Circuit')
      getLine(this.fluxPattern, 'Flux')
    }
    for (let outerLineIndex = 0; outerLineIndex < allSimulationLines.length; outerLineIndex++) {
      for (
        let innerLineIndex = outerLineIndex + 1;
        innerLineIndex < allSimulationLines.length;
        innerLineIndex++
      ) {
        const lineFirst = allSimulationLines[outerLineIndex]
        const lineSecond = allSimulationLines[innerLineIndex]
        if (!lineFirst || !lineSecond) {
          continue
        }
        const intersectionDenominator =
          (lineFirst.startX - lineFirst.endX) * (lineSecond.startY - lineSecond.endY) -
          (lineFirst.startY - lineFirst.endY) * (lineSecond.startX - lineSecond.endX)
        if (Math.abs(intersectionDenominator) < 0.0001) {
          continue
        }
        const parameterT =
          ((lineFirst.startX - lineSecond.startX) * (lineSecond.startY - lineSecond.endY) -
            (lineFirst.startY - lineSecond.startY) * (lineSecond.startX - lineSecond.endX)) /
          intersectionDenominator
        const parameterU = -(
          (lineFirst.startX - lineFirst.endX) * (lineFirst.startY - lineSecond.startY) -
          (lineFirst.startY - lineFirst.endY) * (lineFirst.startX - lineSecond.startX)
        ) / intersectionDenominator
        if (parameterT >= 0 && parameterT <= 1 && parameterU >= 0 && parameterU <= 1) {
          simulationResults.push({
            priceValue: lineFirst.startY + parameterT * (lineFirst.endY - lineFirst.startY),
            timeValue: lineFirst.startX + parameterT * (lineFirst.endX - lineFirst.startX),
            originSource: `${lineFirst.lineName} x ${lineSecond.lineName}`
          })
        }
      }
    }
    const finalVortexResults: Types.IntersectionResult[] = []
    simulationResults.forEach((candidateResult) => {
      const isDuplicateLevel = finalVortexResults.some(
        (existingResult) =>
          Math.abs(existingResult.priceValue - candidateResult.priceValue) < 0.0001 &&
          Math.abs(existingResult.timeValue - candidateResult.timeValue) < 0.01
      )
      if (!isDuplicateLevel) {
        finalVortexResults.push(candidateResult)
      }
    })
    return finalVortexResults.sort((a, b) => b.priceValue - a.priceValue)
  }

  /**
   * Print simulation results.
   * @param results - Calculated intersection results
   * @param priceHigh - High price reference
   * @param priceLow - Low price reference
   */
  public static printResults(
    results: Types.IntersectionResult[],
    priceHigh: number,
    priceLow: number
  ): void {
    console.log(`--- VORTEX MATRIX (Price Hi: ${priceHigh}, Price Lo: ${priceLow}) ---`)
    console.log('Price'.padEnd(12), '| P-Root', '| Time (m)'.padEnd(12), '| Origin')
    console.log(''.padEnd(90, '-'))
    results.forEach((resultItem) => {
      const digitalRoot = this.calculateDigitalRoot(resultItem.priceValue)
      console.log(
        resultItem.priceValue.toFixed(4).padEnd(12),
        `| ${digitalRoot.toString().padEnd(6)}`,
        `| ${resultItem.timeValue.toFixed(2).padEnd(10)}`,
        `| ${resultItem.originSource}`
      )
    })
  }

  /**
   * Compute digital root.
   * @param inputNumber - Number to process
   * @returns Digital root value (1-9)
   */
  private static calculateDigitalRoot(inputNumber: number): number {
    const absoluteValue = Math.abs(Math.round(inputNumber * 100))
    const digitalRoot = absoluteValue % 9
    return digitalRoot === 0 ? 9 : digitalRoot
  }
}
