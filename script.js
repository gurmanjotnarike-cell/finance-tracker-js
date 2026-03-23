const expenseRadio = document.getElementById("expense-type")
const incomeRadio = document.getElementById("income-type")
const categorySelect = document.getElementById("category-select")
const expenseCategories = [
"Housing",
"Food",
"Transportation",
"Personal Shopping",
"Bills & Subscriptions"
]
const incomeCategories = [
"Salary",
"Business",
"Investment"
]
const categoryColors = {
  "Housing": "#7c3aed",
  "Food": "#dc2626",
  "Transportation": "#2563eb",
  "Personal Shopping": "#db2777",
  "Bills & Subscriptions": "#ca8a04",
  "Salary": "#16a34a",
  "Business": "#0891b2",
  "Investment": "#4f46e5"
};
function updateCategory(type){
categorySelect.innerHTML = '<option value="" disabled selected>-- Select Category --</option>'

let categories
if(type === "expense"){
categories = expenseCategories
}else{
categories = incomeCategories
}
categories.forEach(function(category){
const option = document.createElement("option")
option.value = category
option.textContent = category
categorySelect.appendChild(option)
})

}

expenseRadio.addEventListener("change", function(){
updateCategory("expense")
})

incomeRadio.addEventListener("change", function(){
updateCategory("income")
})

updateCategory("expense")

document.getElementById("date-input").valueAsDate = new Date()

// subnitting the form 
let transactions = JSON.parse(localStorage.getItem("transactions")) || []

if (transactions.length === 0) {
  transactions.push(
    { title: "Salary", amount: 2000, category: "Salary", date: "2026-03-01", type: "income" },
    { title: "Food", amount: 200, category: "Food", date: "2026-03-02", type: "expense" }
  );
  localStorage.setItem("transactions", JSON.stringify(transactions));
}
const form = document.getElementById("transaction-form")

form.addEventListener("submit", function(event){
event.preventDefault()
const title = document.getElementById("title-input").value
const amount = document.getElementById("amount-input").value
const category = document.getElementById("category-select").value
const date = document.getElementById("date-input").value
const type = expenseRadio.checked ? "expense" : "income"
const transaction = {
title,
amount,
category,
date,
type
}
    transactions.push(transaction)
    // storing data in local storage
    localStorage.setItem("transactions", JSON.stringify(transactions))
displayTransactions()
updateMonthlySummary()
form.reset()
lucide.createIcons();

})

// displaying transactions into trasection-list 

function displayTransactions(){

const list = document.getElementById("transaction-list")
list.innerHTML = ""

if (transactions.length === 0) {
  list.innerHTML = `
    <p style="text-align:center; color:#64748b; padding:20px;">
      No transactions yet 😢 <br>
      Start by adding one using the + button
    </p>
  `;
  return;
}

transactions.forEach(function(item, index){

// MAIN CONTAINER
const div = document.createElement("div")
div.className = "transaction-item"


// LEFT SIDE
const left = document.createElement("div")
left.className = "left"

// ICON
const icon = document.createElement("div")
icon.className = "icon"
icon.textContent = item.title.charAt(0).toUpperCase()
icon.style.background = item.type === "expense" ? "#fdeaea" : "#e6f7ee"

// TEXT BLOCK
const textBlock = document.createElement("div")

const title = document.createElement("p")
title.className = "title"
title.textContent = item.title

const sub = document.createElement("span")
sub.className = "sub"
sub.textContent = item.category + " • " + item.date

textBlock.appendChild(title)
textBlock.appendChild(sub)

left.appendChild(icon)
left.appendChild(textBlock)


// RIGHT SIDE
const right = document.createElement("div")
right.className = "right"

// AMOUNT
const amount = document.createElement("p")
amount.className = item.type === "expense" ? "amount expense" : "amount income"
amount.textContent = (item.type === "expense" ? "-" : "+") + "$" + item.amount


// BUTTONS
const editBtn = document.createElement("button")
editBtn.textContent = "✏️"

const deleteBtn = document.createElement("button")
deleteBtn.textContent = "🗑️"


// DELETE
deleteBtn.addEventListener("click", function(){
transactions.splice(index,1)
localStorage.setItem("transactions", JSON.stringify(transactions))
displayTransactions()
updateMonthlySummary()
})

// EDIT
editBtn.addEventListener("click", function(){
document.getElementById("title-input").value = item.title
document.getElementById("amount-input").value = item.amount
document.getElementById("category-select").value = item.category
document.getElementById("date-input").value = item.date

transactions.splice(index,1)
localStorage.setItem("transactions", JSON.stringify(transactions))
displayTransactions()
updateMonthlySummary()
})


// APPEND RIGHT SIDE
right.appendChild(amount)
right.appendChild(editBtn)
right.appendChild(deleteBtn)


// FINAL STRUCTURE
div.appendChild(left)
div.appendChild(right)

list.prepend(div)



})

}

// initial display of transactions when page loads
displayTransactions()

// current montha nd year display
const today = new Date()
let selectedMonth = today.getMonth()
let selectedYear = today.getFullYear()

const monthNames = [
"January","February","March","April","May","June",
"July","August","September","October","November","December"
]

// ===== UPDATE MONTH LABEL =====

function updateMonthDisplay(){

document.getElementById("month-display").textContent =
monthNames[selectedMonth] + " " + selectedYear

}

// ===== PREVIOUS MONTH BUTTON =====

document.getElementById("prev-month").addEventListener("click", function(){

selectedMonth--

if(selectedMonth < 0){
selectedMonth = 11
selectedYear--
}

updateMonthDisplay()
updateMonthlySummary()

})

// ===== NEXT MONTH BUTTON =====

document.getElementById("next-month").addEventListener("click", function(){

selectedMonth++

if(selectedMonth > 11){
selectedMonth = 0
selectedYear++
}

updateMonthDisplay()
updateMonthlySummary()

})

// ===== FILTER TRANSACTIONS FOR SELECTED MONTH =====

function getMonthlyTransactions(){

const monthlyTransactions = []

transactions.forEach(function(item){

const transactionDate = new Date(item.date)

const transactionMonth = transactionDate.getMonth()
const transactionYear = transactionDate.getFullYear()

if(transactionMonth === selectedMonth && transactionYear === selectedYear){
monthlyTransactions.push(item)
}

})

return monthlyTransactions

}

// ===== UPDATE MONTHLY SUMMARY PIPELINE =====

function updateMonthlySummary(){

const monthlyTransactions = getMonthlyTransactions()

const totals = calculateTotals(monthlyTransactions)

const averages = calculateDailyAverages(
totals.totalIncome,
totals.totalExpense
)

const netDaily = calculateNetDaily(
averages.dailyAverageIncome,
averages.dailyAverageExpense
)

const netIncome = calculateNetIncome(
totals.totalIncome,
totals.totalExpense
)

const balancePercent = calculateBalancePercent(
totals.totalIncome,
totals.totalExpense
)

displayMonthlySummary(
averages.dailyAverageIncome,
averages.dailyAverageExpense,
netDaily,
totals.totalIncome,
totals.totalExpense,
netIncome,
balancePercent
)

}

// ===== INITIAL PAGE LOAD =====

updateMonthDisplay()
updateMonthlySummary()








function getMonthlyTransactions(){  
const monthlyTransactions = []

transactions.forEach(function(item){

const parts = item.date.split("-")

const transactionYear = Number(parts[0])
const transactionMonth = Number(parts[1]) - 1

if(transactionMonth === selectedMonth && transactionYear === selectedYear){
monthlyTransactions.push(item)
}

})
return monthlyTransactions      
} 
// calculating total income and expense for the current month  
function calculateTotals(monthlyTransactions){
let totalIncome = 0
let totalExpense = 0
monthlyTransactions.forEach(function(item){
if(item.type === "income"){
totalIncome += Number(item.amount)
}
if(item.type === "expense"){
totalExpense += Number(item.amount)
}
})
return {
totalIncome,
totalExpense
}
}
// getting the number of days in the current month
function getDaysInMonth(month, year){
return new Date(year, month + 1, 0).getDate()
}
// calculating daily averages for the current month
function calculateDailyAverages(totalIncome, totalExpense){
const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)
const dailyAverageIncome = totalIncome / daysInMonth
const dailyAverageExpense = totalExpense / daysInMonth
return {
dailyAverageIncome,
dailyAverageExpense
}
}
// calculating net daily amount
function calculateNetDaily(dailyAverageIncome, dailyAverageExpense){
const netDaily = dailyAverageIncome - dailyAverageExpense
return netDaily
}
// main function to display monthly summary
function displayMonthlySummary(dailyIncome, dailyExpense, netDaily, totalIncome, totalExpense, netIncome, balancePercent){
document.getElementById("avg-income").textContent =
"$" + dailyIncome.toFixed(2)
document.getElementById("avg-expense").textContent =
"$" + dailyExpense.toFixed(2)
document.getElementById("net-daily").innerHTML =
`$${netDaily.toFixed(2)}`;

document.getElementById("total-income").textContent =
"$" +(totalIncome || 0).toFixed(2)
document.getElementById("total-expense").textContent =
"$" + (totalExpense || 0).toFixed(2)
document.getElementById("net-income").textContent =
"$" + (netIncome || 0).toFixed(2)
let message = ""

if (balancePercent > 0) {
  message = `You saved ${balancePercent.toFixed(2)}% this month 🎉`;
} 
else if (balancePercent === 0) {
  message = "You broke even this month.";
} 
else {
  message = `You overspent ${Math.abs(balancePercent).toFixed(2)}% this month 😟`;
}

document.getElementById("balance-percent").textContent = message
showBreakdown("expense")
}

function updateMonthlySummary(){
const monthlyTransactions = getMonthlyTransactions()
const totals = calculateTotals(monthlyTransactions)
const averages = calculateDailyAverages(
totals.totalIncome,
totals.totalExpense
)
const netDaily = calculateNetDaily(
averages.dailyAverageIncome,
averages.dailyAverageExpense
)
const netIncome = calculateNetIncome(
totals.totalIncome,
totals.totalExpense
)
const balancePercent = calculateBalancePercent(
totals.totalIncome,
totals.totalExpense
)
displayMonthlySummary(
averages.dailyAverageIncome,
averages.dailyAverageExpense,
netDaily,
totals.totalIncome,
totals.totalExpense,
netIncome,
balancePercent
)
}
// calculating net income for the current month
function calculateNetIncome(totalIncome, totalExpense){
const netIncome = totalIncome - totalExpense
return netIncome
}
function calculateBalancePercent(totalIncome, totalExpense){
if(totalIncome === 0){
return 0
}
const netIncome = totalIncome - totalExpense
const balancePercent = (netIncome / totalIncome) * 100
return balancePercent
}
displayTransactions()
updateMonthlySummary()
//

function getRandomColor() {
  const colors = [
    "#7c3aed", // deep violet
  "#db2777", // strong pink
  "#dc2626", // red
  "#ea580c", // orange
  "#ca8a04", // mustard yellow
  "#16a34a", // green
  "#0891b2", // cyan
  "#2563eb", // blue
  "#4f46e5", // indigo
  "#be123c"  // dark rose
  ];

  return colors[Math.floor(Math.random() * colors.length)];
}
function showBreakdown(type){

const list = document.getElementById("breakdown-list")
list.innerHTML = ""

const monthlyTransactions = getMonthlyTransactions()
 
// filter by type
const filtered = monthlyTransactions.filter(function(item){
return item.type === type
})

// calculate total
let total = 0
filtered.forEach(function(item){
total += Number(item.amount)
})

// sort highest → lowest
filtered.sort(function(a,b){
return Number(b.amount) - Number(a.amount)
})

// display results
filtered.forEach(function(item){
const percent = total === 0 ? 0 : ((item.amount / total) * 100).toFixed(0)

// MAIN ROW
const row = document.createElement("div")
row.className = "breakdown-item"

// LEFT
const left = document.createElement("div")
left.className = "breakdown-left"

const dot = document.createElement("span")
dot.className = "dot"

const name = document.createElement("p")
name.textContent = item.title

const key = item.category.trim();
const color = categoryColors[key] || "#64748b";

dot.style.background = color;



left.appendChild(dot)
left.appendChild(name)


// RIGHT
const right = document.createElement("div")
right.className = "breakdown-right"

const percentEl = document.createElement("span")
percentEl.className = "percent"
percentEl.textContent = percent + "%"

const amountEl = document.createElement("p")
amountEl.className = "amount"
amountEl.textContent = "$" + Number(item.amount).toFixed(2)

percentEl.style.color = color;

right.appendChild(percentEl)
right.appendChild(amountEl)

// FINAL APPEND
row.appendChild(left)
row.appendChild(right)

list.appendChild(row)
})


// TOTAL SECTION
const totalDiv = document.createElement("div")
totalDiv.className = "breakdown-total"

totalDiv.innerHTML = `
<span>TOTAL ${type.toUpperCase()}</span>
<span>$${total.toFixed(2)}</span>
`
totalDiv.style.color = type === "expense" ? "#dc2626" : "#16a34a" 
list.appendChild(totalDiv)
}

const expenseBtn = document.getElementById("expense-breakdown")
const incomeBtn = document.getElementById("income-breakdown")

expenseBtn.addEventListener("click", function(){

// move island
expenseBtn.classList.add("active")
incomeBtn.classList.remove("active")
// update data
showBreakdown("expense")
  
})

incomeBtn.addEventListener("click", function(){

// move island
incomeBtn.classList.add("active")
expenseBtn.classList.remove("active")

// update data
showBreakdown("income")

})
// initial breakdown display


function openModal() {
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

// transaction list in nav-bar
function loadPage(page){

  const dashboardTop = document.getElementById("dashboard-top");
  const transactions = document.getElementById("transactions-section");
  const month = document.getElementById("month-section");

  if(page === "dashboard"){
    dashboardTop.classList.remove("hidden");
    transactions.classList.remove("hidden");
    month.classList.remove("hidden");
  }

  if(page === "transactions"){
    dashboardTop.classList.add("hidden");   // hide cards + breakdown
    transactions.classList.remove("hidden");
    month.classList.add("hidden");          // 🔥 remove March
  }
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.classList.remove("active");
  });

  document.querySelector(`.nav-item[data-page="${page}"]`)
    .classList.add("active");
}



window.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
});