import type { Config } from 'jest'

const config: Config = {
  verbose: true,
  testEnvironment: 'node',
  testRegex: ['__tests__/.*test.[jt]sx?$'],
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  roots: ['src'],
}

export default config
