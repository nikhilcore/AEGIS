
import { describe, it, expect } from 'vitest'
import { calculateRisk } from './riskEngine'

describe('AEGIS Risk Engine', () => {
  it('calculates a weighted risk score correctly', () => {
    const result = calculateRisk({
      anomaly: 90,
      criticality: 95,
      vulnerability: 70,
      exposure: 80,
    })

    expect(result.score).toBe(86)
    expect(result.level).toBe('Critical')
  })

  it('classifies a score of 24 as Low', () => {
    const result = calculateRisk({
      anomaly: 24,
      criticality: 24,
      vulnerability: 24,
      exposure: 24,
    })

    expect(result.score).toBe(24)
    expect(result.level).toBe('Low')
  })

  it('classifies a score of 25 as Medium', () => {
    const result = calculateRisk({
      anomaly: 25,
      criticality: 25,
      vulnerability: 25,
      exposure: 25,
    })

    expect(result.score).toBe(25)
    expect(result.level).toBe('Medium')
  })

  it('classifies a score of 50 as High', () => {
    const result = calculateRisk({
      anomaly: 50,
      criticality: 50,
      vulnerability: 50,
      exposure: 50,
    })

    expect(result.score).toBe(50)
    expect(result.level).toBe('High')
  })

  it('classifies a score of 75 as Critical', () => {
    const result = calculateRisk({
      anomaly: 75,
      criticality: 75,
      vulnerability: 75,
      exposure: 75,
    })

    expect(result.score).toBe(75)
    expect(result.level).toBe('Critical')
  })

  it('classifies a score of 100 as Critical', () => {
    const result = calculateRisk({
      anomaly: 100,
      criticality: 100,
      vulnerability: 100,
      exposure: 100,
    })

    expect(result.score).toBe(100)
    expect(result.level).toBe('Critical')
  })

  it('accepts zero risk factors', () => {
    const result = calculateRisk({
      anomaly: 0,
      criticality: 0,
      vulnerability: 0,
      exposure: 0,
    })

    expect(result.score).toBe(0)
    expect(result.level).toBe('Low')
  })

  it('rejects values greater than 100', () => {
    expect(() =>
      calculateRisk({
        anomaly: 101,
        criticality: 50,
        vulnerability: 50,
        exposure: 50,
      }),
    ).toThrow()
  })

  it('rejects negative risk values', () => {
    expect(() =>
      calculateRisk({
        anomaly: -1,
        criticality: 50,
        vulnerability: 50,
        exposure: 50,
      }),
    ).toThrow()
  })

  it('rejects invalid weights', () => {
  expect(() =>
    calculateRisk(
      {
        anomaly: 50,
        criticality: 50,
        vulnerability: 50,
        exposure: 50,
      },
      {
        anomaly: 0.5,
        criticality: 0.3,
        vulnerability: 0.1,
        exposure: 0.05,
      },
    ),
  ).toThrow()
})

  it('supports custom valid weights', () => {
    const result = calculateRisk(
      {
        anomaly: 80,
        criticality: 40,
        vulnerability: 60,
        exposure: 20,
      },
      {
        anomaly: 1,
        criticality: 0,
        vulnerability: 0,
        exposure: 0,
      },
    )

    expect(result.score).toBe(80)
    expect(result.level).toBe('Critical')
  })
})
