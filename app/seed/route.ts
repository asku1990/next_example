import { prisma } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { Customer, Invoice } from '@/app/lib/definitions';

export async function GET() {
  try {
    // Clean the database
    await prisma.invoice.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.revenue.deleteMany();

    // Create customers
    const customers = await Promise.all([
      prisma.customer.create({
        data: {
          name: 'Acme Corp',
          email: 'acme@example.com',
          image_url: '/customers/acme.png',
        },
      }) as Promise<Customer>,
      prisma.customer.create({
        data: {
          name: 'Monsters Inc',
          email: 'monsters@example.com',
          image_url: '/customers/monsters.png',
        },
      }) as Promise<Customer>,
    ]);

    // Create invoices
    await Promise.all(
      customers.map(async (customer: Customer) => {
        return prisma.invoice.create({
          data: {
            customerId: customer.id,
            amount: Math.floor(Math.random() * 10000),
            status: Math.random() > 0.5 ? 'PAID' : 'PENDING',
            date: new Date(),
          },
        }) as Promise<Invoice>;
      })
    );

    // Create revenue data
    await Promise.all([
      prisma.revenue.create({
        data: {
          month: 'Jan',
          revenue: 2000,
        },
      }),
      prisma.revenue.create({
        data: {
          month: 'Feb',
          revenue: 1800,
        },
      }),
    ]);

    return NextResponse.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Error seeding database' },
      { status: 500 }
    );
  }
}
