import nextConfig from "eslint-config-next"

export default [
  // Ignore shadcn/ui components — they are third-party copy-paste components
  { ignores: ["src/components/ui/**"] },
  ...nextConfig,
]
