import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveSiteUrl} from '../scripts/site-origin.mjs';
import * as origins from '../scripts/site-origin.mjs';

test('Vercel and Pages builds retain distinct delivery origins',()=>{
 assert.equal(resolveSiteUrl({}),'https://e-portfolio-lake-nine.vercel.app/');
 assert.equal(resolveSiteUrl({SITE_URL:'https://example.com/portfolio'}),'https://example.com/portfolio/');
 assert.equal(resolveSiteUrl({GITHUB_ACTIONS:'true',GITHUB_REPOSITORY:'krishnamahato704-spec/E-portfolio'}),'https://krishnamahato704-spec.github.io/E-portfolio/');
 assert.equal(resolveSiteUrl({GITHUB_ACTIONS:'true',GITHUB_REPOSITORY:'krishnamahato704-spec/E-portfolio',SITE_URL:'https://e-portfolio-lake-nine.vercel.app/'}),'https://e-portfolio-lake-nine.vercel.app/');
});
test('Backup delivery keeps the primary Vercel address as its preferred search origin',()=>{
 assert.equal(typeof origins.resolveCanonicalUrl,'function');
 const pages={GITHUB_ACTIONS:'true',GITHUB_REPOSITORY:'krishnamahato704-spec/E-portfolio'};
 assert.equal(origins.resolveCanonicalUrl(pages),'https://e-portfolio-lake-nine.vercel.app/');
 assert.equal(resolveSiteUrl(pages),'https://krishnamahato704-spec.github.io/E-portfolio/');
 assert.equal(origins.resolveCanonicalUrl({CANONICAL_SITE_URL:'https://example.com/portfolio'}),'https://example.com/portfolio/');
 for(const CANONICAL_SITE_URL of ['http://example.com/','https://user:password@example.com/','https://example.com/?token=x'])assert.throws(()=>origins.resolveCanonicalUrl({CANONICAL_SITE_URL}));
});
test('Invalid site URLs stop the build instead of producing inconsistent metadata',()=>{
 for(const SITE_URL of ['http://example.com/','https://user:password@example.com/','https://example.com/?token=value','https://example.com/#fragment'])assert.throws(()=>resolveSiteUrl({SITE_URL}));
});
