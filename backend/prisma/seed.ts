import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Admin user
  const passwordHash = await bcrypt.hash('Admin2026!', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gestionalebroker.it' },
    update: {},
    create: {
      email: 'admin@gestionalebroker.it',
      passwordHash,
      firstName: 'Admin',
      lastName: 'Sistema',
      role: UserRole.ADMIN,
      isActive: true,
    },
  })
  console.log(`✅ Admin user: ${admin.email}`)

  // Casse di default
  const cashAccounts = [
    { name: 'Cassa Principale', type: 'cassa', description: 'Cassa fisica principale' },
    { name: 'Cassa Scudieri', type: 'cassa', description: 'Cassa Scudieri' },
    { name: 'Cassa Mobility', type: 'cassa', description: 'Cassa Mobility' },
    { name: 'Conto Corrente', type: 'banca', description: 'Conto corrente bancario principale' },
    { name: 'POS', type: 'pos', description: 'Terminale POS' },
  ]

  for (const ca of cashAccounts) {
    await prisma.cashAccount.upsert({
      where: { name: ca.name },
      update: {},
      create: ca,
    })
  }
  console.log(`✅ Cash accounts: ${cashAccounts.length} creati`)

  // Partner di default (dal documento)
  const partners = [
    { name: 'DLG', type: 'intermediario', code: 'DLG' },
    { name: 'FBA CVT', type: 'compagnia', code: 'FBA_CVT' },
    { name: 'INFODRIVE', type: 'intermediario', code: 'INFODRIVE' },
    { name: 'FINAIP', type: 'intermediario', code: 'FINAIP' },
    { name: 'UNIZULLO', type: 'compagnia', code: 'UNIZULLO' },
    { name: 'GENERTEL', type: 'compagnia', code: 'GENERTEL' },
    { name: 'VIGLIOTTI', type: 'intermediario', code: 'VIGLIOTTI' },
    { name: 'REALE MUTUA AV', type: 'compagnia', code: 'REALE_MUTUA' },
    { name: 'DI.CA.', type: 'intermediario', code: 'DICA' },
    { name: 'LM FINAIP', type: 'intermediario', code: 'LM_FINAIP' },
    { name: 'NOBIS', type: 'compagnia', code: 'NOBIS' },
    { name: 'GROUPAMA', type: 'compagnia', code: 'GROUPAMA' },
    { name: 'PRIMAPVT', type: 'compagnia', code: 'PRIMAPVT' },
    { name: 'WAKAM', type: 'compagnia', code: 'WAKAM' },
  ]

  for (const p of partners) {
    await prisma.partner.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    })
  }
  console.log(`✅ Partners: ${partners.length} creati`)

  console.log('\n🎉 Seed completato!')
  console.log('📧 Admin email: admin@gestionalebroker.it')
  console.log('🔑 Admin password: Admin2026!')
  console.log('⚠️  Cambia la password al primo accesso!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
