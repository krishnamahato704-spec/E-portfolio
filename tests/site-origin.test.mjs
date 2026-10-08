import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveSiteUrl} from '../scripts/site-origin.mjs';

test('Vercel and Pages builds have distinct, explicit canonical origins',()=>{
 assert.equal(resolveSiteUrl({}),'https://e-portfolio-lake-nine.vercel.app/');
 assert.equal(resolveSiteUrl({SITE_URL:'https://example.com/portfolio'}),'https://example.com/portfolio/');
 assert.equal(resolveSiteUrl({GITHUB_ACTIONS:'true',GITHUB_REPOSITORY:'krishnamahato704-spec/E-portfolio'}),'https://krishnamahato704-spec.github.io/E-portfolio/');
 assert.equal(resolveSiteUrl({GITHUB_ACTIONS:'true',GITHUB_REPOSITORY:'krishnamahato704-spec/E-portfolio',SITE_URL:'https://e-portfolio-lake-nine.vercel.app/'}),'https://e-portfolio-lake-nine.vercel.app/');
});
test('Invalid site URLs stop the build instead of producing inconsistent metadata',()=>{
 for(const SITE_URL of ['http://example.com/','https://user:password@example.com/','https://example.com/?token=value','https://example.com/#fragment'])assert.throws(()=>resolveSiteUrl({SITE_URL}));
});
