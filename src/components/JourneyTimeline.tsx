import React from 'react';

export interface Milestone {
  id: string;
  year: string;
  stage: string;
  title: string;
  institution: string;
  status: 'Completed' | 'In progress' | 'Ongoing' | 'Presented';
  summary: string;
  evidence: string[];
  tags: string[];
  artifactLabel: string;
}

export const MILESTONES: Milestone[] = [
  {
    id: 'milestone-ba',
    year: '2018–2021',
    stage: '01 / Academic Foundation',
    title: 'B.A. in History & Economics (Honours)',
    institution: 'Gurukul Kangri Vishwavidyalaya',
    status: 'Completed',
    summary:
      'Rigorous undergraduate disciplinary grounding in Indian history, world civilizations, and macro-economics. Developed deep commitment to historical methodology, primary source interrogation, and evidence-based analysis.',
    evidence: [
      'Graduated with CGPA 8.80 in History and Economics.',
      'Studied historiographical traditions, Partition narratives, and socio-economic systems.',
      'Formed the foundational subject-matter mastery required for senior secondary teaching.',
    ],
    tags: ['Ancient & Modern History', 'Macro-Economics', 'Historiography', 'CGPA 8.80'],
    artifactLabel: 'Graduation Diploma Folio & Academic Seal',
  },
  {
    id: 'milestone-upsc',
    year: '2021–2025',
    stage: '02 / Humanities Engagement',
    title: 'Indian Polity, Governance & Public Affairs',
    institution: 'Civil Services Humanities Preparation',
    status: 'Completed',
    summary:
      'Five years of intensive, structured study across Indian constitutional governance, public administration, geography, and socio-economic policy. Provides the breadth of multidisciplinary perspective brought into every Social Science lesson.',
    evidence: [
      'Deep analytical knowledge of the Indian Constitution, democratic institutions, and federal structures.',
      'In-depth study of developmental economics, environmental geography, and contemporary public affairs.',
      'Brings real-world civic awareness and nuanced questioning to secondary school learners.',
    ],
    tags: ['Constitutional Law', 'Governance', 'Indian Polity', 'Social Inquiry'],
    artifactLabel: 'Constitutional Governance Folios & Reference Volumes',
  },
  {
    id: 'milestone-bed-ma',
    year: '2025–Present',
    stage: '03 / Teacher Education',
    title: 'Dual B.Ed. & M.A. History in Progress',
    institution: 'Amity Institute of Education & IGNOU',
    status: 'In progress',
    summary:
      'Simultaneous formal teacher education (B.Ed. Pedagogy: Social Science / History & English) and advanced post-graduate historical scholarship (M.A. History).',
    evidence: [
      'B.Ed. at Amity University: pedagogy theory, lesson design, TLM development, and inclusive education.',
      'M.A. History at IGNOU: first year successfully cleared and completed.',
      'Final examinations expected April–June 2027; available to join schools from May 2027.',
    ],
    tags: ['B.Ed. Pedagogy', 'M.A. History', 'Lesson Planning', 'Expected May 2027'],
    artifactLabel: 'Curriculum Syllabi & Pedagogical Registers',
  },
  {
    id: 'milestone-observation',
    year: 'Nov 2025',
    stage: '04 / Classroom Observation',
    title: 'School Observation Practicum',
    institution: 'Amity International School, Mayur Vihar',
    status: 'Completed',
    summary:
      'Five days of focused pedagogical observation across Classes 6–12, studying master teachers in Social Science and History classrooms to bridge theoretical frameworks with live student engagement.',
    evidence: [
      'Analyzed classroom questioning techniques, pacing, and board utilization.',
      'Observed student-led co-curricular events and morning school assemblies.',
      'Documented strategies for encouraging differentiated inquiry among diverse learners.',
    ],
    tags: ['Classes 6–12 Observation', 'Pedagogical Observation', 'Classroom Culture'],
    artifactLabel: 'Observation Clipboard & Field Journal',
  },
  {
    id: 'milestone-iks',
    year: 'Mar 2026',
    stage: '05 / Research Presentation',
    title: 'NEP 2020 & Indian Knowledge Systems (IKS)',
    institution: 'Amity Institute of Education · Sponsored by GAIL',
    status: 'Presented',
    summary:
      'Co-authored and presented an academic research paper on embedding Indian Knowledge Systems, cultural contextualization, and experiential inquiry into modern teacher education.',
    evidence: [
      'Delivered presentation at the National Seminar on 10 March 2026.',
      'Synthesized NEP 2020 curriculum guidelines with pedagogical classroom applications.',
      'Explored methods for helping students connect heritage with critical scientific inquiry.',
    ],
    tags: ['NEP 2020', 'Indian Knowledge Systems', 'National Seminar', 'Academic Paper'],
    artifactLabel: 'Academic Paper Scroll & Conference Ribbon',
  },
  {
    id: 'milestone-pehchaan',
    year: 'Jun–Jul 2026',
    stage: '06 / Community Field Teaching',
    title: 'Foundational Literacy & Adult Education',
    institution: 'Pehchaan The Street School',
    status: 'Completed',
    summary:
      '80-hour on-ground non-formal teaching internship delivering foundational literacy, numeracy, and adult learning to underprivileged children and community members.',
    evidence: [
      'Taught foundational literacy and numeracy to Nursery, LKG, and UKG learners using activity-based methods.',
      'Facilitated ULLAS adult-literacy sessions for 5 adult community learners.',
      'Adapted instructional materials on the spot to meet varied learner starting points.',
    ],
    tags: ['80-Hour Field Teaching', 'Foundational Literacy', 'ULLAS Adult Literacy', 'Activity-Based'],
    artifactLabel: 'Foundational Chalkboard Slate & Teaching Aids',
  },
  {
    id: 'milestone-panchsheel',
    year: 'Jul–Oct 2026',
    stage: '07 / Supervised School Internship',
    title: '16-Week B.Ed. School Teaching Internship',
    institution: 'Panchsheel Balak Inter-College',
    status: 'Ongoing',
    summary:
      'Supervised 16-week comprehensive school internship taking direct instructional responsibility for Social Science (Classes 6–9), English (Classes 6 & 8), and select History classes (Class 11).',
    evidence: [
      'Delivered over 15 complete lesson plans centered on democratic inquiry, historical evidence, and student dialogue.',
      'Active weekly schedule handling multiple class sections and substitution periods.',
      'Organized school cultural events, Independence Day exhibitions, display boards, and Sports Day.',
    ],
    tags: ['16 Weeks Supervised', 'Classes 6–9 Social Science', 'Class 11 History', 'Classroom Teaching'],
    artifactLabel: 'Practicum Attendance Register & Lesson Blueprint',
  },
];

interface JourneyTimelineProps {
  activeMilestoneIndex: number;
  onSelectMilestone?: (index: number) => void;
}

export function JourneyTimeline({
  activeMilestoneIndex,
  onSelectMilestone,
}: JourneyTimelineProps) {
  return (
    <section id="journey" className="journey-section">
      <div className="content-container">
        {/* Journey Section Header */}
        <header className="journey-header">
          <p className="section-eyebrow">Chapter 02 / The Developmental Path</p>
          <h2 className="journey-title">
            The Educational &amp;<br />
            <em>Pedagogical Journey.</em>
          </h2>
          <p className="journey-lead">
            A chronological progression through academic grounding, multidisciplinary humanities study, teacher education, and real classroom practice.
          </p>
        </header>

        {/* Sticky Interactive Progress Rail */}
        <nav className="journey-rail-wrap" aria-label="Journey Milestones Progress">
          <div className="journey-rail">
            {MILESTONES.map((item, idx) => {
              const isActive = activeMilestoneIndex === idx;
              const isPast = activeMilestoneIndex > idx;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectMilestone?.(idx)}
                  className={`rail-node ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}
                  title={`${item.year}: ${item.title}`}
                >
                  <span className="rail-marker">
                    <span className="rail-dot" />
                  </span>
                  <span className="rail-label">
                    <strong className="rail-year">{item.year}</strong>
                    <span className="rail-short-title">{item.title.split(' ')[0]} {item.title.split(' ')[1]}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Milestones Flow Container */}
        <div className="milestones-flow">
          {MILESTONES.map((milestone, index) => {
            const isActive = activeMilestoneIndex === index;
            return (
              <article
                key={milestone.id}
                id={`milestone-${index}`}
                className={`milestone-card ${isActive ? 'card-active' : ''}`}
              >
                {/* Visual Spatial Anchor & Artifact Badge */}
                <div className="milestone-spatial-bar">
                  <span className="milestone-index-badge">0{index + 1}</span>
                  <div className="milestone-artifact-tag">
                    <span className="artifact-icon">◈</span>
                    <span>3D Study Artifact: {milestone.artifactLabel}</span>
                  </div>
                  <span className={`status-pill ${milestone.status.toLowerCase().replace(' ', '-')}`}>
                    {milestone.status}
                  </span>
                </div>

                {/* Milestone Main Content */}
                <div className="milestone-content">
                  <div className="milestone-dates">
                    <span className="milestone-year">{milestone.year}</span>
                    <span className="milestone-stage-label">{milestone.stage}</span>
                  </div>

                  <h3 className="milestone-headline">{milestone.title}</h3>
                  <p className="milestone-institution">{milestone.institution}</p>

                  <p className="milestone-summary">{milestone.summary}</p>

                  {/* Documented Evidence Points */}
                  <div className="milestone-evidence-box">
                    <span className="evidence-header">VERIFIED CLASSROOM &amp; ACADEMIC RECORD</span>
                    <ul className="evidence-list">
                      {milestone.evidence.map((point, pIdx) => (
                        <li key={pIdx}>{point}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Competency & Topic Tags */}
                  <div className="milestone-tags">
                    {milestone.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="milestone-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
