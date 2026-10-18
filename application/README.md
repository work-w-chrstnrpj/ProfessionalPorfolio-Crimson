# Configuration and reuse guide

Next 16.4.2 / React 19.3.1, static export, trailing slashes, unoptimized images and root production paths. Node >=22.12.0; npm workspaces. Run `npm ci` at root.

- `npm run dev`: local Next server at 127.0.0.1:3000, no backend.
- `npm run typecheck`: generate Next route types and check the application workspace.
- `npm run test:portfolio`: Vitest portfolio tests.
- `npm run build`: export application/out .
- `npm run test:smoke`: inspect exported HTML, 404 and asset references after build.
- `npm run verify:portfolio`: all four checks in order.
- `npm run preview`: serve application/out at 127.0.0.1:4183.

The application uses nine strict JSON files in src/config and one build-time loader in src/lib/config.ts. Run `npm run validate:content` from root; every build validates automatically. Unsupported fields, unsafe URLs, duplicate IDs/slugs, invalid dates, missing/escaping media, unsupported tokens and low text contrast fail with file/field errors. Arrays preserve configured order; optional empty sections hide from derived navigation. Supported fonts are Manrope/Michroma. Optional Markdown files go under src/content.

For a synthetic build: `PORTFOLIO_CONFIG_DIR=/absolute/path/to/tests/fixtures/synthetic npm run build`. This changes public content and metadata without component edits. It is public build configuration, never a private credentials file. .env.example documents the public, browser-visible form key; contact is disabled until separately verified.

The application provides a responsive header/hero, About/timelines, project directory/filter, services/skills, resume download, Contact/footer, generated project details, privacy, 404, robots and sitemap. Install Chromium with `npx playwright install chromium`, then run `npm run test:e2e` against the static output. Case studies support plain `##` headings and paragraphs; HTML/links are rendered as text. Configure labels/privacy text in site.copy.auxiliary. PORTFOLIO_INDEXABLE defaults false; set true for production. Canonicals derive from site.url. No application API or service process is required.

Empty project arrays are supported: a reserved build-only 404 parameter satisfies Next export, and tools/portfolio/finalize-export.ts removes that artifact. It never creates a configured project or navigation link. Export tests compare actual project directories and sitemap to configured records.

## Reuse the portfolio

Use Node.js >=22.12.0 and the committed package-lock.json. From a clean source checkout:

```sh
npm ci
npm run validate:content
npm run verify:portfolio
npx playwright install chromium
npm run test:e2e
npm run preview
```

Preview opens at http://127.0.0.1:4183. Development uses `npm run dev` at port 3000. Run commands from the repository root. `npm test` runs portfolio unit/component and publication-helper tests.

To try a different identity without changing components, point the shell build setting at the complete synthetic directory:

```sh
PORTFOLIO_CONFIG_DIR="$PWD/tests/fixtures/synthetic" npm run validate:content
PORTFOLIO_CONFIG_DIR="$PWD/tests/fixtures/synthetic" npm run build
PORTFOLIO_CONFIG_DIR="$PWD/tests/fixtures/synthetic" npm run test:smoke
npm run preview
```

Keep PORTFOLIO_CONFIG_DIR in the shell, not only application/.env.local: the prebuild validator runs before Next loads that file. An absolute config directory must contain all nine JSON files. The synthetic fixture is fictional Alex content and is suitable for testing, not production. Run `npm run build` without the override to restore the starter output before default browser tests. Do not run concurrent builds into the same output directory.

For your own portfolio, copy the nine JSON files into your own config directory or edit application/src/config. Replace every identity/contact/project/story reference, add only your approved public assets, and rebuild. The validator reports exact file/field paths. It checks structure, references and contrast; it does not verify authorship, claims, image rights or provider delivery.

| File | Required field groups and supported behavior |
| --- | --- |
| site.json | title, description, root HTTPS url, language; navigation `{id,label}` and sections `{id,visible}`; copy for headings/actions/menu/footer; copy.auxiliary for detail labels, privacy sections/links and 404. Optional socialImage uses the image record below. |
| profile.json | name/fullName/wordmark, roles, biography, email, optional location/portrait; hero desktop/mobile headlines/copy/actions/disciplines; socials; expertise; resume `{available,label,note?,path?}`. Available resume requires an existing PDF. |
| experience.json | Ordered records with id, employer/title, YYYY-MM start, current, displayDates, description/highlights, optional URL; past roles require end, current roles omit it. |
| education.json | id, institution/qualification, description, status (awaiting-graduation/completed/studying), optional YYYY-MM start/end and URL. State qualifications accurately. |
| skills.json | Ordered groups with id/title, nonempty technologies, optional supported icon. No proficiency scores. |
| projects.json | id/slug/title/summary, categories/stack, role/status/featured, screenshots array; optional repository/live, caseStudy, caseStudyHeadings, video. Arrays determine row/route order; featured is data, not an automatic sort. |
| services.json | Ordered id/title/description/scope/icon, optional action `{label,section}`. |
| theme.json | Exact supported color keys, Manrope/Michroma font choices, bounded gutters/card gaps/padding/control height and motion none/subtle. Defaults are the approved Figma aesthetic; opting into different values requires your own review. |
| contact.json | provider web3forms, enabled, timeoutMs, labels, inquiry options and response copy. Public access key belongs in build settings, not this file. Disabled mode attempts no request. |

All field spellings and optionality are defined by application/src/lib/config.ts; the complete default and synthetic JSON files are working examples. IDs/slugs are unique lowercase kebab-case. Web links require HTTPS without embedded credentials. Social links support validated mailto. Supported icon keys are software/fullstack/integration/ai/github/linkedin/email; social icons are github/linkedin/email. New layouts/fonts/icon keys need code changes.

Image records are `{src,alt,width,height,provenance}`; src points to an existing local `/media/` file, dimensions are positive integers and alt/provenance are required. Use reviewed PNG/JPEG/WebP/AVIF/SVG. A path check does not sanitize image contents. Replace/remove unused personal assets from public/media in your own copy: static export copies public assets even when no page references them. Remove unused placeholder assets when you replace them.

A project caseStudy points to a relative local `.md` file under application/src/content. The supported subset is blank-line-separated paragraphs and `##` headings. Other markup stays literal text; no HTML execution or embedded links. Use configured repository/live actions for evidence URLs. Remove unreferenced personal stories from your copy as well. Optional video supports direct MP4/WebM or an external HTTPS video page with an image poster and local transcript; see the preview-media guide below.

Add/remove/reorder records by editing arrays, then validate/build again. Removing all projects is supported; the Projects section/navigation disappears and no project route is published. Hide a section with visible=false; derived navigation and targeted actions hide with it. A hidden Projects section can retain direct project pages for configured records. Supported section IDs are about/project/service/contact; do not invent arbitrary section IDs. Long/additional records expand the layout rather than clipping to reference heights.

## Form and production boundaries

Keep contact.enabled=false until the recipient form, public key, mandatory provider hCaptcha setting and permitted domain have been verified. Copy .env.example to ignored application/.env.local and supply only the public form key when ready. That key is visible in browser output even if injected from an Actions secret; never put SMTP/account passwords or private provider credentials in a static build. The provider controls recipient and delivery settings. Verify one separately authorized synthetic send and actual inbox receipt; mocks and a positive provider response do not establish inbox delivery. Review exact provider/inbox retention before activation and update privacy copy accordingly. No test suite sends real email.

site.url is the production HTTPS root origin. Canonicals/sitemap/social URLs derive from it; previews remain noindex unless PORTFOLIO_INDEXABLE=true is explicitly set for a reviewed production build. The implemented routing is a root-site deployment; project-subpath hosting is not supported by merely changing site.url. Configure a root custom domain/user site, or separately implement/test subpath routing. Do not use a repository subpath without implementing corresponding routing.

Build output belongs in your own static hosting destination. The starter CI only verifies; it never publishes to a preconfigured personal site. See ../.github/workflows/README.md for deployment guidance.

## License and asset limits

Root LICENSE contains the inherited MIT license text. Retain applicable dependency notices and review attribution for your own distribution. Manrope and Michroma license files are retained under public/licenses. Use only content and assets you own or have permission to publish. The synthetic avatar is a locally authored geometric fixture. Project source links do not grant blanket rights to each project or its dependencies. This guide records these limits; it does not certify external licenses or private media rights.

The optional synthetic PDF is retained outside public output at tests/fixtures/synthetic-assets/example-resume.pdf. In a disposable reuse copy, copy it to application/public/media/example-resume.pdf and set the copied synthetic profile’s resume.available=true and path=/media/example-resume.pdf. It contains fictional test text only. Do not publish it as a real CV. The fixture supports validating content replacement without component edits.

Browser layout regression: run npm run test:layout with Google Chrome installed and Playwright WebKit available (`npx playwright install webkit`). Covers seven widths, native anchor destinations, equal hero buttons and horizontal overflow. The compact 72px sticky header uses a single 22px root scroll offset plus existing 70px section padding; do not reintroduce a second section scroll margin.

## Configurable project story headings

Set site-wide defaults in `src/config/site.json` under `copy.auxiliary.caseStudyHeadings`:

```json
"caseStudyHeadings": { "Problem": "Purpose & Goals" }
```

For a particular project, add the optional same-named object to its entry in `src/config/projects.json`:

```json
"caseStudyHeadings": { "Problem": "Skills Showcase", "Approach": "What I Built" }
```

Keys match the original `##` heading text in the referenced Markdown case study exactly (case-sensitive). Project labels override global labels; unmatched headings retain their original wording. Missing maps default to empty, keeping older configs valid. All labels must be nonempty plain text. Labels change headings only; narrative paragraphs, section order and project titles remain as authored. Edit the Markdown body to explain the project's actual purpose, whether addressing a challenge, exploring an idea or demonstrating skills. Rebuild after config/content edits. No component changes are needed.

## Project-detail preview media

Each detail page shows a responsive 16:9 preview between its summary and facts divider. With no media, it uses the homepage motif and configured `site.copy.projectPreview` text. A project's first screenshot replaces the placeholder; a configured video poster takes priority.

For your own project previews, use the existing project `video` record:

```json
"video": {
  "url": "/media/project-preview.mp4",
  "poster": {
    "src": "/media/project-poster.webp",
    "alt": "Describe the actual project preview",
    "width": 1600,
    "height": 900,
    "provenance": "Record the approved capture/source and rights"
  },
  "transcript": "/media/project-transcript.txt",
  "captions": "/media/project-captions.vtt"
}
```

Add the real files under `application/public/media/` before referencing them. Local video paths must be MP4/WebM; HTTPS video URLs remain supported. Direct MP4/WebM uses native controls, plays inline, has no autoplay, and uses preload=none. A transcript link is provided; optional WebVTT captions use the configured site language. Include captions when the video contains speech. External video pages (such as YouTube) use a poster link, without a third-party embed. The starter ships no video assets. Add your own approved recordings; native-player structure is covered by component tests.

The six sample Markdown stories demonstrate Purpose & Goals, Approach and Engineering decisions. Replace them with your own factual project accounts.

The default resume is unavailable. Add your own PDF and set resume.available=true with its local /media/ path. Omit resume.note to hide supporting text.
