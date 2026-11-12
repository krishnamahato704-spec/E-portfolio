const originalPath='assets/evidence/diagnostic-assessment-report-and-tests.pdf';
const originalUrls=new Set([
 originalPath,
 './'+originalPath,
 'https://krishnamahato704-spec.github.io/E-portfolio/'+originalPath
]);
const originalContext={
 id:'diagnostic-assessment-report-and-tests',
 title:'Diagnostic Assessment Report and Tests',
 category:'Diagnostic assessment',
 subject:'Social Science',
 grade:'Class IX-A',
 date:'August–September 2026',
 context:'School internship'
};

/**
 * Returns the resource and verified short, full and CV summaries, or null when the
 * reviewed report is removed, unpublished, replaced or given a different context.
 * Copy is plain text, verified against the bundled report's pages 4 and 9–12.
 * The resource remains owner-supplied data: HTML callers must escape its fields.
 * Description edits do not turn unverified owner copy into case-study findings.
 */
export function diagnosticCaseStudy(content) {
 const resource=content?.resources?.find(item=>item.id===originalContext.id);
 if(!resource||resource.publicationStatus!=='Approved'||!originalUrls.has(resource.url)
  ||!Object.entries(originalContext).every(([key,value])=>resource[key]===value))return null;
 return {
  resource,
  shortSummary:'Across three assessments with 40 learners, reported mean scores rose from 43.10 to 48.00 out of 80.',
  shortLimitation:'The papers were not equated; the score change does not establish causation.',
  summary:'I used three 80-mark assessments and two remedial phases with 40 Class IX-A learners, refocusing map work, vocabulary and answer writing after the progress test. Reported class means were 43.10, 44.50 and 48.00 out of 80.',
  outcome:'Compared with the first test, 31 learners had higher final scores, 2 were unchanged and 7 had lower final scores.',
  limitation:'Papers were not equated for difficulty; reported score changes do not establish that remedial teaching caused them.',
  cvSummary:'Used 3 tests to revise map, vocabulary and answer practice for 40 learners; reported mean 43.10 to 48.00/80 (papers not equated).'
 };
}
