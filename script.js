'use strict';

// BANKIST APP

// Data
const accounts = [
    {
        owner: 'Ahmed Sayed',
        movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
        interestRate: 1.2,
        pin: 1111,
    },
    {
        owner: 'Jessica Davis',
        movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
        interestRate: 1.5,
        pin: 2222,
    },
    {
        owner: 'Steven Thomas Williams',
        movements: [200, -200, 340, -300, -20, 50, 400, -460],
        interestRate: 0.7,
        pin: 3333,
    },
    {
        owner: 'Sarah Smith',
        movements: [430, 1000, 700, 50, 90],
        interestRate: 1,
        pin: 4444,
    },
];

// Elements
const elements = {
    labelWelcome: document.querySelector('.welcome'),
    labelDate: document.querySelector('.date'),
    labelBalance: document.querySelector('.balance__value'),
    labelSumIn: document.querySelector('.summary__value--in'),
    labelSumOut: document.querySelector('.summary__value--out'),
    labelSumInterest: document.querySelector('.summary__value--interest'),
    labelTimer: document.querySelector('.timer'),
    containerApp: document.querySelector('.app'),
    containerMovements: document.querySelector('.movements'),
    btnLogin: document.querySelector('.login__btn'),
    btnTransfer: document.querySelector('.form__btn--transfer'),
    btnLoan: document.querySelector('.form__btn--loan'),
    btnClose: document.querySelector('.form__btn--close'),
    btnSort: document.querySelector('.btn--sort'),
    inputLoginUsername: document.querySelector('.login__input--user'),
    inputLoginPin: document.querySelector('.login__input--pin'),
    inputTransferTo: document.querySelector('.form__input--to'),
    inputTransferAmount: document.querySelector('.form__input--amount'),
    inputLoanAmount: document.querySelector('.form__input--loan-amount'),
    inputCloseUsername: document.querySelector('.form__input--user'),
    inputClosePin: document.querySelector('.form__input--pin'),

};

const displayMovements = (movements, sort = false) => {
    elements.containerMovements.innerHTML = '';
    const movs = sort ? [...movements].sort((a, b) => a - b) : movements;

    movs.forEach((movement, index) => {
        const type = movement > 0 ? 'deposit' : 'withdrawal';
        const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${index + 1} ${type}</div>
        <div class="movements__value">${movement}€</div>
      </div>
    `;
        elements.containerMovements.insertAdjacentHTML('afterbegin', html);
    });
};

const calcDisplayBalance = (acc) => {
    acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
    elements.labelBalance.textContent = `${acc.balance}€`;
};

const calcDisplaySummary = (acc) => {
    const incomes = acc.movements
        .filter(mov => mov > 0)
        .reduce((acc, mov) => acc + mov, 0);
    elements.labelSumIn.textContent = `${incomes}€`;

    const out = acc.movements
        .filter(mov => mov < 0)
        .reduce((acc, mov) => acc + mov, 0);
    elements.labelSumOut.textContent = `${Math.abs(out)}€`;

    const interest = acc.movements
        .filter(mov => mov > 0)
        .map(deposit => (deposit * acc.interestRate) / 100)
        .filter(int => int >= 1)
        .reduce((acc, int) => acc + int, 0);
    elements.labelSumInterest.textContent = `${interest}€`;
};

const createUsernames = (accs) => {
    accs.forEach(acc => {
        acc.username = acc.owner
            .toLowerCase()
            .split(' ')
            .map(name => name[0])
            .join('');
    });
};

createUsernames(accounts);

const updateUI = (acc) => {
    displayMovements(acc.movements);
    calcDisplayBalance(acc);
    calcDisplaySummary(acc);
};

// Event Handlers
let currentAccount;

elements.btnLogin.addEventListener('click', (e) => {
    e.preventDefault();
    currentAccount = accounts.find(acc => acc.username === elements.inputLoginUsername.value);

    if (currentAccount?.pin === Number(elements.inputLoginPin.value)) {
        elements.labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;
        elements.containerApp.style.opacity = 100;

        elements.inputLoginUsername.value = elements.inputLoginPin.value = '';
        elements.inputLoginPin.blur();

        updateUI(currentAccount);
    }
});

elements.btnTransfer.addEventListener('click', (e) => {
    e.preventDefault();
    const amount = Number(elements.inputTransferAmount.value);
    const receiverAcc = accounts.find(acc => acc.username === elements.inputTransferTo.value);

    elements.inputTransferAmount.value = elements.inputTransferTo.value = '';

    if (
        amount > 0 &&
        receiverAcc &&
        currentAccount.balance >= amount &&
        receiverAcc?.username !== currentAccount.username
    ) {
        currentAccount.movements.push(-amount);
        receiverAcc.movements.push(amount);
        updateUI(currentAccount);
    }
});

elements.btnLoan.addEventListener('click', (e) => {
    e.preventDefault();
    const amount = Number(elements.inputLoanAmount.value);

    if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
        currentAccount.movements.push(amount);
        updateUI(currentAccount);
    }

    elements.inputLoanAmount.value = '';
});

elements.btnClose.addEventListener('click', (e) => {
    e.preventDefault();

    if (
        elements.inputCloseUsername.value === currentAccount.username &&
        Number(elements.inputClosePin.value) === currentAccount.pin
    ) {
        const index = accounts.findIndex(acc => acc.username === currentAccount.username);
        accounts.splice(index, 1);
        elements.containerApp.style.opacity = 0;
    }

    elements.inputCloseUsername.value = elements.inputClosePin.value = '';
});
// Updated Close Account Functionality
elements.btnClose.addEventListener('click', (e) => {
    e.preventDefault();

    const inputUsername = elements.inputCloseUsername.value.trim();
    const inputPin = Number(elements.inputClosePin.value);

    // Check if a user is currently logged in
    if (!currentAccount) {
        elements.labelWelcome.textContent = 'Please log in first.';
        setTimeout(() => {
            elements.labelWelcome.textContent = 'Log in to get started';
        }, 3000);
        return;
    }

    // Check if the credentials match the current account
    if (
        inputUsername === currentAccount.username &&
        inputPin === currentAccount.pin
    ) {
        const index = accounts.findIndex(acc => acc.username === currentAccount.username);

        if (index !== -1) {
            // Get the first name of the account owner
            const firstName = currentAccount.owner.split(' ')[0];

            // Remove account
            accounts.splice(index, 1);

            // Hide UI
            elements.containerApp.style.opacity = 0;

            // Display closing message
            elements.labelWelcome.textContent = `Account closed. Goodbye, ${firstName}!`;

            // Reset current account
            currentAccount = null;

            console.log('Account closed successfully');

            // Set a timer to revert the welcome message after 3 seconds
            setTimeout(() => {
                elements.labelWelcome.textContent = 'Log in to get started';
            }, 3000);
        } else {
            console.error('Failed to close account');
        }
    } else {
        elements.labelWelcome.textContent = 'Invalid credentials. Please try again.';
        console.log('Invalid credentials');

        // Set a timer to revert the welcome message after 3 seconds
        setTimeout(() => {
            elements.labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;
        }, 3000);
    }

    // Clear input fields
    elements.inputCloseUsername.value = elements.inputClosePin.value = '';
});

let sorted = false;
elements.btnSort.addEventListener('click', (e) => {
    e.preventDefault();
    displayMovements(currentAccount.movements, !sorted);
    sorted = !sorted;
});