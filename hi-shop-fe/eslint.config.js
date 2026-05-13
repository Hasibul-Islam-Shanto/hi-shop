import nextVitals from "eslint-config-next/core-web-vitals"
import prettierConfig from "eslint-config-prettier"

const config = [
  {
    ignores: ["**/.next/**", "**/coverage/**", "**/node_modules/**", "tsconfig.tsbuildinfo"],
  },
  ...nextVitals,
  {
    rules: {
      "react-hooks/incompatible-library": "off",
    },
  },
  prettierConfig,
]

export default config
