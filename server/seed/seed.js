require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const Announcement = require('../models/Announcement');
const AuditLog = require('../models/AuditLog');

const days = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany(), Internship.deleteMany(), Application.deleteMany(), Announcement.deleteMany(), AuditLog.deleteMany()]);
  // Make sure indexes (unique email, compound, text) exist
  await Promise.all([User.init(), Internship.init(), Application.init(), Announcement.init(), AuditLog.init()]);

  const [admin, acme, globex, s1, s2, s3] = await User.create([
    { name: 'Portal Admin', email: 'admin@portal.com', password: 'admin123', role: 'admin' },
    { name: 'Acme HR', email: 'hr@acme.com', password: 'company123', role: 'company', companyName: 'Acme Technologies', website: 'https://acme.example.com', isApproved: true },
    { name: 'Globex HR', email: 'hr@globex.com', password: 'company123', role: 'company', companyName: 'Globex Corp', isApproved: false },
    { name: 'Harsh Verma', email: 'riya@student.com', password: 'student123', profile: { college: 'MNIT Jaipur', branch: 'CSE', phone: '9876543210', skills: ['React', 'Node.js'] } },
    { name: 'Aman Verma', email: 'aman@student.com', password: 'student123', profile: { college: 'MNIT Jaipur', branch: 'ECE', skills: ['Python'] } },
    { name: 'Neha Singh', email: 'neha@student.com', password: 'student123', profile: { college: 'MNIT Jaipur', branch: 'IT', skills: ['Java', 'SQL'] } },
  ]);

  const internships = await Internship.create([
    { title: 'MERN Stack Developer Intern', description: 'Build features for our internal tools using MongoDB, Express, React and Node.', company: acme._id, location: 'Jaipur', mode: 'hybrid', stipend: 15000, durationMonths: 3, skills: ['React', 'Node.js', 'MongoDB'], deadline: days(20) },
    { title: 'Data Analyst Intern', description: 'Work with analytics team to build dashboards and reports.', company: acme._id, location: 'Remote', mode: 'remote', stipend: 10000, durationMonths: 2, skills: ['Python', 'SQL'], deadline: days(15) },
    { title: 'UI/UX Design Intern', description: 'Design and prototype user interfaces for our products.', company: acme._id, location: 'Bengaluru', mode: 'onsite', stipend: 12000, durationMonths: 2, skills: ['Figma', 'CSS'], deadline: days(30) },
    { title: 'Backend Engineer Intern', description: 'Develop REST APIs and optimise database queries.', company: acme._id, location: 'Pune', mode: 'onsite', stipend: 18000, durationMonths: 6, skills: ['Node.js', 'Express', 'MongoDB'], deadline: days(10) },
    { title: 'QA Automation Intern', description: 'Write automated tests for web applications.', company: acme._id, location: 'Remote', mode: 'remote', stipend: 8000, durationMonths: 2, skills: ['Selenium', 'JavaScript'], deadline: days(25) },
    { title: 'Mobile App Intern (Closed)', description: 'Build React Native screens.', company: acme._id, location: 'Delhi', mode: 'hybrid', stipend: 14000, durationMonths: 3, skills: ['React Native'], deadline: days(5), status: 'closed' },
  ]);

  // Minimal placeholder PDF so seeded resume links resolve
  const samplePath = path.join(__dirname, '..', 'uploads', 'sample-resume.pdf');
  if (!fs.existsSync(samplePath)) {
    fs.writeFileSync(
      samplePath,
      '%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF'
    );
  }
  const resume = '/uploads/sample-resume.pdf';
  const ago = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
  const hist = (...steps) => steps.map(([status, d]) => ({ status, at: ago(d) }));
  await Application.create([
    {
      student: s1._id, internship: internships[0]._id, coverLetter: 'I love full-stack development.', resumeUrl: resume, status: 'shortlisted',
      createdAt: ago(6), statusHistory: hist(['applied', 6], ['shortlisted', 3]),
      notes: 'Strong React portfolio. Ask about Node experience.', rating: 4,
      interview: { proposedAt: days(3), note: 'Video call, 30 minutes', status: 'proposed' },
    },
    { student: s2._id, internship: internships[0]._id, coverLetter: 'Eager to learn the MERN stack.', resumeUrl: resume, createdAt: ago(4) },
    { student: s3._id, internship: internships[0]._id, resumeUrl: resume, status: 'rejected', createdAt: ago(9), statusHistory: hist(['applied', 9], ['rejected', 7]) },
    {
      student: s1._id, internship: internships[1]._id, resumeUrl: resume, status: 'accepted', createdAt: ago(12),
      statusHistory: hist(['applied', 12], ['shortlisted', 9], ['accepted', 5]), rating: 5,
    },
    { student: s2._id, internship: internships[1]._id, resumeUrl: resume, createdAt: ago(2) },
    { student: s3._id, internship: internships[3]._id, coverLetter: 'I enjoy backend work.', resumeUrl: resume, createdAt: ago(1) },
  ]);

  // Harsh bookmarks one internship that is about to close so the dashboard alert is visible
  await Internship.updateOne({ _id: internships[3]._id }, { deadline: days(2) });
  await User.updateOne({ _id: s1._id }, { savedInternships: [internships[3]._id, internships[2]._id] });
  await Announcement.create({ message: 'Welcome to InternHub! Applications for the autumn cohort are now open.', createdBy: admin._id });

  // ---------------------------------------------------------------------------
  // Extra mock data: more companies, students, internships, applications.
  // A seeded PRNG keeps the data identical on every run.
  // ---------------------------------------------------------------------------
  let seedState = 20261104;
  const rand = () => {
    seedState = (seedState + 0x6d2b79f5) | 0;
    let t = Math.imul(seedState ^ (seedState >>> 15), 1 | seedState);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const sample = (arr, n) => [...arr].sort(() => rand() - 0.5).slice(0, n);
  const between = (a, b) => a + Math.floor(rand() * (b - a + 1));
  const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

  const extraCompanies = await User.create([
    { name: 'Initech HR', email: 'hr@initech.com', password: 'company123', role: 'company', companyName: 'Initech Labs', website: 'https://initech.example.com' },
    { name: 'Umbrella HR', email: 'hr@umbrella.com', password: 'company123', role: 'company', companyName: 'Umbrella Analytics', website: 'https://umbrella.example.com' },
    { name: 'Stark HR', email: 'hr@stark.com', password: 'company123', role: 'company', companyName: 'Stark Robotics', website: 'https://stark.example.com' },
    { name: 'Wayne HR', email: 'hr@wayne.com', password: 'company123', role: 'company', companyName: 'Wayne Finance', website: 'https://wayne.example.com' },
    { name: 'Hooli HR', email: 'hr@hooli.com', password: 'company123', role: 'company', companyName: 'Hooli Cloud', website: 'https://hooli.example.com' },
    { name: 'Pied Piper HR', email: 'hr@piedpiper.com', password: 'company123', role: 'company', companyName: 'Pied Piper', isApproved: false },
    { name: 'Soylent HR', email: 'hr@soylent.com', password: 'company123', role: 'company', companyName: 'Soylent Foods', isApproved: false },
  ]);
  const [initech, umbrella, stark, wayne, hooli] = extraCompanies;

  const colleges = ['MNIT Jaipur', 'IIT Delhi', 'BITS Pilani', 'NIT Trichy', 'VIT Vellore', 'DTU Delhi', 'IIIT Hyderabad'];
  const branches = ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'AI & DS'];
  const skillPool = ['React', 'Node.js', 'MongoDB', 'Express', 'Python', 'SQL', 'Java', 'JavaScript', 'TypeScript', 'Figma', 'CSS', 'Docker', 'AWS', 'Machine Learning', 'Selenium', 'C++', 'Git'];
  const studentNames = [
    'Ananya Gupta', 'Rohan Mehta', 'Priya Nair', 'Karan Malhotra', 'Sneha Reddy', 'Vikram Rao', 'Isha Kapoor',
    'Arjun Desai', 'Meera Iyer', 'Siddharth Jain', 'Pooja Bansal', 'Rahul Chauhan', 'Divya Menon', 'Harsh Agarwal',
  ];
  const extraStudents = await User.create(
    studentNames.map((name, idx) => ({
      name,
      email: `${name.split(' ')[0].toLowerCase()}@student.com`,
      password: 'student123',
      profile: {
        college: pick(colleges),
        branch: pick(branches),
        // leave some profiles incomplete so the completeness meter varies
        phone: idx % 3 === 0 ? undefined : `98${String(between(10000000, 99999999))}`,
        skills: sample(skillPool, between(2, 5)),
        resumeUrl: idx % 4 === 0 ? undefined : '/uploads/sample-resume.pdf',
      },
    }))
  );

  const templates = [
    [initech, 'Frontend Developer Intern', 'Build accessible React interfaces for our enterprise dashboards.', 'Bengaluru', 'hybrid', 16000, 3, ['React', 'JavaScript', 'CSS'], 18],
    [initech, 'DevOps Intern', 'Automate CI/CD pipelines and containerise services.', 'Remote (India)', 'remote', 14000, 4, ['Docker', 'AWS', 'Git'], 22],
    [initech, 'Full Stack Intern', 'Ship features across the MERN stack with a small product team.', 'Pune', 'onsite', 20000, 6, ['React', 'Node.js', 'MongoDB'], 12],
    [initech, 'Technical Writer Intern', 'Document APIs and write developer guides.', 'Remote (India)', 'remote', 6000, 2, ['Git', 'JavaScript'], 28],
    [umbrella, 'Machine Learning Intern', 'Train and evaluate models for churn and demand forecasting.', 'Hyderabad', 'onsite', 22000, 6, ['Python', 'Machine Learning', 'SQL'], 9],
    [umbrella, 'Data Engineering Intern', 'Build ETL pipelines and warehouse models.', 'Remote (India)', 'remote', 18000, 4, ['Python', 'SQL', 'AWS'], 17],
    [umbrella, 'Business Intelligence Intern', 'Create dashboards for leadership reviews.', 'Gurugram', 'hybrid', 12000, 3, ['SQL', 'Python'], 3],
    [umbrella, 'Research Intern (AI)', 'Prototype NLP experiments and write up results.', 'Hyderabad', 'onsite', 25000, 6, ['Python', 'Machine Learning'], 26],
    [stark, 'Embedded Systems Intern', 'Write firmware for robotic actuators.', 'Chennai', 'onsite', 17000, 6, ['C++', 'Git'], 14],
    [stark, 'Robotics Software Intern', 'Develop control software and simulation tools.', 'Chennai', 'hybrid', 19000, 4, ['C++', 'Python'], 20],
    [stark, 'Computer Vision Intern', 'Improve object detection accuracy on factory-floor video.', 'Bengaluru', 'onsite', 21000, 5, ['Python', 'Machine Learning'], 7],
    [stark, 'Mechanical Design Intern', 'Support CAD design and prototyping.', 'Chennai', 'onsite', 9000, 2, ['CAD', 'Git'], 24],
    [wayne, 'Quantitative Analyst Intern', 'Backtest trading strategies and report risk metrics.', 'Mumbai', 'onsite', 30000, 3, ['Python', 'SQL', 'Machine Learning'], 11],
    [wayne, 'Fintech Backend Intern', 'Build secure payment APIs with Node.js.', 'Mumbai', 'hybrid', 20000, 4, ['Node.js', 'Express', 'MongoDB'], 2],
    [wayne, 'Product Design Intern', 'Design flows for a new mobile banking app.', 'Remote (India)', 'remote', 11000, 3, ['Figma', 'CSS'], 16],
    [wayne, 'Risk Analytics Intern', 'Support credit-risk modelling and reporting.', 'Mumbai', 'onsite', 15000, 3, ['SQL', 'Python'], 30],
    [hooli, 'Cloud Engineer Intern', 'Operate and monitor distributed services on AWS.', 'Bengaluru', 'hybrid', 24000, 6, ['AWS', 'Docker', 'Node.js'], 13],
    [hooli, 'Site Reliability Intern', 'Improve observability and on-call tooling.', 'Remote (India)', 'remote', 20000, 4, ['Docker', 'Git', 'Python'], 19],
    [hooli, 'React Native Intern', 'Build features for our cross-platform mobile app.', 'Bengaluru', 'hybrid', 15000, 3, ['React', 'JavaScript', 'TypeScript'], 5],
    [hooli, 'QA Engineer Intern', 'Design end-to-end test suites.', 'Pune', 'onsite', 10000, 3, ['Selenium', 'JavaScript'], 21],
    [hooli, 'Java Backend Intern', 'Develop microservices in Java.', 'Bengaluru', 'onsite', 18000, 5, ['Java', 'SQL', 'Docker'], 15],
    [initech, 'Cybersecurity Intern (Closed)', 'Assist with vulnerability assessments.', 'Bengaluru', 'onsite', 13000, 2, ['Python', 'Git'], 4],
    [stark, 'IoT Intern (Closed)', 'Prototype sensor integrations.', 'Chennai', 'hybrid', 12000, 3, ['C++', 'Python'], 6],
    [wayne, 'Legacy Support Intern (Expired)', 'Applications closed last week.', 'Mumbai', 'onsite', 9000, 2, ['Java'], -6],
  ];
  const extraInternships = await Internship.create(
    templates.map(([company, title, description, location, mode, stipend, durationMonths, skills, deadlineDays], idx) => ({
      title, description, company: company._id, location, mode, stipend, durationMonths, skills,
      deadline: days(deadlineDays),
      status: title.includes('(Closed)') ? 'closed' : 'open',
      createdAt: daysAgo(between(1, 12) + (idx % 3)),
    }))
  );

  const allStudents = [s1, s2, s3, ...extraStudents];
  const allInternships = [...internships, ...extraInternships];
  const applyable = allInternships.filter((i) => i.status === 'open' && i.deadline > new Date());

  // Pairs already seeded above, so the unique (student, internship) index is never violated
  const taken = new Set([
    [s1, 0], [s2, 0], [s3, 0], [s1, 1], [s2, 1], [s3, 3],
  ].map(([stu, n]) => `${stu._id}:${internships[n]._id}`));

  const noteBank = [
    'Strong fundamentals, good communication.', 'Portfolio is impressive. Check availability.', 'Needs more hands-on experience.',
    'Great cover letter. Fast learner.', 'Referred by a current intern.', 'Skills match well; schedule a technical round.',
  ];
  const interviewNotes = ['Video call, 30 minutes', 'Technical round on Google Meet', 'On-site at our office', 'HR + technical combined round'];
  const statusFor = () => {
    const r = rand();
    return r < 0.4 ? 'applied' : r < 0.65 ? 'shortlisted' : r < 0.8 ? 'accepted' : 'rejected';
  };

  const extraApplications = [];
  for (const stu of allStudents) {
    for (const internship of sample(applyable, between(2, 5))) {
      const key = `${stu._id}:${internship._id}`;
      if (taken.has(key)) continue;
      taken.add(key);

      const status = statusFor();
      const age = between(1, 13); // days since applied
      const step = (n) => Math.max(0.2, age - n); // later steps happen closer to today
      const statusHistory = [{ status: 'applied', at: daysAgo(age) }];
      if (status !== 'applied') {
        if (status !== 'rejected' && rand() < 0.8) statusHistory.push({ status: 'shortlisted', at: daysAgo(step(between(1, 3))) });
        if (status === 'accepted' || status === 'rejected') statusHistory.push({ status, at: daysAgo(step(between(3, 5))) });
        if (status === 'shortlisted' && statusHistory.length === 1) statusHistory.push({ status, at: daysAgo(step(2)) });
      }

      const reviewed = status !== 'applied';
      const app = {
        student: stu._id,
        internship: internship._id,
        coverLetter: rand() < 0.6 ? `I'm excited about the ${internship.title} role and would love to contribute.` : undefined,
        resumeUrl: '/uploads/sample-resume.pdf',
        status,
        createdAt: daysAgo(age),
        statusHistory,
        notes: reviewed && rand() < 0.5 ? pick(noteBank) : undefined,
        rating: reviewed && rand() < 0.7 ? between(2, 5) : undefined,
      };
      if (status === 'shortlisted' && rand() < 0.6) {
        app.interview = {
          proposedAt: days(between(1, 9)),
          note: pick(interviewNotes),
          status: pick(['proposed', 'proposed', 'confirmed', 'declined']),
        };
      }
      extraApplications.push(app);
    }
  }
  await Application.create(extraApplications);

  // Bookmarks (kept off internships the student already applied to)
  for (const stu of extraStudents) {
    const saved = sample(applyable, between(0, 4)).filter((i) => !taken.has(`${stu._id}:${i._id}`));
    if (saved.length) await User.updateOne({ _id: stu._id }, { savedInternships: saved.map((i) => i._id) });
  }

  // Past announcements and a plausible audit trail
  await Announcement.create([
    { message: 'Resume workshop this Friday at 5 PM. Bring your questions!', active: false, createdBy: admin._id, createdAt: daysAgo(20) },
    { message: 'New companies joined this week: Initech Labs, Umbrella Analytics and Stark Robotics.', active: false, createdBy: admin._id, createdAt: daysAgo(9) },
  ]);
  const closedForAudit = allInternships.find((i) => i.title.startsWith('Cybersecurity'));
  await AuditLog.create([
    ...[acme, ...extraCompanies.slice(0, 5)].map((c, idx) => ({
      actor: admin._id, actorName: admin.name, action: 'user.approve', targetType: 'User', targetId: c._id,
      summary: `${c.name} (${c.email})`, createdAt: daysAgo(14 - idx * 2),
    })),
    { actor: admin._id, actorName: admin.name, action: 'internship.close', targetType: 'Internship', targetId: closedForAudit._id, summary: closedForAudit.title, createdAt: daysAgo(4) },
    { actor: admin._id, actorName: admin.name, action: 'announcement.create', targetType: 'Announcement', summary: 'Resume workshop this Friday at 5 PM. Bring your questions!', createdAt: daysAgo(20) },
    { actor: admin._id, actorName: admin.name, action: 'announcement.create', targetType: 'Announcement', summary: 'New companies joined this week: Initech Labs, Umbrella Analytics and Stark Robotics.', createdAt: daysAgo(9) },
  ]);

  console.log(
    `Mock data: ${await User.countDocuments()} users, ${await Internship.countDocuments()} internships, ` +
      `${await Application.countDocuments()} applications, ${await AuditLog.countDocuments()} audit entries`
  );

  console.log('Seeded. Demo logins:');
  console.log('  admin    admin@portal.com / admin123');
  console.log('  company  hr@acme.com / company123   (approved)');
  console.log('  company  hr@globex.com / company123 (pending approval)');
  console.log('  student  riya@student.com / student123');
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
