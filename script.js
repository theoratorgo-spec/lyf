// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from "firebase/firestore";

// Your web app's Firebase configuration (Ensure this is correct)
const firebaseConfig = {
    apiKey: "AIzaSyDS0cy0pmEdPR0oZF_rERs_HKS4rCJgdUw",
    authDomain: "my-lyf-efa0d.firebaseapp.com",
    projectId: "my-lyf-efa0d",
    storageBucket: "my-lyf-efa0d.firebasestorage.app",
    messagingSenderId: "230178951574",
    appId: "1:230178951574:web:6f3ce8026c34ffa25a0db7"
};

// Initialize Firebase App and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Initial Setup and Loading Data ---

document.addEventListener('DOMContentLoaded', () => {
    // Set the current date for the Prayer Tracker display
    document.getElementById('current-date').textContent = new Date().toLocaleDateString();

    // Load data from Firestore when the page loads
    loadExpenses();
    loadPrayerLogHistory();
});

// --- Expense Tracker Functions ---

/**
 * Adds a new expense document to the 'expenses' collection in Firestore.
 */
async function addExpense() {
    const descInput = document.getElementById('expense-desc');
    const amountInput = document.getElementById('expense-amount');

    const description = descInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const date = new Date().toLocaleDateString();

    if (description === '' || isNaN(amount) || amount <= 0) {
        alert('Please enter a valid description and amount.');
        return;
    }

    try {
        // 1. Create the new expense object for Firestore
        const newExpenseData = {
            description,
            amount,
            date,
            timestamp: serverTimestamp() // Use Firestore's server timestamp
        };

        // 2. Add the document to the 'expenses' collection
        await addDoc(collection(db, "expenses"), newExpenseData);
        
        console.log("Expense added successfully.");

        // 3. Re-load data to update UI
        loadExpenses(); 

        // 4. Clear input fields
        descInput.value = '';
        amountInput.value = '';

    } catch (e) {
        console.error("Error adding expense: ", e);
        alert("Failed to save expense. Check console for details.");
    }
}

/**
 * Loads and displays all expenses from Firestore, ordered by time.
 */
async function loadExpenses() {
    const list = document.getElementById('expense-list');
    list.innerHTML = ''; // Clear existing list
    
    let allExpenses = [];
    const today = new Date().toLocaleDateString();

    try {
        // Create a query to get expenses, ordered by timestamp (descending)
        const q = query(collection(db, "expenses"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            const expense = doc.data();
            // Firestore timestamps need to be converted to a Date object, or use existing 'date' field
            allExpenses.push(expense);
            renderExpense(expense);
        });

        // Update the total based on today's expenses
        updateDailyTotal(allExpenses);

    } catch (e) {
        console.error("Error loading expenses: ", e);
    }
}

/**
 * Renders a single expense object to the history list. (UI function)
 */
function renderExpense(expense) {
    const list = document.getElementById('expense-list');
    const li = document.createElement('li');
    // Default to 'date' add this to my project so I can use database to store everything
    li.textContent = `${expense.date}: ${expense.description} - $${expense.amount.toFixed(2)}`;
    list.appendChild(li);
}
