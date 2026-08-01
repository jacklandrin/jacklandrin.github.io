# Bo Liu — Portfolio

Personal portfolio for [jacklandrin.com](https://www.jacklandrin.com), built with Astro from the official portfolio example.

## Local development

```sh
npm install
npm run dev
```

Run `npm run build` to create the production site in `dist/`.

## Deployment

Pushes to `main` deploy through GitHub Actions. The custom domain is configured by `public/CNAME`.

`public/appcast.xml` is copied unchanged to the root of every production build so OnlySwitch updates remain available at `/appcast.xml`.
