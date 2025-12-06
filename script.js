
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, runTransaction, query, orderBy } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDS0cy0pmEdPR0oZF_rERs_HKS4rCJgdUw",
    authDomain: "my-lyf-efa0d.firebaseapp.com",
    projectId: "my-lyf-efa0d",
    storageBucket: "my-lyf-efa0d.firebasestorage.app",
    messagingSenderId: "230178951574",
    appId: "1:230178951574:web:6f3ce8026c34ffa25a0db7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    loadAccounts();
    loadExpenses();
});

// --- Account Functions ---

async function createAccount() {
    const accountNameInput = document.getElementById('account-name');
    const initialBalanceInput = document.getElementById('initial-balance');
    const accountName = accountNameInput.value.trim();
    const initialBalance = parseFloat(initialBalanceInput.value);

    if (accountName === '') {
        alert('Please enter an account name.');
        return;
    }

    if (isNaN(initialBalance)) {
        alert('Please enter a valid initial balance.');
        return;
    }

    try {
        await addDoc(collection(db, "accounts"), {
            name: accountName,
            balance: initialBalance
        });
        console.log("Account created successfully.");
        loadAccounts();
        accountNameInput.value = '';
        initialBalanceInput.value = '';
    } catch (e) {
        console.error("Error creating account: ", e);
    }
}

async function loadAccounts() {
    const accountsList = document.getElementById('accounts-list');
    const expenseAccountSelect = document.getElementById('expense-account');
    accountsList.innerHTML = '';
    expenseAccountSelect.innerHTML = '';

    try {
        const querySnapshot = await getDocs(collection(db, "accounts"));
        querySnapshot.forEach((doc) => {
            const account = doc.data();
            const accountId = doc.id;

            // Display account in the accounts list
            const accountElement = document.createElement('div');
            accountElement.className = 'account';
            accountElement.innerHTML = `<strong>${account.name}:</strong> $${account.balance.toFixed(2)}`;
            accountsList.appendChild(accountElement);

            // Add account to the expense dropdown
            const option = document.createElement('option');
            option.value = accountId;
            option.textContent = account.name;
            expenseAccountSelect.appendChild(option);
        });
    } catch (e) {
        console.error("Error loading accounts: ", e);
    }
}

// --- Expense Functions ---

async function addExpense() {
    const accountSelect = document.getElementById('expense-account');
    const descInput = document.getElementById('expense-desc');
    const amountInput = document.getElementById('expense-amount');

    const accountId = accountSelect.value;
    const description = descInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (accountId === '' || description === '' || isNaN(amount) || amount <= 0) {
        alert('Please fill out all fields correctly.');
        return;
    }

    try {
        await runTransaction(db, async (transaction) => {
            const accountRef = doc(db, "accounts", accountId);
            const accountDoc = await transaction.get(accountRef);

            if (!accountDoc.exists()) {
                throw "Account does not exist!";
            }

            const newBalance = accountDoc.data().balance - amount;
            transaction.update(accountRef, { balance: newBalance });

            transaction.set(doc(collection(db, "expenses")),
            {
                accountId: accountId,
                description: description,
                amount: amount,
                timestamp: new Date()
            });
        });

        console.log("Expense added and account updated successfully.");
        loadExpenses();
        loadAccounts();
        descInput.value = '';
        amountInput.value = '';

    } catch (e) {
        console.error("Error adding expense: ", e);
    }
}

async function loadExpenses() {
    const list = document.getElementById('expense-list');
    list.innerHTML = '';
    let dailyTotal = 0;

    try {
        const q = query(collection(db, "expenses"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            const expense = doc.data();
            renderExpense(expense);

            // Sum expenses for today
            const expenseDate = expense.timestamp.toDate();
            const today = new Date();
            if (expenseDate.toDateString() === today.toDateString()) {
                dailyTotal += expense.amount;
            }
        });

        document.getElementById('daily-total').textContent = dailyTotal.toFixed(2);

    } catch (e) {
        console.error("Error loading expenses: ", e);
    }
}

function renderExpense(expense) {
    const list = document.getElementById('expense-list');
    const li = document.createElement('li');
    const date = expense.timestamp.toDate().toLocaleDateString();
    li.textContent = `${date}: ${expense.description} - $${expense.amount.toFixed(2)}`;
    list.appendChild(li);
}
