// @ts-check

/**
 * Don't be scared of the generics here.
 * All they do is to give us autocompletion when using this.
 *
 * @template {import('next').NextConfig} T
 * @param {T} config - A generic parameter that flows through to the return type
 * @constraint {{import('next').NextConfig}}
 */
function defineNextConfig(config) {
  return config;
}

export default defineNextConfig({
  reactStrictMode: true,
  swcMinify: true,
  // Next.js i18n docs: https://nextjs.org/docs/advanced-features/i18n-routing
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  async redirects() {
    return [
      process.env.MAINTENANCE_MODE === "1" ? 
      {
        source: "/((?!maintenance).*)", 
        destination: "/maintenance.html", 
        permanent: false
      } : 
      {
        source: "/maintenance.html",
        destination: "/",
        permanent: false,
      },
    ]
  },
  // async redirects()  {
  //   return [
  //     {
  //      source: "/((?!maintenance).*)", destination: "/maintenance.html",
  //       permanent: true,
  //     },
  //   ];
  // }
});
