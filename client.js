// Client Database
// Add your clients here. The "key" (like "pankaj" or "client1") is what you put in the URL: tradables.in/client.html?id=pankaj
const clientDatabase = {
    // --------------------------------------------------
    // 1. RAHUL'S ACCOUNT
    // To view this dashboard, go to: tradables.in/client.html?id=rahul
    // --------------------------------------------------
    "rahul": {
        name: "Rahul",
        capital: 100000, // <-- EDIT THIS: Type his exact starting capital here (e.g., 500000)
        
        // <-- EDIT THIS: Paste Rahul's "Published to web (.csv)" link inside the quotes below!
        csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vT4tjdL13nvnVfrJN2QeRFiXz-rXTdlfUkA8X-HZOkXzOe5YMzgbRr2FRksHQzb3ahdEGqiFSYRe40A/pub?output=csv" 
    },

    // --------------------------------------------------
    // 2. DEMO ACCOUNT (For testing)
    // --------------------------------------------------
    "demo": {
        name: "Demo Account",
        capital: 1000000,
        csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRwFWLZUJVjdm7ftMb2NZ3ceheF-nqOQynDJnCCZUAPir83aJc__pDEgqEZEH8GcGwZDdMkP9bjf7eh/pub?gid=0&single=true&output=csv"
    }
};

async function loadClientDashboard() {
    // 1. Get the Client ID from the URL (e.g. ?id=demo)
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get('id');
    
    const errorBox = document.getElementById('error-box');
    const dashboard = document.getElementById('dashboard-content');

    // 2. Validate Client
    if (!clientId || !clientDatabase[clientId]) {
        errorBox.style.display = 'block';
        return;
    }

    const client = clientDatabase[clientId];
    
    // Set Name
    document.getElementById('client-name').textContent = client.name;
    
    const formatINR = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
    document.getElementById('client-capital').textContent = formatINR(client.capital);

    // 3. Fetch Data
    if (!client.csvUrl) {
        errorBox.innerHTML = "<h3>Data Not Connected</h3><p>This client's Google Sheet link is missing.</p>";
        errorBox.style.display = 'block';
        return;
    }

    try {
        const response = await fetch(client.csvUrl);
        const csvText = await response.text();
        const rows = csvText.split('\n').map(row => row.split(','));

        let labels = [];
        let dailyPnlData = [];
        let cumulativeData = [];

        let rawData = [];
        let headerRowIdx = -1;
        
        for (let i = 0; i < rows.length; i++) {
            if (rows[i][0] === "Date" && rows[i][1] === "Deposit") {
                headerRowIdx = i;
                break;
            }
        }

        if (headerRowIdx !== -1) {
            const headers = rows[headerRowIdx];
            const numGroups = Math.floor(headers.length / 5);

            for (let g = 0; g < numGroups; g++) {
                let colOffset = g * 5;
                let lastDateObjForMonth = null;
                
                for (let r = headerRowIdx + 1; r < rows.length; r++) {
                    let dateStr = rows[r][colOffset] ? rows[r][colOffset].trim() : "";
                    
                    // Check for the Interest & Expenses row even if date is empty
                    let col2Str = rows[r][colOffset + 2] ? rows[r][colOffset + 2].trim() : "";
                    if (col2Str === "Interest & Expenses") {
                        let expenseStr = rows[r][colOffset + 3];
                        let expense = parseFloat(expenseStr ? expenseStr.replace(/,/g, '') : "-2000") || -2000;
                        if (lastDateObjForMonth) {
                            // Add fee slightly after the last trading day of the month
                            rawData.push({
                                dateObj: new Date(lastDateObjForMonth.getTime() + 1000), 
                                label: "End of Month Fees", 
                                pnl: expense, 
                                cummPnl: 0 
                            });
                        }
                        continue;
                    }
                    
                    if (dateStr === "") continue;
                    if (dateStr.includes("Total") || dateStr.includes("PNL") || dateStr.includes("Interest") || dateStr.includes("Net")) continue;
                    
                    let pnlStr = rows[r][colOffset + 2];
                    
                    let pnl = 0;
                    if (pnlStr !== "No Trade" && pnlStr !== "Holiday" && pnlStr !== undefined) {
                        pnl = parseFloat(pnlStr.replace(/,/g, '')) || 0;
                    }
                    
                    let parts = dateStr.split('/');
                    if (parts.length === 3) {
                        let dateObj = new Date(parseInt(parts[2]), parseInt(parts[0])-1, parseInt(parts[1]));
                        lastDateObjForMonth = dateObj;
                        rawData.push({ dateObj, label: dateStr, pnl: pnl, cummPnl: 0 });
                    }
                }
            }
            
            // Sort chronologically
            rawData.sort((a, b) => a.dateObj - b.dateObj);
            
            // Calculate a True Cumulative P&L over the entire lifetime
            let trueCumulativePnl = 0;
            for (let i = 0; i < rawData.length; i++) {
                trueCumulativePnl += rawData[i].pnl;
                rawData[i].cummPnl = trueCumulativePnl;
            }
            
            labels = rawData.map(d => d.label);
            dailyPnlData = rawData.map(d => d.pnl);
            cumulativeData = rawData.map(d => d.cummPnl);
        }

        // 4. Update Stats
        const finalPnL = cumulativeData.length > 0 ? cumulativeData[cumulativeData.length - 1] : 0;
        const currentValue = client.capital + finalPnL;
        const returnPct = ((finalPnL / client.capital) * 100).toFixed(2);

        document.getElementById('client-current').textContent = formatINR(currentValue);
        document.getElementById('client-return-abs').textContent = (finalPnL > 0 ? '+' : '') + formatINR(finalPnL);
        document.getElementById('client-return-abs').style.color = finalPnL >= 0 ? '#10b981' : '#ef4444';
        
        document.getElementById('client-return-pct').textContent = (returnPct > 0 ? '+' : '') + returnPct + '%';
        document.getElementById('client-return-pct').style.color = returnPct >= 0 ? '#10b981' : '#ef4444';

        // 5. Draw Chart
        dashboard.style.display = 'block';
        
        const ctx = document.getElementById('clientChart');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        type: 'line',
                        label: 'Cumulative P&L (₹)',
                        data: cumulativeData,
                        borderColor: '#1e3a8a',
                        backgroundColor: '#1e3a8a',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        type: 'bar',
                        label: 'Daily P&L (₹)',
                        data: dailyPnlData,
                        backgroundColor: function(context) {
                            const value = context.dataset.data[context.dataIndex];
                            return value < 0 ? 'rgba(239, 68, 68, 0.5)' : 'rgba(16, 185, 129, 0.5)';
                        },
                        borderColor: function(context) {
                            const value = context.dataset.data[context.dataIndex];
                            return value < 0 ? '#ef4444' : '#10b981';
                        },
                        borderWidth: 1,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { family: "'Outfit', sans-serif" } } },
                    tooltip: {
                        mode: 'index', intersect: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) label += ': ';
                                if (context.parsed.y !== null) label += formatINR(context.parsed.y);
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear', display: true, position: 'left',
                        title: { display: true, text: 'Cumulative P&L' },
                        ticks: { callback: function(value) { return '₹' + (value / 1000).toFixed(0) + 'k'; } }
                    },
                    y1: {
                        type: 'linear', display: true, position: 'right',
                        title: { display: true, text: 'Daily P&L' },
                        grid: { drawOnChartArea: false },
                        ticks: { callback: function(value) { return '₹' + (value / 1000).toFixed(0) + 'k'; } }
                    },
                    x: { grid: { display: false } }
                },
                interaction: { mode: 'index', intersect: false }
            }
        });

    } catch (error) {
        console.error(error);
        errorBox.innerHTML = "<h3>Error</h3><p>Could not load the data. Make sure the Google Sheet is published as CSV.</p>";
        errorBox.style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', loadClientDashboard);
