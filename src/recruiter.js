// Shared facts for public pages and the owner preview. No inferred eligibility.
export function studySummary(content) {
  const ongoing=content.qualifications.filter(q=>q.status==='In progress');
  return ongoing.length?ongoing.map(q=>q.title).join(' & ')+' in progress':'See the education record for qualification status.';
}

export function recruiterFacts(content) {
  const p=content.profile;
  return [
    ['Roles of interest',p.roles.join(' · ')],
    ['Earliest joining',p.availability],
    ['Based in',p.location],
    ['Work preferences',p.workPreferences],
    ['Target classes',p.targetClasses],
    ['Boards of interest',p.targetBoards],
    ['Eligibility exam',p.eligibility],
    ['Languages',p.languages.join(' · ')],
  ].filter(([,value])=>typeof value==='string'&&value.trim());
}

export function recruitmentGaps(content) {
  const p=content.profile;
  return [
    !p.location&&'Add your current city.',
    !p.workPreferences&&'Add location or relocation preferences.',
    !p.targetClasses&&'Add the classes you want to teach.',
    !p.targetBoards&&'Add boards of interest; distinguish these from experience.',
    !p.eligibility&&'Add the current eligibility exam status.',
    !p.availability&&'Add earliest joining availability.',
    !p.cv&&'Optional: attach a current CV PDF. The printable résumé remains available.',
    !content.resources.length&&'Add a lesson plan or assessment when you have one ready to share.',
  ].filter(Boolean);
}
