const form = document.getElementById("expenseForm");
const transactionList = document.getElementById("transactionList");
const balanceEl = document.getElementById("balance");
const monthlySummary = document.getElementById("monthlySummary");
const limitInput = document.getElementById("limitInput");
const sortSelect = document.getElementById("sortSelect");

let transactions =
JSON.parse(localStorage.getItem("transactions")) || [];

let chart;

function saveData() {
    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );
}

function formatCurrency(value){
    return new Intl.NumberFormat("id-ID",{
        style:"currency",
        currency:"IDR"
    }).format(value);
}

function renderTransactions(){

    let data = [...transactions];

    if(sortSelect.value === "amount"){
        data.sort((a,b)=>b.amount-a.amount);
    }

    if(sortSelect.value === "category"){
        data.sort((a,b)=>
            a.category.localeCompare(b.category)
        );
    }

    transactionList.innerHTML = "";

    const limit = Number(limitInput.value);

    data.forEach(item=>{

        const div = document.createElement("div");

        div.className="transaction-item";

        if(item.amount > limit){
            div.classList.add("limit-exceeded");
        }

        div.innerHTML=`
        <div>
            <strong>${item.name}</strong><br>
            ${formatCurrency(item.amount)}<br>
            <small>${item.category}</small>
        </div>

        <button
        class="delete-btn"
        onclick="deleteTransaction('${item.id}')">
        Delete
        </button>
        `;

        transactionList.appendChild(div);
    });

    updateBalance();
    updateChart();
    updateMonthlySummary();
}

function updateBalance(){

    const total =
    transactions.reduce(
        (sum,item)=>sum+item.amount,
        0
    );

    balanceEl.textContent =
    formatCurrency(total);
}

function updateMonthlySummary(){

    const total =
    transactions.reduce(
        (sum,item)=>sum+item.amount,
        0
    );

    monthlySummary.textContent =
    `Total Spending: ${formatCurrency(total)}`;
}

function deleteTransaction(id){

    transactions =
    transactions.filter(
        item=>item.id!==id
    );

    saveData();
    renderTransactions();
}

form.addEventListener("submit",(e)=>{

    e.preventDefault();

    const name =
    document.getElementById("itemName").value.trim();

    const amount =
    document.getElementById("amount").value;

    let category =
    document.getElementById("category").value;

    const custom =
    document.getElementById("customCategory").value.trim();

    if(custom){
        category = custom;
    }

    if(!name || !amount || !category){
        alert("Please fill all fields");
        return;
    }

    transactions.push({
        id:Date.now().toString(),
        name,
        amount:Number(amount),
        category,
        date:new Date()
    });

    saveData();
    renderTransactions();

    form.reset();
});

function updateChart(){

    const categories={};

    transactions.forEach(item=>{

        if(categories[item.category]){
            categories[item.category]+=item.amount;
        }else{
            categories[item.category]=item.amount;
        }

    });

    const labels =
    Object.keys(categories);

    const values =
    Object.values(categories);

    if(chart){
        chart.destroy();
    }

    chart =
    new Chart(
        document.getElementById("expenseChart"),
        {
            type:"pie",
            data:{
                labels,
                datasets:[
                    {
                        data:values
                    }
                ]
            },
            options:{
                responsive:true
            }
        }
    );
}

sortSelect.addEventListener(
    "change",
    renderTransactions
);

limitInput.addEventListener(
    "input",
    renderTransactions
);

document
.getElementById("themeToggle")
.addEventListener("click",()=>{

    document.body.classList.toggle("dark");

    localStorage.setItem(
        "theme",
        document.body.classList.contains("dark")
    );

});

if(localStorage.getItem("theme")==="true"){
    document.body.classList.add("dark");
}

renderTransactions();