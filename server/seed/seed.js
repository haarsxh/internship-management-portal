require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');
const Internship = require('../models/Internship');
const Application = require('../models/Application');

const days = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany(), Internship.deleteMany(), Application.deleteMany()]);
  // Make sure indexes (unique email, compound, text) exist
  await Promise.all([User.init(), Internship.init(), Application.init()]);

  const [admin, acme, globex, s1, s2, s3] = await User.create([
    { name: 'Portal Admin', email: 'admin@portal.com', password: 'admin123', role: 'admin' },
    { name: 'Acme HR', email: 'hr@acme.com', password: 'company123', role: 'company', companyName: 'Acme Technologies', website: 'https://acme.example.com', isApproved: true },
    { name: 'Globex HR', email: 'hr@globex.com', password: 'company123', role: 'company', companyName: 'Globex Corp', isApproved: false },
    { name: 'Riya Sharma', email: 'riya@student.com', password: 'student123', profile: { college: 'MNIT Jaipur', branch: 'CSE', phone: '9876543210', skills: ['React', 'Node.js'] } },
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
  await Application.create([
    { student: s1._id, internship: internships[0]._id, coverLetter: 'I love full-stack development.', resumeUrl: resume, status: 'shortlisted' },
    { student: s2._id, internship: internships[0]._id, coverLetter: 'Eager to learn the MERN stack.', resumeUrl: resume },
    { student: s3._id, internship: internships[0]._id, resumeUrl: resume, status: 'rejected' },
    { student: s1._id, internship: internships[1]._id, resumeUrl: resume, status: 'accepted' },
    { student: s2._id, internship: internships[1]._id, resumeUrl: resume },
    { student: s3._id, internship: internships[3]._id, coverLetter: 'I enjoy backend work.', resumeUrl: resume },
  ]);

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
