const Modal = {
    toggle() {
        // Abrir e fecha modal
        document
            .querySelector('.modal-overlay')
            .classList
            .toggle('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all = [...Transaction.all, transaction]

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        const incomes = Transaction.all
            .map(transaction => transaction.amount)
            .filter(amount => amount > 0)
            .reduce((a,b) => a + b, 0)

        return Utils.formatCurrency(incomes)
    },

    expenses() {
        const expenses = Transaction.all
            .map(transaction => transaction.amount)
            .filter(amount => amount < 0)
            .reduce((a,b) => a + b, 0)

        return Utils.formatCurrency(expenses)
    },

    total() {
        const total = Transaction.all
            .map(transaction => transaction.amount)
            .reduce((a,b) => a + b, 0)

        return Utils.formatCurrency(total)
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    
    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },
    
    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount);

        return `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transa????o">
            </td>
        `
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Transaction.incomes()

        document
            .getElementById('expenseDisplay')
            .innerHTML = Transaction.expenses()

        document
            .getElementById('totalDisplay')
            .innerHTML = Transaction.total()
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatDate(date) {
        const splittedDate = date.split("-")

        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatAmount(value) {
        value = Number(value) * 100

        return Math.round(value)
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    
    validateFields() {
        const { description, amount, date } = Form.getValues()

        if (
            description.trim() === "" || 
            amount.trim() === "" || 
            date.trim() === ""
        ) {
            throw new Error("Por favor, preencha todos os campos!")
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date,
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields()
            
            const transaction = Form.formatValues()

            Transaction.add(transaction)

            Form.clearFields()

            Modal.toggle()
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)

        DOM.updateBalance()

        Storage.set(Transaction.all)
    },

    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()
