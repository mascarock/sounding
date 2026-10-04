# Import the demonstration corpus

These documents are invented. They are not an official navigation publication.

Import the committed seed into the existing project `59vrectd`, dataset `production`. Do not create a new project.

```bash
npx sanity dataset import sanity/seed.ndjson production --replace
```

Point the app at that dataset with the variables in `.env.example`. Deploy the schema (`sanity/schema`) with your own Studio if you want the types in the Content Lake. Until those variables are set, Sounding reads the same documents through the fixture tools.

Regenerate the NDJSON from the TypeScript source:

```bash
npm run seed:ndjson
```
