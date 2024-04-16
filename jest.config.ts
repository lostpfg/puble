import type { Config } from "jest"

const ignoreDirs = [
	"dist/",
	"node_modules/",
]

export default async (): Promise<Config> => ({
	preset: "ts-jest",
	testEnvironment: "jsdom",
	verbose: true,
	silent: false,
	roots: ["./src"],
	transform: {
		"^.+\\.[t]sx?$": `ts-jest`,
	},
	setupFilesAfterEnv: [
		"./jest.setup.js"
	],
	testTimeout: 20000,
	moduleDirectories: ["node_modules", "src"],
	transformIgnorePatterns: [
		// "<rootDir>/node_modules/(?!(@lostpfg)/)"
	],
	testPathIgnorePatterns: ignoreDirs,
	coveragePathIgnorePatterns: ignoreDirs,
	testRegex: "(/__tests__/.*|(\\.|/)(test))\\.([t]sx?)$",
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
});