// --- Initial Setup and Loading Data ---

document.addEventListener('DOMContentLoaded', () => {
    // Set the current date for the Prayer Tracker
    document.getElementById('current-date').textContent = new Date().toLocaleDateString();

    // Load data when the page loads
    loadExpenses();
    loadPrayerLogHistory();
});

// --- Expense Tracker Functions ---

/**
 * Adds a new expense item from the input fields.
 */
function addExpense() {
    const descInput = document.getElementById('expense-desc');
    const amountInput = document.getElementById('expense-amount');

    const description = descInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const date = new Date().toLocaleDateString();

    if (description === '' || isNaN(amount) || amount <= 0) {
        alert('Please enter a valid description and amount.');
        return;
    }

    // 1. Create the new expense object
    const newExpense = { description, amount, date, timestamp: Date.now() };

    // 2. Get existing expenses from LocalStorage
    let expenses = JSON.parse(localStorage.getItem('dailyExpenses')) || [];

    // 3. Add the new expense
    expenses.push(newExpense);

    // 4. Save the updated list back to LocalStorage
    localStorage.setItem('dailyExpenses', JSON.stringify(expenses));

    // 5. Update the UI
    renderExpense(newExpense);
    updateDailyTotal(expenses);

    // 6. Clear input fields
    descInput.value = '';
    amountInput.value = '';
}

/**
 * Loads and displays all saved expenses from LocalStorage.
 */
function loadExpenses() {
    const expenses = JSON.parse(localStorage.getItem('dailyExpenses')) || [];
    const list = document.getElementById('expense-list');
    list.innerHTML = ''; // Clear existing list

    expenses.forEach(renderExpense);
    updateDailyTotal(expenses);
}

/**
 * Renders a single expense object to the history list.
 */
function renderExpense(expense) {
    const list = document.getElementById('expense-list');
    const li = document.createElement('li');
    // Format the currency display (adjust 'USD' as needed)
    const formattedAmount = expense.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    
    li.innerHTML = `
        <strong>${expense.date}</strong>: ${expense.description} 
        <span class="amount">${formattedAmount}</span>
    `;
    list.prepend(li); // Add to the top of the list
}

/**
 * Calculates and updates the total expenses for the current day.
 */
function updateDailyTotal(allExpenses) {
    const today = new Date().toLocaleDateString();
    
    // Filter expenses to only include those from today
    const todaysExpenses = allExpenses.filter(exp => exp.date === today);
    
    const total = todaysExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Update the display element
    document.getElementById('daily-total').textContent = 
        total.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}


// --- Prayer Tracker Functions ---

/**
 * Saves the current state of the prayer checklist as a historical log.
 */
function savePrayerLog() {
    const currentDate = document.getElementById('current-date').textContent;
    const dateKey = currentDate.replace(/\//g, '-'); // e.g., "12/06/2025" -> "12-06-2025"

    // Get the status of each checkbox
    const log = {
        date: currentDate,
        fajr: document.getElementById('prayer-fajr').checked,
        dhuhr: document.getElementById('prayer-dhuhr').checked,
        asr: document.getElementById('prayer-asr').checked,
        maghrib: document.getElementById('prayer-maghrib').checked,
        isha: document.getElementById('prayer-isha').checked,
        reading: document.getElementById('habit-reading').checked
    };

    // 1. Get existing logs from LocalStorage (or initialize if none)
    let history = JSON.parse(localStorage.getItem('prayerHistory')) || {};
    
    // 2. Add or overwrite the log for the current date
    history[dateKey] = log; 
    
    // 3. Save the updated history back to LocalStorage
    localStorage.setItem('prayerHistory', JSON.stringify(history));

    // 4. Update the UI
    renderPrayerLog(log);
    alert(`Prayer/Habit log saved for ${currentDate}!`);
}

/**
 * Loads and displays the historical prayer logs.
 */
function loadPrayerLogHistory() {
    const history = JSON.parse(localStorage.getItem('prayerHistory')) || {};
    const list = document.getElementById('prayer-history-list');
    list.innerHTML = ''; // Clear existing list

    // Iterate through the stored logs (keys are dates)
    Object.keys(history).sort().reverse().forEach(dateKey => {
        renderPrayerLog(history[dateKey]);
    });
}

/**
 * Renders a single prayer log entry to the history list.
 */
function renderPrayerLog(log) {
    const list = document.getElementById('prayer-history-list');
    const li = document.createElement('li');
    
    // Function to convert boolean to an emoji checkmark or X
    const status
