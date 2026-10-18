# CI and deployment

The starter workflow validates configuration, typechecks, tests, exports static HTML and runs browser/export checks on main/development and pull requests. It does not deploy or use any personal repository secrets.

To publish your own site, build with PORTFOLIO_INDEXABLE=true and configure site.url to your own HTTPS origin. Host application/out on a root-domain static host or your own GitHub Pages user site. Project-subpath hosting requires additional routing work. Set up your own domain/DNS/HTTPS.

For separate source and Pages repositories, tools/portfolio/publish.mjs can prepare a destination checkout with --source, --destination, --revision and --repository; use --dry-run first. It preserves destination CNAME/README/history and only replaces managed generated files. Add your own scoped deployment workflow and credentials when ready. No built-in workflow points at another person's repository.
