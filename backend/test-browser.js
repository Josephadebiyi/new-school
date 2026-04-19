import puppeteer from 'puppeteer';

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
        const page = await browser.newPage();
        
        await page.goto('http://localhost:5174/school/login');
        
        // Wait for login form
        await page.waitForSelector('input[type="email"]');
        
        // Type credentials
        await page.type('input[type="email"]', 'taiwojos2@yahoo.com');
        await page.type('input[type="password"]', 'Passw0rd@1');
        
        // Click login
        await page.click('button[type="submit"]');
        
        // Wait for navigation
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        
        console.log("Current URL after login:", page.url());
        
        // Click Patients OR Students tab based on UI
        // We know it is sidebar:
        const studentsTab = await page.$x("//button[contains(., 'Students')]");
        if (studentsTab.length > 0) {
            await studentsTab[0].click();
        } else {
            console.log("Students tab not found");
        }
        
        await page.waitForTimeout(1000);
        
        // Click Add Student
        const addStudentBtn = await page.$x("//button[contains(., 'Add Student')]");
        if (addStudentBtn.length > 0) {
            await addStudentBtn[0].click();
        } else {
            console.log("Add Student button not found");
        }
        
        await page.waitForTimeout(1000);
        
        // Fill form
        await page.type('input[type="email"]', 'pup@test.com');
        await page.type('input[type="password"]', 'password123');
        await page.type('input[type="text"]', 'Pup');
        
        // Click 'Create Student' or whatever the save button says
        // Actually we can just trigger form submission:
        await page.evaluate(() => {
            const saveBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Save') || el.textContent.includes('Create'));
            if(saveBtn) saveBtn.click();
        });
        
        // Wait for alert or network response
        page.on('dialog', async dialog => {
            console.log("ALERT:", dialog.message());
            await dialog.dismiss();
        });
        
        page.on('response', async response => {
            if (response.url().includes('/api/users')) {
                console.log("Response from /api/users:", response.status(), await response.text());
            }
        });
        
        await page.waitForTimeout(3000);
        await browser.close();
        
    } catch (err) {
        console.error(err);
    }
})();
