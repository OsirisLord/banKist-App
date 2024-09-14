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

// Helper Functions
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

const calcDisplayBalance = (account) => {
    const balance = account.movements.reduce((acc, mov) => acc + mov, 0);
    account.balance = balance;
    elements.labelBalance.textContent = `${balance}€`;
};

const calcDisplaySummary = ({ movements, interestRate }) => {
    const incomes = movements.filter(mov => mov > 0).reduce((acc, mov) => acc + mov, 0);
    elements.labelSumIn.textContent = `${incomes}€`;

    const out = movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0);
    elements.labelSumOut.textContent = `${Math.abs(out)}€`;

    const interest = movements
        .filter(mov => mov > 0)
        .map(deposit => (deposit * interestRate) / 100)
        .filter(int => int >= 1)
        .reduce((acc, int) => acc + int, 0);
    elements.labelSumInterest.textContent = `${interest}€`;
};

const createUsernames = (accounts) => {
    accounts.forEach(acc => {
        acc.username = acc.owner
            .toLowerCase()
            .split(' ')
            .map(name => name[0])
            .join('');
    });
};

const updateUI = (account) => {
    displayMovements(account.movements);
    calcDisplayBalance(account);
    calcDisplaySummary(account);
};

// Initialize usernames
createUsernames(accounts);

let currentAccount;

let logoutTimer;

// Logout Timer Function
const startLogoutTimer = () => {
    let time = 300; // 5 minutes in seconds

    const tick = () => {
        const min = Math.floor(time / 60);
        const sec = String(time % 60).padStart(2, '0');

        // In each call, print the remaining time to the UI
        elements.labelTimer.textContent = `${min}:${sec}`;

        // When time reaches 0, stop the timer and log out the user
        if (time === 0) {
            clearInterval(logoutTimer);
            elements.labelWelcome.textContent = 'Log in to get started';
            elements.containerApp.style.opacity = 0;
            currentAccount = null;
        }

        // Decrease time by 1 second
        time--;
    };

    // Call the tick function immediately to avoid delay
    tick();
    // Then, call it every second
    logoutTimer = setInterval(tick, 1000);

    return logoutTimer;
};

// Event Handlers
elements.btnLogin.addEventListener('click', (e) => {
    e.preventDefault();

    const username = elements.inputLoginUsername.value.trim();
    const pin = Number(elements.inputLoginPin.value);

    currentAccount = accounts.find(acc => acc.username === username);

    if (currentAccount?.pin === pin) {
        elements.labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;
        elements.containerApp.style.opacity = 100;

        elements.inputLoginUsername.value = elements.inputLoginPin.value = '';
        elements.inputLoginPin.blur();

        // Update UI
        updateUI(currentAccount);

        // Start or reset the logout timer
        if (logoutTimer) clearInterval(logoutTimer);
        logoutTimer = startLogoutTimer();
    } else {
        elements.labelWelcome.textContent = 'Invalid login credentials';
        setTimeout(() => {
            elements.labelWelcome.textContent = 'Log in to get started';
        }, 3000);
    }
});

elements.btnTransfer.addEventListener('click', (e) => {
    e.preventDefault();

    const amount = Number(elements.inputTransferAmount.value);
    const receiverUsername = elements.inputTransferTo.value.trim();
    const receiverAcc = accounts.find(acc => acc.username === receiverUsername);

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

        // Reset the logout timer
        clearInterval(logoutTimer);
        logoutTimer = startLogoutTimer();
    } else {
        alert('Transfer failed. Please check the details and try again.');
    }
});

elements.btnLoan.addEventListener('click', (e) => {
    e.preventDefault();

    const amount = Math.floor(Number(elements.inputLoanAmount.value));

    if (
        amount > 0 &&
        currentAccount.movements.some(mov => mov >= amount * 0.1)
    ) {
        currentAccount.movements.push(amount);
        updateUI(currentAccount);

        // Reset the logout timer
        clearInterval(logoutTimer);
        logoutTimer = startLogoutTimer();
    } else {
        alert('Loan request denied. Minimum deposit required.');
    }

    elements.inputLoanAmount.value = '';
});

elements.btnClose.addEventListener('click', (e) => {
    e.preventDefault();

    const inputUsername = elements.inputCloseUsername.value.trim();
    const inputPin = Number(elements.inputClosePin.value);

    if (!currentAccount) {
        elements.labelWelcome.textContent = 'Please log in first.';
        setTimeout(() => {
            elements.labelWelcome.textContent = 'Log in to get started';
        }, 3000);
        return;
    }

    if (inputUsername === currentAccount.username && inputPin === currentAccount.pin) {
        const index = accounts.findIndex(acc => acc.username === currentAccount.username);

        if (index !== -1) {
            const firstName = currentAccount.owner.split(' ')[0];

            accounts.splice(index, 1);
            elements.containerApp.style.opacity = 0;

            elements.labelWelcome.textContent = `Account closed. Goodbye, ${firstName}!`;

            // Clear the current account and logout timer
            currentAccount = null;
            clearInterval(logoutTimer);

            setTimeout(() => {
                elements.labelWelcome.textContent = 'Log in to get started';
            }, 3000);
        } else {
            console.error('Failed to close account');
        }
    } else {
        elements.labelWelcome.textContent = 'Invalid credentials. Please try again.';
        setTimeout(() => {
            elements.labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;
        }, 3000);
    }

    elements.inputCloseUsername.value = elements.inputClosePin.value = '';
});

let sorted = false;
elements.btnSort.addEventListener('click', (e) => {
    e.preventDefault();
    displayMovements(currentAccount.movements, !sorted);
    sorted = !sorted;

    // Reset the logout timer
    clearInterval(logoutTimer);
    logoutTimer = startLogoutTimer();
});
