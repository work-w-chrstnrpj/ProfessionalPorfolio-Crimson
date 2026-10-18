# Crimson Portfolio Starter

A generic, configurable portfolio built with Next.js, React and TypeScript. All default identity, employment, education and project content is placeholder data. The portrait is an original geometric SVG; no real person's portrait, resume or contact information is included.

## Start locally

Requires Node.js >=22.12 (CI uses Node 24).

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. For static preview run npm run verify:portfolio then npm run preview at http://127.0.0.1:4183.

## Personalize

1. Replace the nine JSON files in application/src/config with your identity, history, skills, services and projects.
2. Replace public/media/portrait-placeholder.svg with your own approved portrait and update profile.portrait.
3. Replace the six sample Markdown stories in application/src/content. Add/remove/reorder projects as needed.
4. Add your resume PDF under public/media and set profile.resume.available=true plus its /media/ path. The sample download starts disabled.
5. Set site.url to your own HTTPS origin and replace all example.com email/social/project links.
6. Set up your own Web3Forms account, copy application/.env.example to ignored application/.env.local and configure your public form identifier. Contact starts disabled; enable it only after your recipient, anti-spam and domain setup works.
7. Validate, build and test before publishing. Remove unused sample assets.

- [Full configuration guide](application/README.md)
- [Checks and deployment](.github/workflows/README.md)
- [Test commands](tests/README.md)

## Structure

- application/: components, routes, JSON content/configuration, stories and public assets.
- tools/portfolio/: validation, static preview, export finalization and optional safe publication helper.
- tests/: component/configuration, browser, export and helper tests, plus synthetic reuse fixtures.

The starter has no AI-agent scaffolding, backend, database or automatic deployment to someone else's site. CI only builds and tests.

## License

See LICENSE and font notices under application/public/licenses. Placeholder content is fictional; replace it with accurate information and assets you have permission to publish.
