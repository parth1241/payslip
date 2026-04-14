import { describe, it, expect } from 'vitest'
import { validateStellarAddress } from '../stellar'

describe('Payslip Stellar Helpers', () => {
  describe('validateStellarAddress', () => {
    it('should validate correct G-addresses', () => {
      const address = 'GCCX2LJQ6EQT33SATIITWBFSZIJIYDYJU33MCKHBAK3YG6UQ6JRUYABA'
      expect(validateStellarAddress(address).valid).toBe(true)
    })

    it('should reject invalid addresses', () => {
      expect(validateStellarAddress('ABC').valid).toBe(false)
      expect(validateStellarAddress('').valid).toBe(false)
    })
  })
})
