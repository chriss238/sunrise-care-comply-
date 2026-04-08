import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const facility = await prisma.facility.upsert({
    where: { mohLicense: 'NH-2024-0156' },
    update: {},
    create: {
      name: 'Sunrise Care Home',
      mohLicense: 'NH-2024-0156',
      lastAuditDate: new Date('2026-02-15'),
    },
  })

  // ── Compliance items ──────────────────────────────────────────────────────
  const items: Array<{ category: string; itemName: string; dueDate: Date }> = [
    { category: 'Staff certifications', itemName: 'RN Mary Tan — Practicing Certificate', dueDate: new Date('2026-02-15') },
    { category: 'Staff certifications', itemName: 'RN David Lim — CPR Certification', dueDate: new Date('2026-03-10') },
    { category: 'Staff certifications', itemName: 'EN Sarah Wong — Medication Management', dueDate: new Date('2026-04-05') },
    { category: 'Staff certifications', itemName: 'Care Aide John Koh — Dementia Care', dueDate: new Date('2026-04-22') },
    { category: 'Staff certifications', itemName: 'RN Grace Chen — Wound Care', dueDate: new Date('2026-06-15') },
    { category: 'Staff certifications', itemName: 'EN Michael Tan — Basic Life Support', dueDate: new Date('2026-07-20') },
    { category: 'Staff certifications', itemName: 'RN Alice Koh — Advanced Wound Care', dueDate: new Date('2026-09-10') },
    { category: 'Staff certifications', itemName: 'Care Aide Lisa Ng — First Aid', dueDate: new Date('2026-10-25') },
    { category: 'MOH licensing', itemName: 'Nursing Home License Renewal', dueDate: new Date('2026-03-05') },
    { category: 'MOH licensing', itemName: 'Fire Safety Certificate', dueDate: new Date('2026-05-10') },
    { category: 'MOH licensing', itemName: 'Emergency Preparedness Plan', dueDate: new Date('2026-09-30') },
    { category: 'Facility audits', itemName: 'Quarterly Infection Control Audit', dueDate: new Date('2026-04-15') },
    { category: 'Facility audits', itemName: 'Equipment Safety Check', dueDate: new Date('2026-06-01') },
    { category: 'Facility audits', itemName: 'Annual MOH Inspection', dueDate: new Date('2026-08-30') },
    { category: 'Facility audits', itemName: 'Food Safety Audit', dueDate: new Date('2026-10-05') },
    { category: 'Medication protocols', itemName: 'Medication Storage Temperature Log', dueDate: new Date('2026-04-02') },
    { category: 'Medication protocols', itemName: 'Controlled Drugs Audit', dueDate: new Date('2026-04-28') },
    { category: 'Medication protocols', itemName: 'PRN Medication Review', dueDate: new Date('2026-05-15') },
    { category: 'Medication protocols', itemName: 'High-Alert Medication Protocol Review', dueDate: new Date('2026-11-20') },
    { category: 'Resident care plans', itemName: 'Resident A — Care Plan Review', dueDate: new Date('2026-05-20') },
    { category: 'Resident care plans', itemName: 'Resident B — Care Plan Review', dueDate: new Date('2026-06-10') },
    { category: 'Resident care plans', itemName: 'Resident C — Care Plan Review', dueDate: new Date('2026-07-05') },
    { category: 'Resident care plans', itemName: 'Resident D — Care Plan Review', dueDate: new Date('2026-08-15') },
    { category: 'Resident care plans', itemName: 'Resident E — Care Plan Review', dueDate: new Date('2026-12-01') },
  ]

  for (const item of items) {
    await prisma.complianceItem.upsert({
      where: { facilityId_itemName: { facilityId: facility.id, itemName: item.itemName } },
      update: {},
      create: { facilityId: facility.id, ...item },
    })
  }

  // ── Certifications ────────────────────────────────────────────────────────
  const certs: Array<{
    category: string; type: string; holderName: string; certNumber?: string
    issuingBody: string; issueDate?: string; expiryDate: string
    renewalDate?: string; notes?: string
  }> = [
    { category: 'Staff',     type: 'RN Practicing Cert',    holderName: 'Mary Tan',          certNumber: 'RN-2024-1234', issuingBody: 'SNB',   issueDate: '2024-01-15', expiryDate: '2027-01-15', renewalDate: '2026-10-15', notes: 'Initial certification' },
    { category: 'Staff',     type: 'CPR Certification',      holderName: 'David Lim',         certNumber: 'CPR-2024-5678', issuingBody: 'SRFAC', issueDate: '2024-03-10', expiryDate: '2026-03-10' },
    { category: 'Staff',     type: 'EN Practicing Cert',     holderName: 'Sarah Wong',        certNumber: 'EN-2024-9012', issuingBody: 'SNB',   issueDate: '2024-02-01', expiryDate: '2026-04-05', renewalDate: '2026-01-05' },
    { category: 'Facility',  type: 'NH License',             holderName: 'Sunrise Care Home', certNumber: 'NH-2024-0156', issuingBody: 'MOH',   issueDate: '2024-01-01', expiryDate: '2027-12-31', renewalDate: '2027-09-01', notes: 'Primary operating license' },
    { category: 'Facility',  type: 'Fire Safety Cert',       holderName: 'Sunrise Care Home', certNumber: 'FS-2024-3456', issuingBody: 'SCDF',  issueDate: '2024-02-15', expiryDate: '2026-05-10', renewalDate: '2026-03-10' },
    { category: 'Staff',     type: 'Wound Care Cert',        holderName: 'Grace Chen',        certNumber: 'WC-2024-7890', issuingBody: 'MOH',   issueDate: '2024-01-20', expiryDate: '2026-06-15', notes: 'Advanced level' },
    { category: 'Staff',     type: 'BLS Certification',      holderName: 'Michael Tan',       certNumber: 'BLS-2024-2345', issuingBody: 'SRFAC', issueDate: '2024-04-01', expiryDate: '2026-07-20' },
    { category: 'Equipment', type: 'Medical Device License', holderName: 'MRI Machine #2',    certNumber: 'MD-2024-6789', issuingBody: 'HSA',   issueDate: '2024-03-15', expiryDate: '2027-03-15', renewalDate: '2026-12-15' },
    { category: 'Staff',     type: 'Dementia Care Cert',     holderName: 'John Koh',          certNumber: 'DC-2024-3456', issuingBody: 'MOH',   issueDate: '2024-02-20', expiryDate: '2026-08-22' },
    { category: 'Facility',  type: 'Food Hygiene Cert',      holderName: 'Sunrise Care Home', certNumber: 'FH-2024-7891', issuingBody: 'SFA',   issueDate: '2024-01-10', expiryDate: '2026-09-30', renewalDate: '2026-07-01' },
    { category: 'Staff',     type: 'RN Practicing Cert',     holderName: 'Alice Koh',         certNumber: 'RN-2024-4567', issuingBody: 'SNB',   issueDate: '2024-03-01', expiryDate: '2027-03-01', renewalDate: '2026-12-01' },
    { category: 'Staff',     type: 'First Aid Cert',         holderName: 'Lisa Ng',           certNumber: 'FA-2024-8901', issuingBody: 'SRFAC', issueDate: '2024-04-15', expiryDate: '2026-10-25' },
  ]

  // Clear existing certifications for this facility (idempotent re-seed)
  await prisma.certification.deleteMany({ where: { facilityId: facility.id } })

  for (const cert of certs) {
    await prisma.certification.create({
      data: {
        facilityId: facility.id,
        category: cert.category,
        type: cert.type,
        holderName: cert.holderName,
        certNumber: cert.certNumber ?? null,
        issuingBody: cert.issuingBody,
        issueDate: cert.issueDate ? new Date(cert.issueDate) : null,
        expiryDate: new Date(cert.expiryDate),
        renewalDate: cert.renewalDate ? new Date(cert.renewalDate) : null,
        notes: cert.notes ?? null,
      },
    })
  }

  console.log(`Seeded "${facility.name}": ${items.length} compliance items, ${certs.length} certifications.`)

  // ── Staff Certifications Module ─────────────────────────────────────────────
  await seedStaffCerts(facility.id)
}

async function seedStaffCerts(facilityId: number) {
  // Clear existing staff-cert data (idempotent)
  await prisma.chatMessage.deleteMany({})
  await prisma.certUpload.deleteMany({})
  await prisma.notificationLog.deleteMany({})
  await prisma.notificationRule.deleteMany({})
  await prisma.nurseCert.deleteMany({})
  await prisma.nurse.deleteMany({ where: { facilityId } })

  // ── 10 Nurses ──────────────────────────────────────────────────────────────
  const nurseData = [
    { name: 'Mary Tan',     email: 'mary.tan@sunrise.com',    role: 'RN',        employeeId: 'EMP-2024-001', whatsappNumber: '+6591234567', whatsappOptIn: true,  preferredLanguage: 'en',  dateJoined: new Date('2024-01-15') },
    { name: 'David Lim',    email: 'david.lim@sunrise.com',   role: 'EN',        employeeId: 'EMP-2024-002', whatsappNumber: '+6592345678', whatsappOptIn: true,  preferredLanguage: 'fil', dateJoined: new Date('2023-11-20') },
    { name: 'Sarah Wong',   email: 'sarah.wong@sunrise.com',  role: 'EN',        employeeId: 'EMP-2024-003', whatsappNumber: '+6593456789', whatsappOptIn: false, preferredLanguage: 'id',  dateJoined: new Date('2024-02-10') },
    { name: 'Grace Chen',   email: 'grace.chen@sunrise.com',  role: 'RN',        employeeId: 'EMP-2024-004', whatsappNumber: '+6594567890', whatsappOptIn: true,  preferredLanguage: 'en',  dateJoined: new Date('2023-08-01') },
    { name: 'Michael Tan',  email: 'michael.tan@sunrise.com', role: 'EN',        employeeId: 'EMP-2024-005', whatsappNumber: '+6595678901', whatsappOptIn: true,  preferredLanguage: 'en',  dateJoined: new Date('2024-03-05') },
    { name: 'Alice Koh',    email: 'alice.koh@sunrise.com',   role: 'RN',        employeeId: 'EMP-2024-006', whatsappNumber: '+6596789012', whatsappOptIn: false, preferredLanguage: 'fil', dateJoined: new Date('2023-06-15') },
    { name: 'John Koh',     email: 'john.koh@sunrise.com',    role: 'Care Aide', employeeId: 'EMP-2024-007', whatsappNumber: '+6597890123', whatsappOptIn: true,  preferredLanguage: 'en',  dateJoined: new Date('2024-04-01') },
    { name: 'Lisa Ng',      email: 'lisa.ng@sunrise.com',     role: 'Care Aide', employeeId: 'EMP-2024-008', whatsappNumber: '+6598901234', whatsappOptIn: true,  preferredLanguage: 'id',  dateJoined: new Date('2023-10-10') },
    { name: 'Priya Nair',   email: 'priya.nair@sunrise.com',  role: 'RN',        employeeId: 'EMP-2024-009', whatsappNumber: '+6599012345', whatsappOptIn: true,  preferredLanguage: 'en',  dateJoined: new Date('2024-01-20') },
    { name: 'Wei Lin',      email: 'wei.lin@sunrise.com',     role: 'EN',        employeeId: 'EMP-2024-010', whatsappNumber: '+6590123456', whatsappOptIn: false, preferredLanguage: 'en',  dateJoined: new Date('2023-12-01') },
  ]

  const nurses = await Promise.all(
    nurseData.map((n) =>
      prisma.nurse.create({ data: { facilityId, ...n } })
    )
  )

  const byEmail = Object.fromEntries(nurses.map((n) => [n.email, n]))

  // ── 30 NurseCerts ──────────────────────────────────────────────────────────
  // today = 2026-04-08; expired < today; expiring ≤30d; pending ≤60d; valid >60d
  const certData = [
    // Mary Tan (RN) — 3 certs
    { email: 'mary.tan@sunrise.com',    certType: 'RN Practicing Certificate', certNumber: 'RN-2024-1234',  holderName: 'Mary Tan',    issuingBody: 'SNB',   issueDate: '2024-01-15', expiryDate: '2027-01-15' },
    { email: 'mary.tan@sunrise.com',    certType: 'BLS Certification',          certNumber: 'BLS-2024-5678', holderName: 'Mary Tan',    issuingBody: 'SRFAC', issueDate: '2024-06-20', expiryDate: '2026-06-20' },
    { email: 'mary.tan@sunrise.com',    certType: 'Wound Care Certificate',     certNumber: 'WC-2024-1111',  holderName: 'Mary Tan',    issuingBody: 'MOH',   issueDate: '2024-01-10', expiryDate: '2026-05-01' },
    // David Lim (EN) — 3 certs
    { email: 'david.lim@sunrise.com',   certType: 'EN Practicing Certificate',  certNumber: 'EN-2024-2222',  holderName: 'David Lim',   issuingBody: 'SNB',   issueDate: '2023-11-20', expiryDate: '2027-11-20' },
    { email: 'david.lim@sunrise.com',   certType: 'CPR Certification',          certNumber: 'CPR-2024-5678', holderName: 'David Lim',   issuingBody: 'SRFAC', issueDate: '2024-03-15', expiryDate: '2026-04-11' }, // expiring ~3d
    { email: 'david.lim@sunrise.com',   certType: 'Medication Management',      certNumber: 'MM-2024-3333',  holderName: 'David Lim',   issuingBody: 'MOH',   issueDate: '2024-01-01', expiryDate: '2026-04-20' }, // expiring ~12d
    // Sarah Wong (EN) — 3 certs
    { email: 'sarah.wong@sunrise.com',  certType: 'EN Practicing Certificate',  certNumber: 'EN-2024-9012',  holderName: 'Sarah Wong',  issuingBody: 'SNB',   issueDate: '2023-02-10', expiryDate: '2026-03-18' }, // expired
    { email: 'sarah.wong@sunrise.com',  certType: 'CPR Certification',          certNumber: 'CPR-2024-9013', holderName: 'Sarah Wong',  issuingBody: 'SRFAC', issueDate: '2024-02-10', expiryDate: '2026-02-10' }, // expired
    { email: 'sarah.wong@sunrise.com',  certType: 'Infection Control',          certNumber: 'IC-2024-4444',  holderName: 'Sarah Wong',  issuingBody: 'MOH',   issueDate: '2024-03-01', expiryDate: '2026-09-01' }, // valid
    // Grace Chen (RN) — 3 certs
    { email: 'grace.chen@sunrise.com',  certType: 'RN Practicing Certificate',  certNumber: 'RN-2024-7777',  holderName: 'Grace Chen',  issuingBody: 'SNB',   issueDate: '2023-08-01', expiryDate: '2026-08-01' }, // valid
    { email: 'grace.chen@sunrise.com',  certType: 'Wound Care Certificate',     certNumber: 'WC-2024-7890',  holderName: 'Grace Chen',  issuingBody: 'MOH',   issueDate: '2024-01-20', expiryDate: '2026-06-15' }, // valid
    { email: 'grace.chen@sunrise.com',  certType: 'BLS Certification',          certNumber: 'BLS-2024-8888', holderName: 'Grace Chen',  issuingBody: 'SRFAC', issueDate: '2024-04-01', expiryDate: '2026-04-25' }, // expiring ~17d
    // Michael Tan (EN) — 3 certs
    { email: 'michael.tan@sunrise.com', certType: 'EN Practicing Certificate',  certNumber: 'EN-2024-5555',  holderName: 'Michael Tan', issuingBody: 'SNB',   issueDate: '2024-03-05', expiryDate: '2027-03-05' }, // valid
    { email: 'michael.tan@sunrise.com', certType: 'BLS Certification',          certNumber: 'BLS-2024-2345', holderName: 'Michael Tan', issuingBody: 'SRFAC', issueDate: '2024-04-01', expiryDate: '2026-07-20' }, // valid
    { email: 'michael.tan@sunrise.com', certType: 'Dementia Care Certificate',  certNumber: 'DC-2024-6666',  holderName: 'Michael Tan', issuingBody: 'MOH',   issueDate: '2024-01-05', expiryDate: '2026-04-30' }, // expiring ~22d
    // Alice Koh (RN) — 3 certs
    { email: 'alice.koh@sunrise.com',   certType: 'RN Practicing Certificate',  certNumber: 'RN-2024-4567',  holderName: 'Alice Koh',   issuingBody: 'SNB',   issueDate: '2024-03-01', expiryDate: '2027-03-01' }, // valid
    { email: 'alice.koh@sunrise.com',   certType: 'Advanced Wound Care',        certNumber: 'AWC-2024-1234', holderName: 'Alice Koh',   issuingBody: 'MOH',   issueDate: '2024-02-01', expiryDate: '2026-05-10' }, // pending ~32d
    { email: 'alice.koh@sunrise.com',   certType: 'CPR Certification',          certNumber: 'CPR-2024-4568', holderName: 'Alice Koh',   issuingBody: 'SRFAC', issueDate: '2024-03-15', expiryDate: '2026-03-01' }, // expired
    // John Koh (Care Aide) — 3 certs
    { email: 'john.koh@sunrise.com',    certType: 'Dementia Care Certificate',  certNumber: 'DC-2024-3456',  holderName: 'John Koh',    issuingBody: 'MOH',   issueDate: '2024-02-20', expiryDate: '2026-08-22' }, // valid
    { email: 'john.koh@sunrise.com',    certType: 'First Aid Certificate',      certNumber: 'FA-2024-9999',  holderName: 'John Koh',    issuingBody: 'SRFAC', issueDate: '2024-04-01', expiryDate: '2026-04-08' }, // expiring today
    { email: 'john.koh@sunrise.com',    certType: 'BLS Certification',          certNumber: 'BLS-2024-9999', holderName: 'John Koh',    issuingBody: 'SRFAC', issueDate: '2024-01-01', expiryDate: '2026-01-01' }, // expired
    // Lisa Ng (Care Aide) — 3 certs
    { email: 'lisa.ng@sunrise.com',     certType: 'First Aid Certificate',      certNumber: 'FA-2024-8901',  holderName: 'Lisa Ng',     issuingBody: 'SRFAC', issueDate: '2024-04-15', expiryDate: '2026-10-25' }, // valid
    { email: 'lisa.ng@sunrise.com',     certType: 'Infection Control',          certNumber: 'IC-2024-8902',  holderName: 'Lisa Ng',     issuingBody: 'MOH',   issueDate: '2024-01-10', expiryDate: '2026-05-20' }, // pending ~42d
    { email: 'lisa.ng@sunrise.com',     certType: 'Dementia Care Certificate',  certNumber: 'DC-2024-8903',  holderName: 'Lisa Ng',     issuingBody: 'MOH',   issueDate: '2024-02-01', expiryDate: '2026-04-15' }, // expiring ~7d
    // Priya Nair (RN) — 3 certs
    { email: 'priya.nair@sunrise.com',  certType: 'RN Practicing Certificate',  certNumber: 'RN-2024-6666',  holderName: 'Priya Nair',  issuingBody: 'SNB',   issueDate: '2024-01-20', expiryDate: '2027-01-20' }, // valid
    { email: 'priya.nair@sunrise.com',  certType: 'CPR Certification',          certNumber: 'CPR-2024-7777', holderName: 'Priya Nair',  issuingBody: 'SRFAC', issueDate: '2024-04-01', expiryDate: '2026-04-02' }, // expired ~6d ago
    { email: 'priya.nair@sunrise.com',  certType: 'Palliative Care Certificate',certNumber: 'PC-2024-1111',  holderName: 'Priya Nair',  issuingBody: 'MOH',   issueDate: '2024-03-01', expiryDate: '2026-09-01' }, // valid
    // Wei Lin (EN) — 3 certs
    { email: 'wei.lin@sunrise.com',     certType: 'EN Practicing Certificate',  certNumber: 'EN-2024-7777',  holderName: 'Wei Lin',     issuingBody: 'SNB',   issueDate: '2023-12-01', expiryDate: '2026-12-01' }, // valid
    { email: 'wei.lin@sunrise.com',     certType: 'BLS Certification',          certNumber: 'BLS-2024-7777', holderName: 'Wei Lin',     issuingBody: 'SRFAC', issueDate: '2024-01-15', expiryDate: '2026-06-01' }, // valid
    { email: 'wei.lin@sunrise.com',     certType: 'Medication Management',      certNumber: 'MM-2024-8888',  holderName: 'Wei Lin',     issuingBody: 'MOH',   issueDate: '2024-02-01', expiryDate: '2026-05-01' }, // pending ~23d... actually pending ≤60d
  ]

  const nurseCerts = await Promise.all(
    certData.map((c) =>
      prisma.nurseCert.create({
        data: {
          nurseId:    byEmail[c.email].id,
          certType:   c.certType,
          certNumber: c.certNumber,
          holderName: c.holderName,
          issuingBody: c.issuingBody,
          issueDate:  c.issueDate ? new Date(c.issueDate) : null,
          expiryDate: new Date(c.expiryDate),
        },
      })
    )
  )

  // ── 6 Notification Rules ───────────────────────────────────────────────────
  await prisma.notificationRule.createMany({
    data: [
      {
        certType: 'All Certifications', daysBeforeExpiry: 90,
        templateEn: 'Hi {name}, your {cert_type} expires in 90 days on {expiry_date}. Please plan for renewal. Reply DONE when renewed.',
        templateFil: 'Kumusta {name}, ang iyong {cert_type} ay mag-expire sa loob ng 90 araw sa {expiry_date}. Mangyaring magplano para sa renewal. Mag-reply ng DONE kapag na-renew na.',
        templateId: 'Halo {name}, {cert_type} Anda akan kedaluwarsa dalam 90 hari pada {expiry_date}. Silakan rencanakan perpanjangan. Balas DONE setelah diperpanjang.',
        active: true, escalateToAdmin: false,
      },
      {
        certType: 'All Certifications', daysBeforeExpiry: 60,
        templateEn: 'Hi {name}, your {cert_type} expires in 60 days on {expiry_date}. Time to start the renewal process. Reply DONE when complete.',
        templateFil: 'Kumusta {name}, ang iyong {cert_type} ay mag-expire sa loob ng 60 araw. Simulan na ang proseso ng renewal. Mag-reply ng DONE.',
        templateId: 'Halo {name}, {cert_type} Anda akan kedaluwarsa dalam 60 hari. Mulailah proses perpanjangan. Balas DONE.',
        active: true, escalateToAdmin: false,
      },
      {
        certType: 'All Certifications', daysBeforeExpiry: 30,
        templateEn: '⚠️ Urgent: {name}, your {cert_type} expires in 30 days ({expiry_date}). Please renew ASAP. Reply DONE when complete.',
        templateFil: '⚠️ Mahalaga: {name}, ang iyong {cert_type} ay mag-expire sa loob ng 30 araw ({expiry_date}). Mag-renew agad. Mag-reply ng DONE.',
        templateId: '⚠️ Mendesak: {name}, {cert_type} Anda akan kedaluwarsa dalam 30 hari ({expiry_date}). Harap segera perpanjang. Balas DONE.',
        active: true, escalateToAdmin: false,
      },
      {
        certType: 'All Certifications', daysBeforeExpiry: 14,
        templateEn: '🔴 Final reminder: {name}, your {cert_type} expires in 14 days ({expiry_date}). Action required immediately. Reply DONE after renewal.',
        active: true, escalateToAdmin: true, escalateDays: 3,
      },
      {
        certType: 'All Certifications', daysBeforeExpiry: 7,
        templateEn: '🚨 CRITICAL: {name}, your {cert_type} expires in 7 days ({expiry_date}). You must renew NOW or you cannot practice. Reply DONE immediately.',
        active: true, escalateToAdmin: true, escalateDays: 1,
      },
      {
        certType: 'RN Practicing Certificate', daysBeforeExpiry: 90,
        templateEn: '👩‍⚕️ SNB Renewal Alert: {name}, your RN Practicing Certificate expires {expiry_date}. SNB renewal takes 4–6 weeks — start early. Reply DONE when submitted.',
        active: true, escalateToAdmin: false,
      },
    ],
  })

  // ── 15 Notification Logs ───────────────────────────────────────────────────
  const now = new Date()
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000)
  const daysAgo  = (d: number) => new Date(now.getTime() - d * 86400000)

  await prisma.notificationLog.createMany({
    data: [
      { recipientId: byEmail['mary.tan@sunrise.com'].id,    nurseCertId: nurseCerts[0].id,  phoneNumber: '+6591234567', language: 'en',  messageText: 'Your RN Practicing Certificate expires in 30 days on 15 Jan 2027. Please renew ASAP. Reply DONE when complete.', sentAt: hoursAgo(2), deliveredAt: hoursAgo(2), readAt: hoursAgo(2), repliedAt: hoursAgo(1), replyText: 'DONE - Just uploaded new certificate', status: 'replied' },
      { recipientId: byEmail['david.lim@sunrise.com'].id,   nurseCertId: nurseCerts[4].id,  phoneNumber: '+6592345678', language: 'fil', messageText: '⚠️ Mahalaga: David, ang iyong CPR Certification ay mag-expire sa loob ng 14 araw (11 Apr 2026). Mag-renew agad. Mag-reply ng DONE.', sentAt: hoursAgo(5), deliveredAt: hoursAgo(5), status: 'delivered' },
      { recipientId: byEmail['sarah.wong@sunrise.com'].id,  nurseCertId: nurseCerts[6].id,  phoneNumber: '+6593456789', language: 'id',  messageText: 'Halo Sarah, EN Practicing Certificate Anda akan kedaluwarsa dalam 30 hari. Silakan rencanakan perpanjangan. Balas DONE.', sentAt: daysAgo(1), deliveredAt: daysAgo(1), readAt: daysAgo(1), status: 'read' },
      { recipientId: byEmail['grace.chen@sunrise.com'].id,  nurseCertId: nurseCerts[11].id, phoneNumber: '+6594567890', language: 'en',  messageText: '⚠️ Urgent: Grace, your BLS Certification expires in 17 days (25 Apr 2026). Please renew ASAP. Reply DONE when complete.', sentAt: hoursAgo(8), deliveredAt: hoursAgo(8), status: 'delivered' },
      { recipientId: byEmail['michael.tan@sunrise.com'].id, nurseCertId: nurseCerts[14].id, phoneNumber: '+6595678901', language: 'en',  messageText: '⚠️ Urgent: Michael, your Dementia Care Certificate expires in 22 days (30 Apr 2026). Please renew ASAP. Reply DONE when complete.', sentAt: daysAgo(2), deliveredAt: daysAgo(2), readAt: daysAgo(1), repliedAt: daysAgo(1), replyText: 'DONE', status: 'replied' },
      { recipientId: byEmail['lisa.ng@sunrise.com'].id,     nurseCertId: nurseCerts[23].id, phoneNumber: '+6598901234', language: 'id',  messageText: '🔴 Final reminder: Lisa, Dementia Care Certificate Anda akan kedaluwarsa dalam 7 hari (15 Apr 2026). Tindakan segera diperlukan. Balas DONE.', sentAt: hoursAgo(3), deliveredAt: hoursAgo(3), readAt: hoursAgo(3), status: 'read' },
      { recipientId: byEmail['john.koh@sunrise.com'].id,    nurseCertId: nurseCerts[19].id, phoneNumber: '+6597890123', language: 'en',  messageText: '🚨 CRITICAL: John, your First Aid Certificate expires TODAY (8 Apr 2026). You must renew NOW. Reply DONE immediately.', sentAt: hoursAgo(1), status: 'sent' },
      { recipientId: byEmail['priya.nair@sunrise.com'].id,  nurseCertId: nurseCerts[25].id, phoneNumber: '+6599012345', language: 'en',  messageText: '🔴 Final reminder: Priya, your CPR Certification expired 6 days ago (2 Apr 2026). Action required immediately. Reply DONE after renewal.', sentAt: daysAgo(3), deliveredAt: daysAgo(3), status: 'delivered', escalated: true },
      { recipientId: byEmail['alice.koh@sunrise.com'].id,   nurseCertId: nurseCerts[17].id, phoneNumber: '+6596789012', language: 'fil', messageText: 'Kumusta Alice, ang iyong CPR Certification ay nag-expire na. Mag-renew agad.', sentAt: daysAgo(5), deliveredAt: daysAgo(5), readAt: daysAgo(4), status: 'read' },
      { recipientId: byEmail['mary.tan@sunrise.com'].id,    nurseCertId: nurseCerts[1].id,  phoneNumber: '+6591234567', language: 'en',  messageText: 'Hi Mary, your BLS Certification expires in 73 days on 20 Jun 2026. Please plan for renewal. Reply DONE when renewed.', sentAt: daysAgo(7), deliveredAt: daysAgo(7), readAt: daysAgo(7), repliedAt: daysAgo(6), replyText: 'Noted, will schedule', status: 'replied' },
      { recipientId: byEmail['wei.lin@sunrise.com'].id,     nurseCertId: nurseCerts[29].id, phoneNumber: '+6590123456', language: 'en',  messageText: 'Hi Wei, your Medication Management cert expires in 23 days. Please renew ASAP. Reply DONE when complete.', sentAt: daysAgo(1), status: 'sent' },
      { recipientId: byEmail['david.lim@sunrise.com'].id,   nurseCertId: nurseCerts[5].id,  phoneNumber: '+6592345678', language: 'fil', messageText: 'Kumusta David, ang iyong Medication Management ay mag-expire sa loob ng 12 araw. Mag-renew agad.', sentAt: daysAgo(2), deliveredAt: daysAgo(2), readAt: daysAgo(2), status: 'read' },
      { recipientId: byEmail['sarah.wong@sunrise.com'].id,  nurseCertId: nurseCerts[7].id,  phoneNumber: '+6593456789', language: 'id',  messageText: 'Halo Sarah, CPR Certification Anda sudah kedaluwarsa. Harap segera perpanjang.', sentAt: daysAgo(10), deliveredAt: daysAgo(10), status: 'delivered', escalated: true },
      { recipientId: byEmail['grace.chen@sunrise.com'].id,  nurseCertId: nurseCerts[9].id,  phoneNumber: '+6594567890', language: 'en',  messageText: 'Hi Grace, your RN Practicing Certificate expires in 115 days on 1 Aug 2026. Please plan for renewal.', sentAt: daysAgo(6), deliveredAt: daysAgo(6), readAt: daysAgo(6), repliedAt: daysAgo(5), replyText: 'Thanks, will renew in June', status: 'replied' },
      { recipientId: byEmail['john.koh@sunrise.com'].id,    nurseCertId: nurseCerts[20].id, phoneNumber: '+6597890123', language: 'en',  messageText: '🚨 CRITICAL: John, your BLS Certification expired on 1 Jan 2026. You must renew NOW or you cannot practice. Reply DONE immediately.', sentAt: daysAgo(14), deliveredAt: daysAgo(14), readAt: daysAgo(13), status: 'read', escalated: true },
    ],
  })

  // ── 2 CertUploads ──────────────────────────────────────────────────────────
  await prisma.certUpload.create({
    data: {
      nurseId:      byEmail['grace.chen@sunrise.com'].id,
      nurseCertId:  nurseCerts[10].id,
      fileUrl:      'https://placehold.co/400x560/e8f4f8/1e2a4a?text=WC-2024-7890',
      uploadMethod: 'whatsapp',
      ocrStatus:    'completed',
      confidenceScore: 87.5,
      reviewStatus: 'pending',
      extractedData: JSON.stringify({
        cert_type: 'Wound Care Certificate', cert_number: 'WC-2024-7890',
        issuing_body: 'MOH', issue_date: '2024-01-20', expiry_date: '2026-06-15',
        holder_name: 'Grace Chen',
      }),
    },
  })
  await prisma.certUpload.create({
    data: {
      nurseId:      byEmail['mary.tan@sunrise.com'].id,
      nurseCertId:  nurseCerts[0].id,
      fileUrl:      'https://placehold.co/400x560/e8f4f8/1e2a4a?text=RN-2024-1234',
      uploadMethod: 'whatsapp',
      ocrStatus:    'completed',
      confidenceScore: 96.2,
      reviewStatus: 'approved',
      approvedAt:   hoursAgo(1),
      extractedData: JSON.stringify({
        cert_type: 'RN Practicing Certificate', cert_number: 'RN-2024-1234',
        issuing_body: 'SNB', issue_date: '2024-01-15', expiry_date: '2027-01-15',
        holder_name: 'Mary Tan',
      }),
    },
  })

  // ── 20 ChatMessages ────────────────────────────────────────────────────────
  const msg = (nurseEmail: string, direction: 'inbound'|'outbound', text: string, createdAt: Date, extras: object = {}) => ({
    nurseId:     byEmail[nurseEmail].id,
    phoneNumber: byEmail[nurseEmail].whatsappNumber!,
    direction,
    messageText: text,
    createdAt,
    ...extras,
  })

  await prisma.chatMessage.createMany({
    data: [
      // Conversation 1: Mary Tan (cert reminder + renewal done)
      msg('mary.tan@sunrise.com', 'outbound', '🏥 Zafyre Comply Reminder\n\nHi Mary,\n\nYour RN Practicing Certificate expires on 15 Jan 2027 (in 30 days).\n\n📋 Action needed:\n1. Renew your certificate\n2. Reply with photo/PDF of new cert\n\nReply DONE after renewal.', hoursAgo(3)),
      msg('mary.tan@sunrise.com', 'inbound',  'Hi, noted! I will go renew next week.', hoursAgo(2.5), { intent: 'help' }),
      msg('mary.tan@sunrise.com', 'outbound', 'Great, Mary! Reminder: SNB renewal typically takes 4–6 weeks. Reply DONE once submitted or send a photo of your new cert.', hoursAgo(2.4), { handledByBot: true }),
      msg('mary.tan@sunrise.com', 'inbound',  'DONE - Just uploaded new certificate', hoursAgo(1.5), { intent: 'done' }),
      msg('mary.tan@sunrise.com', 'outbound', '✅ Thank you, Mary! We received your renewal. Our admin will review and update your records shortly.', hoursAgo(1.4), { handledByBot: true }),

      // Conversation 2: David Lim (CPR expiring urgent)
      msg('david.lim@sunrise.com', 'outbound', '⚠️ Mahalaga: David,\n\nAng iyong CPR Certification ay mag-expire sa loob ng 3 araw (11 Apr 2026).\n\nMangyaring mag-renew AGAD.\n\nMag-reply ng DONE kapag kumpleto.', hoursAgo(6), { language: 'fil' }),
      msg('david.lim@sunrise.com', 'inbound',  'Kailan po ang susunod na CPR class?', hoursAgo(5.5), { intent: 'question' }),
      msg('david.lim@sunrise.com', 'outbound', 'Makipag-ugnayan sa inyong admin para sa susunod na scheduled CPR class. Para sa urgent renewal, makipag-ugnayan sa SRFAC: srfac.org.sg', hoursAgo(5.4), { handledByBot: true }),
      msg('david.lim@sunrise.com', 'inbound',  'Ok po, salamat', hoursAgo(4), { intent: 'help' }),

      // Conversation 3: Sarah Wong (expired cert — escalated)
      msg('sarah.wong@sunrise.com', 'outbound', '🚨 CRITICAL: Sarah,\n\nEN Practicing Certificate Anda sudah kedaluwarsa (18 Mar 2026).\n\nAnda tidak dapat berpraktik hingga diperpanjang.\n\nHarap segera hubungi SNB.', daysAgo(3), { language: 'id' }),
      msg('sarah.wong@sunrise.com', 'inbound',  'Saya sedang dalam proses perpanjangan', daysAgo(2.8), { intent: 'status' }),
      msg('sarah.wong@sunrise.com', 'outbound', 'Terima kasih atas pembaruannya, Sarah. Harap kirimkan salinan sertifikat baru Anda setelah selesai. Balas DONE.', daysAgo(2.7), { handledByBot: true }),
      msg('sarah.wong@sunrise.com', 'inbound',  'Baik, akan saya kirimkan setelah selesai', daysAgo(2), { intent: 'help' }),

      // Conversation 4: John Koh (expiring today — urgent)
      msg('john.koh@sunrise.com', 'outbound', '🚨 CRITICAL: John,\n\nYour First Aid Certificate expires TODAY (8 Apr 2026).\n\nYou must renew NOW or you cannot practice.\n\nReply DONE immediately.', hoursAgo(2)),
      msg('john.koh@sunrise.com', 'inbound',  'I am at SRFAC right now renewing it', hoursAgo(1.5), { intent: 'status' }),
      msg('john.koh@sunrise.com', 'outbound', 'Thank you, John! Please send a photo of your new certificate once issued. Reply DONE when complete.', hoursAgo(1.4), { handledByBot: true }),
      msg('john.koh@sunrise.com', 'inbound',  'DONE', hoursAgo(0.5), { intent: 'done' }),
      msg('john.koh@sunrise.com', 'outbound', '✅ Great work, John! Certificate received. Admin will update your records. Thank you for your prompt action!', hoursAgo(0.4), { handledByBot: true }),

      // Conversation 5: Priya Nair (expired + escalated)
      msg('priya.nair@sunrise.com', 'outbound', '🔴 Final reminder: Priya, your CPR Certification expired on 2 Apr 2026. This has been escalated to your manager. Please renew immediately and reply DONE.', daysAgo(3)),
      msg('priya.nair@sunrise.com', 'inbound',  'I had a family emergency, I will renew this week', daysAgo(2.5), { intent: 'help' }),
      msg('priya.nair@sunrise.com', 'outbound', 'We understand, Priya. Please renew as soon as possible and send your new certificate. Reply DONE when complete.', daysAgo(2.4), { handledByBot: true }),
    ],
  })

  console.log('Seeded Staff Certs module: 10 nurses, 30 certs, 6 rules, 15 logs, 2 uploads, 20 messages.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
