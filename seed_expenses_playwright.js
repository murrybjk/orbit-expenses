import { chromium } from 'playwright';
import { EXPENSES } from './seed_expenses.js';

async function seedExpensesViaPlaywright() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('Navigating to Supabase Studio base URL...');
    await page.goto('http://bjk.ai:8000');
    
    console.log('Navigating to expenses table editor...');
    await page.goto('http://bjk.ai:8000/project/default/editor/18620?schema=public'); // Directly to expenses table

    // Wait for the page to load and the 'Insert' button to be visible
    await page.waitForSelector('button:has-text("Insert")');

    for (const expense of EXPENSES) {
      console.log(`Inserting expense: ${expense.title}`);
      await page.click('button:has-text("Insert")'); // Click Insert button
      await page.click('text="Insert row"'); // Click Insert row from the dropdown

      // Fill the form fields
      await page.fill('[data-testid="title-input"]', expense.title);
      await page.fill('[data-testid="amount-input"]', expense.amount.toString());
      await page.fill('input[type="date"]', expense.date);
      await page.fill('[data-testid="categoryId-input"]', expense.categoryId);
      if (expense.note) {
        await page.fill('[data-testid="note-input"]', expense.note);
      }

      await page.click('[data-testid="action-bar-save-row"]'); // Click Save button
      await page.waitForSelector('text=Successfully created row', { state: 'visible' }); // Wait for success message
      console.log(`Successfully inserted: ${expense.title}`);
    }

    console.log('All expenses seeded via Playwright.');

  } catch (error) {
    console.error('Error during Playwright seeding:', error);
  } finally {
    await browser.close();
  }
}

seedExpensesViaPlaywright();