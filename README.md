# Word Scribble

A complete static word-tools website built with HTML, CSS and JavaScript.

## Included tools

- Word Scrambler
- Letter Arrangement / Unscrambler
- Anagram Generator
- Random Word Generator
- Word & Character Counter
- Text Tools

## Deployment

### Cloudflare Pages
1. Push this folder to a GitHub repository.
2. In Cloudflare, open **Workers & Pages**.
3. Create a Pages project and connect your GitHub repository.
4. Framework preset: **None**.
5. Build command: leave blank.
6. Build output directory: `/` or leave blank depending on the Pages UI.
7. Deploy.

### Important before launch

Replace every occurrence of:

`https://www.wordscribble.com`

with your actual domain.

Also replace:

`contact@wordscribble.com`

with your real email address.

## SEO

The project already includes:
- robots.txt
- sitemap.xml
- meta titles/descriptions
- semantic HTML
- mobile responsive layout

After deploying:
1. Add your site to Google Search Console.
2. Verify ownership.
3. Submit `/sitemap.xml`.
4. Request indexing for important pages.

## AdSense

Do not paste ad code until the website has real content and the required policy pages are ready.
When approved, add the AdSense script inside the `<head>` of pages where ads will be shown.

## Notes

The current Unscrambler and Anagram tools generate letter arrangements in the browser.
For real dictionary validation, connect a dictionary API or include a licensed word list later.
