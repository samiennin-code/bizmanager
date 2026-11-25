const KEY="bizmanager_v1";
const blank={products:[],purchases:[],sales:[],expenses:[]};
let db=load();
function load(){try{return {...blank,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch(e){return structuredClone(blank)}}
function save(){localStorage.setItem(KEY,JSON.stringify(db));render()}
const money=n=>"GH₵"+Number(n||0).toLocaleString("en-GH",{minimumFractionDigits:2,maximumFractionDigits:2});
const today=()=>new Date().toISOString().slice(0,10);
const val=id=>document.getElementById(id).value;
const num=id=>Number(val(id)||0);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function toast(msg){let t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2600)}
function product(id){return db.products.find(p=>p.id===id)}
function sum(arr,key){return arr.reduce((a,x)=>a+Number(x[key]||0),0)}
function nav(view){document.querySelectorAll(".view").forEach(x=>x.classList.toggle("active",x.id===view));document.querySelectorAll(".bottom-nav button").forEach(x=>x.classList.toggle("active",x.dataset.view===view))}
document.querySelectorAll(".bottom-nav button").forEach(b=>b.addEventListener("click",()=>nav(b.dataset.view)));
function setDates(){["purchaseDate","saleDate","expenseDate"].forEach(id=>document.getElementById(id).value=today());document.getElementById("todayLabel").textContent=new Date().toLocaleDateString("en-GH",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
function updateProductOptions(){
  ["purchaseProduct","saleProduct"].forEach(id=>{let s=document.getElementById(id),old=s.value;s.innerHTML='<option value="">Choose a product</option>'+db.products.map(p=>`<option value="${p.id}">${esc(p.name)} (stock: ${p.qty})</option>`).join("");if(product(old))s.value=old});
}
document.getElementById("productForm").addEventListener("submit",e=>{
 e.preventDefault();let p={id:crypto.randomUUID(),name:val("pName").trim(),category:val("pCategory").trim(),qty:num("pQty"),cost:num("pCost"),price:num("pPrice"),min:num("pMin")};
 if(db.products.some(x=>x.name.toLowerCase()===p.name.toLowerCase()))return toast("A product with that name already exists.");
 db.products.push(p);e.target.reset();document.getElementById("pQty").value=0;document.getElementById("pCost").value=0;document.getElementById("pPrice").value=0;document.getElementById("pMin").value=5;save();toast("Product saved.");
});
document.getElementById("purchaseProduct").addEventListener("change",()=>{let p=product(val("purchaseProduct"));if(p)document.getElementById("purchaseCost").value=p.cost});
document.getElementById("saleProduct").addEventListener("change",()=>{let p=product(val("saleProduct"));if(p)document.getElementById("salePrice").value=p.price});
document.getElementById("purchaseForm").addEventListener("submit",e=>{
 e.preventDefault();let p=product(val("purchaseProduct")),qty=num("purchaseQty"),cost=num("purchaseCost"),total=qty*cost,paid=num("purchasePaid");
 if(!p)return toast("Please add and select a product first.");if(qty<=0||cost<0||paid<0)return toast("Check the quantity and amounts.");if(paid>total)return toast("Amount paid cannot exceed purchase total.");
 const oldValue=p.qty*p.cost;p.qty+=qty;p.cost=p.qty?(oldValue+total)/p.qty:cost;
 db.purchases.unshift({id:crypto.randomUUID(),date:val("purchaseDate"),productId:p.id,name:p.name,supplier:val("purchaseSupplier").trim(),qty,cost,total,paid,balance:total-paid,method:val("purchaseMethod")});
 e.target.reset();setDates();save();toast("Purchase saved and stock updated.");
});
document.getElementById("saleForm").addEventListener("submit",e=>{
 e.preventDefault();let p=product(val("saleProduct")),qty=num("saleQty"),price=num("salePrice"),total=qty*price,paid=num("salePaid");
 if(!p)return toast("Please select a product.");if(qty<=0||price<0||paid<0)return toast("Check the quantity and amounts.");if(qty>p.qty)return toast("Not enough stock available.");if(paid>total)return toast("Amount received cannot exceed sale total.");
 p.qty-=qty;db.sales.unshift({id:crypto.randomUUID(),date:val("saleDate"),productId:p.id,name:p.name,qty,price,total,costAtSale:p.cost,cogs:qty*p.cost,customer:val("saleCustomer").trim(),paid,balance:total-paid,method:val("saleMethod")});
 e.target.reset();setDates();save();toast("Sale saved and stock updated.");
});
document.getElementById("expenseForm").addEventListener("submit",e=>{
 e.preventDefault();db.expenses.unshift({id:crypto.randomUUID(),date:val("expenseDate"),description:val("expenseDesc").trim(),category:val("expenseCategory"),amount:num("expenseAmount")});
 e.target.reset();setDates();save();toast("Expense saved.");
});
function render(){
 updateProductOptions();
 document.getElementById("productRows").innerHTML=db.products.map(p=>`<tr><td>${esc(p.name)}<br><small>${esc(p.category)}</small></td><td>${p.qty}</td><td>${money(p.cost)}</td><td>${money(p.price)}</td><td class="${p.qty<=p.min?'status-low':'status-ok'}">${p.qty<=p.min?'Low stock':'In stock'}</td></tr>`).join("")||'<tr><td colspan="5">No products added.</td></tr>';
 document.getElementById("purchaseRows").innerHTML=db.purchases.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.name)}</td><td>${esc(x.supplier||"—")}</td><td>${money(x.total)}</td><td>${money(x.paid)}</td><td>${money(x.balance)}</td></tr>`).join("")||'<tr><td colspan="6">No purchases recorded.</td></tr>';
 document.getElementById("saleRows").innerHTML=db.sales.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.name)}</td><td>${x.qty}</td><td>${money(x.total)}</td><td>${money(x.paid)}</td><td>${money(x.balance)}</td></tr>`).join("")||'<tr><td colspan="6">No sales recorded.</td></tr>';
 document.getElementById("expenseRows").innerHTML=db.expenses.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.description)}</td><td>${esc(x.category)}</td><td>${money(x.amount)}</td></tr>`).join("")||'<tr><td colspan="4">No expenses recorded.</td></tr>';
 const sales=sum(db.sales,"total"),cogs=sum(db.sales,"cogs"),expenses=sum(db.expenses,"amount"),purchases=sum(db.purchases,"total"),todaySales=sum(db.sales.filter(x=>x.date===today()),"total"),low=db.products.filter(p=>p.qty<=p.min).length,supplierDebt=sum(db.purchases,"balance");
 document.getElementById("salesToday").textContent=money(todaySales);document.getElementById("purchasesTotal").textContent=money(purchases);document.getElementById("expensesTotal").textContent=money(expenses);document.getElementById("grossProfit").textContent=money(sales-cogs);document.getElementById("productCount").textContent=db.products.length;document.getElementById("lowStockCount").textContent=low;
 document.getElementById("reportSales").textContent=money(sales);document.getElementById("reportCogs").textContent=money(cogs);document.getElementById("reportGross").textContent=money(sales-cogs);document.getElementById("reportExpenses").textContent=money(expenses);document.getElementById("reportNet").textContent=money(sales-cogs-expenses);document.getElementById("reportSupplierDebt").textContent=money(supplierDebt);
 const acts=[...db.sales.map(x=>({date:x.date,label:"Sale: "+x.name,amount:x.total})),...db.purchases.map(x=>({date:x.date,label:"Purchase: "+x.name,amount:x.total})),...db.expenses.map(x=>({date:x.date,label:"Expense: "+x.description,amount:x.amount}))].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6);
 document.getElementById("recentActivity").innerHTML=acts.length?acts.map(x=>`<div class="activity-row"><strong>${esc(x.label)}</strong><span>${esc(x.date)} · ${money(x.amount)}</span></div>`).join(""):"No transactions have been recorded yet.";
}
function exportBackup(){const blob=new Blob([JSON.stringify({app:"BizManager",version:1,exportedAt:new Date().toISOString(),data:db},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="BizManager-backup-"+today()+".json";a.click();URL.revokeObjectURL(a.href);toast("Backup exported.");}
document.getElementById("exportBtn").addEventListener("click",exportBackup);document.getElementById("backupBtn").addEventListener("click",exportBackup);
document.getElementById("importFile").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;try{const obj=JSON.parse(await f.text());const incoming=obj.data||obj;if(!["products","purchases","sales","expenses"].every(k=>Array.isArray(incoming[k])))throw Error("Invalid backup");if(!confirm("Importing will replace all BizManager records on this device. Continue?"))return;db=incoming;save();toast("Backup restored.");}catch(err){toast("Could not read this backup file.");}e.target.value=""});
setDates();render();
if("serviceWorker" in navigator && location.protocol!=="file:"){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));}
