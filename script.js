// ========================================
// NEXUS CRM - APPLICATION LOGIC
// Frontend demo: data is stored in browser LocalStorage.
// ========================================

const defaultCustomers = [
    {id:1,name:"Alex Morgan",email:"alex@email.com",company:"TechVision",status:"Active",revenue:4500},
    {id:2,name:"Sarah Johnson",email:"sarah@email.com",company:"Creative Studio",status:"Active",revenue:2800},
    {id:3,name:"Michael Chen",email:"michael@email.com",company:"Digital Works",status:"Pending",revenue:1950},
    {id:4,name:"Emily Wilson",email:"emily@email.com",company:"NextGen",status:"Active",revenue:3200},
    {id:5,name:"Daniel White",email:"daniel@email.com",company:"Smart Solutions",status:"Inactive",revenue:850}
];

const defaultProjects = [
    {id:1,name:"Website Redesign",description:"Redesigning the company website and improving user experience.",progress:75,status:"In Progress"},
    {id:2,name:"Mobile Application",description:"Building a modern mobile application for customers.",progress:45,status:"In Progress"},
    {id:3,name:"Marketing Campaign",description:"Launching the next digital marketing campaign.",progress:100,status:"Completed"},
    {id:4,name:"CRM Integration",description:"Connecting CRM tools and customer management systems.",progress:25,status:"In Progress"},
    {id:5,name:"Brand Identity",description:"Creating a new visual identity for the company.",progress:60,status:"In Progress"},
    {id:6,name:"Analytics System",description:"Building a business analytics and reporting system.",progress:90,status:"In Progress"}
];

function loadData(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback.map(item => ({...item}));
    } catch (error) {
        console.error(`Could not load ${key}:`, error);
        return fallback.map(item => ({...item}));
    }
}

let customers = loadData("nexus_customers", defaultCustomers);
let projects = loadData("nexus_projects", defaultProjects);
let currentPage = "overview";
let toastTimer;

function saveData() {
    try {
        localStorage.setItem("nexus_customers", JSON.stringify(customers));
        localStorage.setItem("nexus_projects", JSON.stringify(projects));
    } catch (error) {
        console.error("Could not save CRM data:", error);
        toast("Could not save data in this browser.");
    }
}

const pageInfo = {
    overview:{title:"Dashboard Overview",subtitle:"Welcome back! Here's what's happening today."},
    customers:{title:"Customers",subtitle:"Manage your customers and business relationships."},
    analytics:{title:"Analytics",subtitle:"Understand your business performance."},
    projects:{title:"Projects",subtitle:"Track and manage your team's projects."},
    messages:{title:"Messages",subtitle:"Communicate with your customers."},
    settings:{title:"Settings",subtitle:"Manage your application preferences."}
};

const money = value => "$" + Number(value || 0).toLocaleString("en-US");

function safe(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    })[char]);
}

function initials(name) {
    return String(name || "").trim().split(/\s+/).map(word => word[0] || "").join("").slice(0,2).toUpperCase();
}

function statusClass(status) {
    return String(status).toLowerCase() + "-status";
}

function toast(message) {
    const element = document.getElementById("toast");
    element.textContent = message;
    element.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove("show"), 2500);
}

function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
}

// NAVIGATION
function navigate(page) {
    if (!pageInfo[page]) return;
    currentPage = page;

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.toggle("active", item.dataset.page === page);
    });

    document.getElementById("pageTitle").textContent = pageInfo[page].title;
    document.getElementById("pageSubtitle").textContent = pageInfo[page].subtitle;
    renderPage();
    document.querySelector(".sidebar").classList.remove("mobile-open");
}

document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => navigate(item.dataset.page));
});

function renderPage() {
    const pages = {
        overview:renderOverview,
        customers:renderCustomers,
        analytics:renderAnalytics,
        projects:renderProjects,
        messages:renderMessages,
        settings:renderSettings
    };
    document.getElementById("pageContent").innerHTML = pages[currentPage]();
    refreshIcons();
}

// OVERVIEW
function renderOverview() {
    const totalRevenue = customers.reduce((sum,c) => sum + Number(c.revenue || 0),0);
    const activeCustomers = customers.filter(c => c.status === "Active").length;
    const activeProjects = projects.filter(p => p.status === "In Progress").length;

    return `
        <div class="section-heading"><h2>Business Overview</h2><span class="muted">Live demo data</span></div>
        <section class="stats">
            <div class="card"><div class="stat-top"><div class="stat-icon purple"><i data-lucide="users"></i></div></div><p class="stat-label">Total Customers</p><h2 class="stat-value">${customers.length}</h2><p class="stat-change">${activeCustomers} <span>active customers</span></p></div>
            <div class="card"><div class="stat-top"><div class="stat-icon blue"><i data-lucide="dollar-sign"></i></div></div><p class="stat-label">Customer Revenue</p><h2 class="stat-value">${money(totalRevenue)}</h2><p class="stat-change">Calculated <span>from customer records</span></p></div>
            <div class="card"><div class="stat-top"><div class="stat-icon orange"><i data-lucide="folder-kanban"></i></div></div><p class="stat-label">Total Projects</p><h2 class="stat-value">${projects.length}</h2><p class="stat-change">${activeProjects} <span>in progress</span></p></div>
            <div class="card"><div class="stat-top"><div class="stat-icon green"><i data-lucide="check-circle"></i></div></div><p class="stat-label">Completed Projects</p><h2 class="stat-value">${projects.filter(p => p.status === "Completed").length}</h2><p class="stat-change">Project <span>performance</span></p></div>
        </section>
        <section class="analytics-grid">
            <div class="card"><div class="card-header"><div><h3>Revenue Analytics</h3><p>Illustrative monthly performance</p></div><span class="muted">Demo</span></div><div class="chart-total"><strong>${money(totalRevenue)}</strong><span>Customer revenue</span></div>${renderChart()}</div>
            <div class="card"><div class="card-header"><div><h3>Customer Status</h3><p>Current customer distribution</p></div></div><div class="source-list">${renderCustomerSources()}</div></div>
        </section>
        <section><div class="table-header"><h2>Recent Customers</h2><button class="primary-btn" data-action="go-customers">View All Customers</button></div>${customerTable(customers.slice(0,5),false)}</section>`;
}

function renderChart() {
    const values = [35,55,45,70,60,85,50,75,65,90,70,95];
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `<div class="bar-chart">${values.map(value => `<div class="bar-group"><div class="bar" style="height:${value*.65}%"></div><div class="bar main-bar" style="height:${value}%"></div></div>`).join("")}</div><div class="chart-labels">${months.map(month => `<span>${month}</span>`).join("")}</div>`;
}

function renderCustomerSources() {
    const total = customers.length || 1;
    return [{name:"Active",color:"#715be8"},{name:"Pending",color:"#4389e7"},{name:"Inactive",color:"#ed9844"}].map(item => {
        const count = customers.filter(c => c.status === item.name).length;
        const percentage = Math.round(count / total * 100);
        return `<div class="source-item"><div class="source-info"><span>${item.name}</span><span>${count} (${percentage}%)</span></div><div class="progress"><div class="progress-fill" style="width:${percentage}%;background:${item.color}"></div></div></div>`;
    }).join("");
}

// CUSTOMER TABLE AND PAGE
function customerTable(list, showActions = true) {
    if (!list.length) return `<div class="card empty-message">No customers found.</div>`;
    return `<div class="table-container"><table><thead><tr><th>CUSTOMER</th><th>EMAIL</th><th>COMPANY</th><th>STATUS</th><th>REVENUE</th>${showActions?"<th>ACTIONS</th>":""}</tr></thead><tbody>
    ${list.map(c => `<tr><td><div class="customer-name"><div class="small-avatar purple">${safe(initials(c.name))}</div>${safe(c.name)}</div></td><td>${safe(c.email)}</td><td>${safe(c.company)}</td><td><span class="status ${statusClass(c.status)}">${safe(c.status)}</span></td><td>${money(c.revenue)}</td>${showActions?`<td><div class="action-buttons"><button class="small-action" data-action="edit-customer" data-id="${c.id}" title="Edit"><i data-lucide="pencil"></i></button><button class="small-action delete" data-action="delete-customer" data-id="${c.id}" title="Delete"><i data-lucide="trash-2"></i></button></div></td>`:""}</tr>`).join("")}
    </tbody></table></div>`;
}

function renderCustomers() {
    return `<div class="page-intro"><h2>Customer Management</h2><p>Add, search, edit and manage your business customers.</p></div>
    <div class="stats">
        <div class="card"><p class="stat-label">Total Customers</p><h2 class="stat-value">${customers.length}</h2></div>
        <div class="card"><p class="stat-label">Active</p><h2 class="stat-value">${customers.filter(c=>c.status==="Active").length}</h2></div>
        <div class="card"><p class="stat-label">Pending</p><h2 class="stat-value">${customers.filter(c=>c.status==="Pending").length}</h2></div>
        <div class="card"><p class="stat-label">Inactive</p><h2 class="stat-value">${customers.filter(c=>c.status==="Inactive").length}</h2></div>
    </div>
    <div class="table-header"><h2>All Customers</h2><div class="table-actions"><input class="search" id="customerSearch" placeholder="Search customers..."><button class="primary-btn" data-action="add-customer">+ Add Customer</button></div></div>
    <div id="customerResults">${customerTable(customers)}</div>`;
}

function renderAnalytics() {
    const total = customers.reduce((sum,c)=>sum+Number(c.revenue||0),0);
    const average = customers.length ? total/customers.length : 0;
    return `<div class="page-intro"><h2>Business Analytics</h2><p>Key metrics calculated from your customer records.</p></div>
    <div class="stats">
        <div class="card"><p class="stat-label">Total Revenue</p><h2 class="stat-value">${money(total)}</h2><p class="metric-description">All customer revenue</p></div>
        <div class="card"><p class="stat-label">Average Revenue</p><h2 class="stat-value">${money(average)}</h2><p class="metric-description">Per customer</p></div>
        <div class="card"><p class="stat-label">Active Customers</p><h2 class="stat-value">${customers.filter(c=>c.status==="Active").length}</h2><p class="metric-description">Currently active</p></div>
        <div class="card"><p class="stat-label">Total Customers</p><h2 class="stat-value">${customers.length}</h2><p class="metric-description">All customer records</p></div>
    </div><div class="two-column"><div class="card"><h3>Revenue Performance</h3><p class="muted">Illustrative monthly chart</p><div style="margin-top:20px">${renderChart()}</div></div><div class="card"><h3>Customer Distribution</h3><p class="muted">By customer status</p><div class="source-list">${renderCustomerSources()}</div></div></div>`;
}

// PROJECTS PAGE
function renderProjects() {
    const total = projects.length;
    const completed = projects.filter(p=>p.status==="Completed").length;
    const inProgress = projects.filter(p=>p.status==="In Progress").length;
    const onHold = projects.filter(p=>p.status==="On Hold").length;
    const average = total ? Math.round(projects.reduce((sum,p)=>sum+Number(p.progress||0),0)/total) : 0;

    return `<div class="page-intro"><h2>Project Management</h2><p>Create, edit, track and manage your projects.</p></div>
    <div class="stats">
        <div class="card"><p class="stat-label">Total Projects</p><h2 class="stat-value">${total}</h2></div>
        <div class="card"><p class="stat-label">In Progress</p><h2 class="stat-value">${inProgress}</h2></div>
        <div class="card"><p class="stat-label">Completed</p><h2 class="stat-value">${completed}</h2></div>
        <div class="card"><p class="stat-label">On Hold</p><h2 class="stat-value">${onHold}</h2></div>
    </div>
    <div class="section-heading"><div><h2>All Projects</h2><p class="muted">Average progress: ${average}%</p></div><button class="primary-btn" data-action="add-project">+ Add Project</button></div>
    <div class="project-toolbar"><input class="search" id="projectSearch" placeholder="Search projects..."><select class="field-select project-filter" id="projectFilter"><option value="All">All Statuses</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option><option value="On Hold">On Hold</option></select></div>
    <div id="projectResults">${projectCards(projects)}</div>`;
}

function projectCards(list) {
    if (!list.length) return `<div class="card empty-message project-empty">No projects found. Try another search or add a project.</div>`;
    return `<div class="project-grid">${list.map(p => {
        const progress = Math.max(0,Math.min(100,Number(p.progress)||0));
        const statusStyle = {"In Progress":"in-progress","Completed":"completed","On Hold":"on-hold"}[p.status] || "in-progress";
        return `<div class="card project-card">
            <div class="project-top"><div class="project-icon"><i data-lucide="folder-kanban"></i></div><span class="project-status ${statusStyle}">${safe(p.status)}</span></div>
            <h3>${safe(p.name)}</h3><p>${safe(p.description || "No description provided.")}</p>
            <div class="project-footer"><span>Progress</span><strong>${progress}%</strong></div>
            <div class="project-progress"><div style="width:${progress}%"></div></div>
            <div class="project-card-actions"><button class="secondary-btn" data-action="edit-project" data-id="${p.id}"><i data-lucide="pencil"></i> Edit</button><button class="secondary-btn" data-action="delete-project" data-id="${p.id}"><i data-lucide="trash-2"></i> Delete</button></div>
        </div>`;
    }).join("")}</div>`;
}

// MESSAGES
function renderMessages() {
    return `<div class="page-intro"><h2>Messages</h2><p>Demo messaging interface.</p></div>
    <div class="card message-layout"><div class="message-list">
        <div class="message-person selected"><div class="avatar">AM</div><div><strong>Alex Morgan</strong><small>Hi, I need an update...</small></div></div>
        <div class="message-person"><div class="avatar">SJ</div><div><strong>Sarah Johnson</strong><small>Thank you!</small></div></div>
        <div class="message-person"><div class="avatar">MC</div><div><strong>Michael Chen</strong><small>Let's discuss the project.</small></div></div>
    </div><div class="message-conversation" id="conversation"><div><strong>Alex Morgan</strong><p class="muted">Customer conversation</p></div>
        <div class="message-bubble">Hello! I need an update on our current project.</div><div class="message-bubble sent">Hi Alex! The project is progressing well.</div>
        <form class="message-compose" id="messageForm"><input class="field-input" id="messageInput" placeholder="Write a message..." required><button class="primary-btn" type="submit">Send</button></form>
    </div></div>`;
}

// SETTINGS
function renderSettings() {
    const dark = document.body.classList.contains("dark");
    return `<div class="page-intro"><h2>Application Settings</h2><p>Customize your NEXUS CRM experience.</p></div>
    <div class="card settings-group"><h3>Appearance</h3><div class="settings-row"><div><strong>Dark Mode</strong><p>Change the application color theme.</p></div><button class="toggle ${dark?"enabled":""}" data-action="toggle-theme" aria-label="Toggle dark mode"></button></div></div>
    <div class="card settings-group"><h3>Account Information</h3><div class="settings-row"><div><strong>Account Name</strong><p>John Davis</p></div><span class="muted">Administrator</span></div><div class="settings-row"><div><strong>Email Address</strong><p>john@nexuscrm.com</p></div><span class="muted">Demo account</span></div></div>
    <div class="card settings-group"><h3>Data Management</h3><div class="settings-row"><div><strong>Reset Demo Data</strong><p>Restore the original sample customers and projects.</p></div><button class="secondary-btn" data-action="reset-data">Reset Data</button></div></div>`;
}

// CUSTOMER MODAL AND CRUD
const customerModal = document.getElementById("modalOverlay");
const customerForm = document.getElementById("customerForm");

function openCustomerModal(id=null) {
    customerForm.reset();
    document.getElementById("customerId").value = id ?? "";
    document.getElementById("modalTitle").textContent = id!==null ? "Edit Customer" : "Add Customer";
    if (id!==null) {
        const c = customers.find(item=>item.id===Number(id));
        if (!c) return;
        document.getElementById("customerName").value = c.name;
        document.getElementById("customerEmail").value = c.email;
        document.getElementById("customerCompany").value = c.company;
        document.getElementById("customerStatus").value = c.status;
        document.getElementById("customerRevenue").value = c.revenue;
    }
    customerModal.classList.add("open");
    refreshIcons();
}
function closeCustomerModal(){customerModal.classList.remove("open");}
document.getElementById("closeModal").addEventListener("click",closeCustomerModal);
document.getElementById("cancelModal").addEventListener("click",closeCustomerModal);
customerModal.addEventListener("click",e=>{if(e.target===customerModal)closeCustomerModal();});

customerForm.addEventListener("submit",event=>{
    event.preventDefault();
    const id=document.getElementById("customerId").value;
    const customer={
        id:id?Number(id):Date.now(),
        name:document.getElementById("customerName").value.trim(),
        email:document.getElementById("customerEmail").value.trim(),
        company:document.getElementById("customerCompany").value.trim(),
        status:document.getElementById("customerStatus").value,
        revenue:Math.max(0,Number(document.getElementById("customerRevenue").value)||0)
    };
    if(id){customers=customers.map(c=>c.id===Number(id)?customer:c);toast("Customer updated successfully!");}
    else{customers.unshift(customer);toast("Customer added successfully!");}
    saveData();closeCustomerModal();renderPage();
});

function deleteCustomer(id){
    const customer=customers.find(c=>c.id===Number(id));
    if(!customer||!confirm(`Delete ${customer.name}?`))return;
    customers=customers.filter(c=>c.id!==Number(id));
    saveData();renderPage();toast("Customer deleted successfully!");
}

// PROJECT MODAL AND CRUD
const projectModal=document.getElementById("projectModalOverlay");
const projectForm=document.getElementById("projectForm");

function openProjectModal(id=null){
    projectForm.reset();
    document.getElementById("projectId").value=id??"";
    document.getElementById("projectModalTitle").textContent=id!==null?"Edit Project":"Add Project";
    if(id!==null){
        const project=projects.find(p=>p.id===Number(id));
        if(!project)return;
        document.getElementById("projectName").value=project.name;
        document.getElementById("projectDescription").value=project.description||"";
        document.getElementById("projectProgress").value=project.progress;
        document.getElementById("projectStatus").value=project.status;
    }
    projectModal.classList.add("open");
    refreshIcons();
}
function closeProjectModal(){projectModal.classList.remove("open");}
document.getElementById("closeProjectModal").addEventListener("click",closeProjectModal);
document.getElementById("cancelProjectModal").addEventListener("click",closeProjectModal);
projectModal.addEventListener("click",e=>{if(e.target===projectModal)closeProjectModal();});

projectForm.addEventListener("submit",event=>{
    event.preventDefault();
    const id=document.getElementById("projectId").value;
    const name=document.getElementById("projectName").value.trim();
    const description=document.getElementById("projectDescription").value.trim();
    let progress=Number(document.getElementById("projectProgress").value);
    const status=document.getElementById("projectStatus").value;

    if(!name){toast("Please enter a project name.");return;}
    if(!Number.isFinite(progress)||progress<0||progress>100){toast("Progress must be between 0 and 100.");return;}
    if(status==="Completed")progress=100;

    const project={id:id?Number(id):Date.now(),name,description,progress,status};
    if(id){projects=projects.map(p=>p.id===Number(id)?project:p);toast("Project updated successfully!");}
    else{projects.unshift(project);toast("Project added successfully!");}

    saveData();closeProjectModal();renderPage();
});

function deleteProject(id){
    const project=projects.find(p=>p.id===Number(id));
    if(!project||!confirm(`Delete project "${project.name}"?`))return;
    projects=projects.filter(p=>p.id!==Number(id));
    saveData();renderPage();toast("Project deleted successfully!");
}

function filterProjects(){
    const search=document.getElementById("projectSearch");
    const filter=document.getElementById("projectFilter");
    if(!search||!filter)return;
    const query=search.value.trim().toLowerCase();
    const status=filter.value;
    const filtered=projects.filter(p=>{
        const textMatch=[p.name,p.description,p.status].some(value=>String(value||"").toLowerCase().includes(query));
        return textMatch&&(status==="All"||p.status===status);
    });
    document.getElementById("projectResults").innerHTML=projectCards(filtered);
    refreshIcons();
}

// SHARED EVENT DELEGATION
document.addEventListener("click",event=>{
    const button=event.target.closest("[data-action]");
    if(!button)return;
    const {action,id}=button.dataset;

    if(action==="add-customer")openCustomerModal();
    if(action==="edit-customer")openCustomerModal(id);
    if(action==="delete-customer")deleteCustomer(id);
    if(action==="add-project")openProjectModal();
    if(action==="edit-project")openProjectModal(id);
    if(action==="delete-project")deleteProject(id);
    if(action==="go-customers")navigate("customers");
    if(action==="toggle-theme")toggleTheme();
    if(action==="reset-data"){
        if(!confirm("Restore all original demo data?"))return;
        customers=defaultCustomers.map(c=>({...c}));
        projects=defaultProjects.map(p=>({...p}));
        saveData();renderPage();toast("Demo data restored!");
    }
});

// SEARCH
document.addEventListener("input",event=>{
    if(event.target.id==="customerSearch"){
        const query=event.target.value.toLowerCase();
        const filtered=customers.filter(c=>[c.name,c.email,c.company,c.status].some(v=>String(v).toLowerCase().includes(query)));
        document.getElementById("customerResults").innerHTML=customerTable(filtered);
        refreshIcons();
    }
    if(event.target.id==="projectSearch")filterProjects();
});
document.addEventListener("change",event=>{
    if(event.target.id==="projectFilter")filterProjects();
});

// THEME
function toggleTheme(){
    document.body.classList.toggle("dark");
    const dark=document.body.classList.contains("dark");
    localStorage.setItem("nexus_theme",dark?"dark":"light");
    document.getElementById("themeBtn").innerHTML=`<i data-lucide="${dark?"sun":"moon"}"></i>`;
    refreshIcons();
    if(currentPage==="settings")renderPage();
}
if(localStorage.getItem("nexus_theme")==="dark")document.body.classList.add("dark");
document.getElementById("themeBtn").innerHTML=`<i data-lucide="${document.body.classList.contains("dark")?"sun":"moon"}"></i>`;
document.getElementById("themeBtn").addEventListener("click",toggleTheme);

// MESSAGES
document.addEventListener("submit",event=>{
    if(event.target.id!=="messageForm")return;
    event.preventDefault();
    const input=document.getElementById("messageInput");
    const message=input.value.trim();
    if(!message)return;
    const bubble=document.createElement("div");
    bubble.className="message-bubble sent";
    bubble.textContent=message;
    document.getElementById("conversation").insertBefore(bubble,event.target);
    input.value="";
    toast("Demo message added!");
});

// MOBILE AND DEMO BUTTONS
document.getElementById("mobileMenu").addEventListener("click",()=>document.querySelector(".sidebar").classList.toggle("mobile-open"));
document.getElementById("upgradeBtn").addEventListener("click",()=>toast("Pro features are coming soon!"));
document.getElementById("notificationBtn").addEventListener("click",()=>toast("You are all caught up!"));

// INITIALIZE
renderPage();
refreshIcons();
