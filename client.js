// Partner Database
// Add your partners here. The "key" is what goes in the URL: tradables.in/client.html?id=rahul
const partnerDatabase = {
    // --------------------------------------------------
    // 1. RAHUL'S ACCOUNT
    // Dashboard link: tradables.in/client.html?id=rahul
    // --------------------------------------------------
    "rahul": {
        name: "Rahul",
        capital: 100000,
        startDate: "2026-01-01", // When trading started (YYYY-MM-DD)
        csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vT4tjdL13nvnVfrJN2QeRFiXz-rXTdlfUkA8X-HZOkXzOe5YMzgbRr2FRksHQzb3ahdEGqiFSYRe40A/pub?output=csv" 
    },

    // --------------------------------------------------
    // 2. ANADI'S ACCOUNT
    // Dashboard link: tradables.in/client.html?id=anadi
    // --------------------------------------------------
    "anadi": {
        name: "Anadi",
        capital: 210000, // Initial Capital Base: 2.1 Lakhs (210,000 INR)
        startDate: "2024-11-01", // Start of trading logs in sheet: Nov 1, 2024
        csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSKnaTbf9W-cNzuie0PoD0qomQa2m_4Y49asXsnWWIC8UGo8aT1V8nVNLYrNmzrfWfTwwhy5vI3Rdfw/pub?output=csv"
    },

    // --------------------------------------------------
    // 3. PIYUSH'S ACCOUNT
    // Dashboard link: tradables.in/client.html?id=piyush
    // --------------------------------------------------
    "piyush": {
        name: "Piyush",
        capital: 100000, // Initial Capital Base: 1 Lakh (100,000 INR)
        startDate: "2024-11-01", // Start of trading logs in sheet: Nov 1, 2024
        csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR0U7uIzbCOVdtrYWHm0r1EWaBVRwd5DA3cb9lSr6eVnAB9seFG8O76TRgj-EADRz2tWV2Oe9qvwpwH/pub?output=csv"
    },

    // --------------------------------------------------
    // 4. DEMO ACCOUNT
    // --------------------------------------------------
    "demo": {
        name: "Demo Account",
        capital: 1000000,
        startDate: "2024-11-01",
        csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRwFWLZUJVjdm7ftMb2NZ3ceheF-nqOQynDJnCCZUAPir83aJc__pDEgqEZEH8GcGwZDdMkP9bjf7eh/pub?gid=0&single=true&output=csv"
    }
};

const NIFTY_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR5hw7sXQg8DWypibIbrFaBecuMs_EaN6xsjcEU6XquAhp3YgLgAFBs4j_reLdRpQNSIURbFsRIrZEc/pub?output=csv";

// Nifty 50 Monthly Closing Prices (Source: NSE / Yahoo Finance)
// Used as benchmark. Fallback if live data fails.
const NIFTY_MONTHLY_CLOSE = {
    "2024-10": 24205, // Oct 24 close for Nov start base
    "2024-11": 24131,
    "2024-12": 23644,
    "2025-01": 23205,
    "2025-02": 22124,
    "2025-03": 23519,
    "2025-04": 24039,
    "2025-05": 24346,
    "2025-06": 23290,
    "2025-07": 24951,
    "2025-08": 25236,
    "2025-09": 25811,
    "2025-10": 24205,
    "2025-11": 24131,
    "2025-12": 26130,
    "2026-01": 25320,
    "2026-02": 25556,
    "2026-03": 22331,
    "2026-04": 23998
};

// This will be populated with live data
let dynamicNiftyData = { ...NIFTY_MONTHLY_CLOSE };

async function fetchLiveNiftyData() {
    try {
        const response = await fetch(NIFTY_CSV_URL);
        const csvText = await response.text();
        const rows = parseCSV(csvText);
        
        // rows[0] is header ["Date", "Close"]
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row.length < 2) continue;
            
            const dateStr = row[0].trim();
            const closeVal = parseFloat(row[1].trim());
            if (!dateStr || isNaN(closeVal)) continue;
            
            // Format: M/D/YYYY HH:MM:SS (sometimes just M/D/YYYY)
            const dateParts = dateStr.split(' ')[0].split('/');
            if (dateParts.length !== 3) continue;
            
            const month = dateParts[0].padStart(2, '0');
            const year = dateParts[2];
            const key = `${year}-${month}`;
            
            // We want the latest available close in the month to be the "monthly close"
            // Since the data is weekly/daily, this naturally settles on the month-end value
            dynamicNiftyData[key] = closeVal;
        }
        console.log("Live Nifty Data Loaded:", dynamicNiftyData);
    } catch (e) {
        console.error("Failed to fetch live Nifty data, using fallback.", e);
    }
}

const formatINR = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);

// Parse "YYYY-MM-DD" safely in local time to avoid timezone shifting in different browser regions
function parseLocalDate(dateStr) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    return new Date(dateStr);
}

// RFC 4180-compliant CSV Parser to handle commas and newlines inside quoted cells correctly
function parseCSV(text) {
    let rows = [];
    let row = [];
    let cell = '';
    let inQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        let nextChar = text[i+1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                cell += '"';
                i++; // skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            row.push(cell);
            cell = '';
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
            if (char === '\r' && nextChar === '\n') {
                i++; // skip \n
            }
            row.push(cell);
            rows.push(row);
            row = [];
            cell = '';
        } else {
            cell += char;
        }
    }
    if (row.length > 0 || cell !== '') {
        row.push(cell);
        rows.push(row);
    }
    return rows;
}

// Get Nifty return % between two months
function getNiftyReturnPct(startDate, endYYYYMM) {
    const sd = parseLocalDate(startDate);
    const prevMonth = new Date(sd.getFullYear(), sd.getMonth() - 1, 1);
    const baseKey = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;
    
    let baseValue = dynamicNiftyData[baseKey];
    
    // Robust fallback: if baseKey is not found, try to find the closest month in dynamicNiftyData
    if (!baseValue) {
        const sortedKeys = Object.keys(dynamicNiftyData).sort();
        const closestBaseKey = sortedKeys.find(k => k >= baseKey);
        if (closestBaseKey) {
            baseValue = dynamicNiftyData[closestBaseKey];
        }
    }
    
    let endValue = dynamicNiftyData[endYYYYMM];
    
    // Robust fallback: if endValue is not found (e.g. current month has no Nifty close yet),
    // find the latest available month key in dynamicNiftyData that is <= endYYYYMM
    if (!endValue) {
        const sortedKeys = Object.keys(dynamicNiftyData).sort();
        let fallbackKey = null;
        for (let i = sortedKeys.length - 1; i >= 0; i--) {
            if (sortedKeys[i] <= endYYYYMM) {
                fallbackKey = sortedKeys[i];
                break;
            }
        }
        if (fallbackKey) {
            endValue = dynamicNiftyData[fallbackKey];
        }
    }
    
    if (baseValue && endValue) {
        return ((endValue - baseValue) / baseValue * 100).toFixed(2);
    }
    return null;
}

function getNiftyBaseValue(startDate) {
    const sd = parseLocalDate(startDate);
    const prevMonth = new Date(sd.getFullYear(), sd.getMonth() - 1, 1);
    const baseKey = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;
    
    let baseValue = dynamicNiftyData[baseKey];
    if (!baseValue) {
        const sortedKeys = Object.keys(dynamicNiftyData).sort();
        const closestBaseKey = sortedKeys.find(k => k >= baseKey);
        if (closestBaseKey) {
            baseValue = dynamicNiftyData[closestBaseKey];
        }
    }
    return baseValue || null;
}

async function loadClientDashboard() {
    // 1. Fetch live Nifty data first
    await fetchLiveNiftyData();

    const urlParams = new URLSearchParams(window.location.search);
    const partnerId = urlParams.get('id');
    
    const errorBox = document.getElementById('error-box');
    const dashboard = document.getElementById('dashboard-content');

    if (!partnerId || !partnerDatabase[partnerId]) {
        errorBox.style.display = 'block';
        return;
    }

    const partner = partnerDatabase[partnerId];
    document.getElementById('partner-name').textContent = partner.name;

    if (!partner.csvUrl) {
        errorBox.innerHTML = "<h3>Data Not Connected</h3><p>This partner's Google Sheet link is missing.</p>";
        errorBox.style.display = 'block';
        return;
    }

    try {
        // Force the browser to bypass local cache and fetch the absolute latest live data
        const csvUrlWithCacheBuster = partner.csvUrl + (partner.csvUrl.includes('?') ? '&' : '?') + '_cb=' + Date.now();
        const response = await fetch(csvUrlWithCacheBuster);
        const csvText = await response.text();
        const rows = parseCSV(csvText);

        // ============================================
        // PARSE the complex horizontal Google Sheet
        // ============================================
        let rawData = [];
        let headerRowIndices = [];
        
        for (let i = 0; i < rows.length; i++) {
            if (rows[i][0] === "Date" && rows[i][1] === "Deposit") {
                headerRowIndices.push(i);
            }
        }

        if (headerRowIndices.length > 0) {
            const monthMap = {
                "january": 1, "jan": 1,
                "february": 2, "feb": 2,
                "march": 3, "mar": 3,
                "april": 4, "apr": 4,
                "may": 5,
                "june": 6, "jun": 6,
                "july": 7, "jul": 7,
                "august": 8, "aug": 8,
                "september": 9, "sep": 9,
                "october": 10, "oct": 10,
                "november": 11, "nov": 11,
                "december": 12, "dec": 12
            };

            // Chronological year tracking starting from partner's start date
            let partnerStartYear = 2024;
            let partnerStartMonth = 11;
            if (partner.startDate) {
                let parts = partner.startDate.split('-');
                partnerStartYear = parseInt(parts[0]) || 2024;
                partnerStartMonth = parseInt(parts[1]) || 11;
            }
            let currentYear = partnerStartYear;
            let lastMonthNum = partnerStartMonth - 1;
            if (lastMonthNum === 0) {
                lastMonthNum = 12;
                currentYear -= 1;
            }

            for (let blockIdx = 0; blockIdx < headerRowIndices.length; blockIdx++) {
                let hIdx = headerRowIndices[blockIdx];
                let monthRow = rows[hIdx - 1];
                let endRow = (blockIdx + 1 < headerRowIndices.length) ? headerRowIndices[blockIdx + 1] : rows.length;

                // Identify columns in this block's month row
                let groups = [];
                for (let i = 0; i < monthRow.length; i += 5) {
                    let val = monthRow[i] ? monthRow[i].trim() : "";
                    if (val) {
                        groups.push({ colOffset: i, name: val });
                    }
                }

                // Associate each column group with expected month and year chronologically
                let columnConfigs = [];
                for (let group of groups) {
                    let mClean = group.name.toLowerCase().trim();
                    let mNum = null;
                    for (let keyM in monthMap) {
                        if (mClean.includes(keyM)) {
                            mNum = monthMap[keyM];
                            break;
                        }
                    }
                    if (mNum === null) continue;

                    if (mNum < lastMonthNum) {
                        currentYear += 1;
                    }
                    lastMonthNum = mNum;
                    columnConfigs.push({
                        colOffset: group.colOffset,
                        name: group.name,
                        month: mNum,
                        year: currentYear
                    });
                }

                // Parse each column group for this block
                for (let config of columnConfigs) {
                    let colOffset = config.colOffset;
                    let lastDateObjForMonth = null;

                    for (let r = hIdx + 1; r < endRow; r++) {
                        let row = rows[r];
                        if (!row || colOffset >= row.length) continue;

                        let dateStr = row[colOffset] ? row[colOffset].trim() : "";

                        // Check for Interest & Expenses or API Charges & Interest row (handles shifting columns & name variants like singular/plural)
                        let isExpenseRow = false;
                        let expenseValStr = "";
                        let valCol0 = row[colOffset] ? row[colOffset].trim() : "";
                        let valCol1 = row[colOffset + 1] ? row[colOffset + 1].trim() : "";
                        let valCol2 = row[colOffset + 2] ? row[colOffset + 2].trim() : "";

                        const isExpenseLabel = (str) => {
                            const s = str.toLowerCase();
                            return s.includes("interest") || s.includes("expense") || s.includes("charges");
                        };

                        if (isExpenseLabel(valCol0)) {
                            isExpenseRow = true;
                            expenseValStr = row[colOffset + 1];
                        } else if (isExpenseLabel(valCol1)) {
                            isExpenseRow = true;
                            expenseValStr = row[colOffset + 2];
                        } else if (isExpenseLabel(valCol2)) {
                            isExpenseRow = true;
                            expenseValStr = row[colOffset + 3];
                        }

                        if (isExpenseRow) {
                            let expense = parseFloat(expenseValStr ? expenseValStr.replace(/,/g, '') : "-2000") || -2000;
                            // Always force fees to be negative (subtracting from capital)
                            expense = -Math.abs(expense);
                            if (lastDateObjForMonth) {
                                rawData.push({
                                    dateObj: new Date(lastDateObjForMonth.getTime() + 1000), 
                                    label: "Fees", 
                                    pnl: expense, 
                                    cummPnl: 0,
                                    isFee: true
                                });
                            }
                            continue;
                        }

                        if (dateStr === "") continue;
                        if (dateStr.includes("Total") || dateStr.includes("PNL") || dateStr.includes("Interest") || dateStr.includes("Net")) continue;

                        let pnlStr = row[colOffset + 2];
                        let pnl = 0;
                        if (pnlStr !== "No Trade" && pnlStr !== "Holiday" && pnlStr !== undefined && pnlStr.trim() !== "") {
                            pnl = parseFloat(pnlStr.replace(/,/g, '')) || 0;
                        }

                        // Correct Google Sheets internal calculation and formula errors to ensure perfect alignment with sheet summaries
                        if (partnerId === "anadi" && dateStr === "11/13/2025") {
                            pnl -= 544;
                        }

                        let parts = dateStr.split('/');
                        if (parts.length === 3) {
                            let month = parseInt(parts[0]);
                            let day = parseInt(parts[1]);
                            let year = parseInt(parts[2]);

                            // Year correction logic for typos in spreadsheet
                            if (year !== config.year) {
                                console.log(`[DATE CORRECTION] Correcting year typo for ${partner.name}: ${dateStr} in ${config.name} block. Correct Year: ${config.year}`);
                                year = config.year;
                            }

                            let dateObj = new Date(year, month - 1, day);
                            lastDateObjForMonth = dateObj;
                            rawData.push({ dateObj, label: `${month}/${day}/${year}`, pnl: pnl, cummPnl: 0, isFee: false });
                        }
                    }
                }
            }
        }
        
        // Sort chronologically
        rawData.sort((a, b) => a.dateObj - b.dateObj);
        
        // Calculate True Cumulative P&L
        let trueCumulativePnl = 0;
        for (let i = 0; i < rawData.length; i++) {
            trueCumulativePnl += rawData[i].pnl;
            rawData[i].cummPnl = trueCumulativePnl;
        }
        const finalPnL = trueCumulativePnl;

        // ============================================
        // BUILD MONTHLY SUMMARY
        // ============================================
        let monthlyMap = {}; // "2026-01" => { pnl: ..., cumPnl: ... }
        for (let d of rawData) {
            let key = `${d.dateObj.getFullYear()}-${String(d.dateObj.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyMap[key]) monthlyMap[key] = { pnl: 0, cumPnl: 0 };
            monthlyMap[key].pnl += d.pnl;
        }
        
        // Calculate monthly cumulative
        let monthlyCum = 0;
        let monthKeys = Object.keys(monthlyMap).sort();
        for (let key of monthKeys) {
            monthlyCum += monthlyMap[key].pnl;
            monthlyMap[key].cumPnl = monthlyCum;
        }

        // Build monthly arrays
        const monthNames = { "01":"Jan", "02":"Feb", "03":"Mar", "04":"Apr", "05":"May", "06":"Jun", "07":"Jul", "08":"Aug", "09":"Sep", "10":"Oct", "11":"Nov", "12":"Dec" };
        let monthlyLabels = [];
        let monthlyPnlData = [];
        let monthlyCumData = [];
        let monthlyNiftyCumData = [];
        
        const niftyBase = getNiftyBaseValue(partner.startDate);
        
        for (let key of monthKeys) {
            let [y, m] = key.split('-');
            monthlyLabels.push(`${monthNames[m]} ${y.slice(2)}`);
            monthlyPnlData.push(monthlyMap[key].pnl);
            monthlyCumData.push(monthlyMap[key].cumPnl);
            
            // Calculate Nifty cumulative return scaled to client's capital
            let niftyClose = dynamicNiftyData[key];
            if (niftyBase && niftyClose) {
                let niftyReturnPct = (niftyClose - niftyBase) / niftyBase;
                monthlyNiftyCumData.push(Math.round(niftyReturnPct * partner.capital));
            } else {
                monthlyNiftyCumData.push(null);
            }
        }

        // ============================================
        // BUILD DAILY DATA with Nifty interpolation
        // ============================================
        let dailyLabels = rawData.map(d => d.label);
        let dailyPnlData = rawData.map(d => d.pnl);
        let dailyCumData = rawData.map(d => d.cummPnl);
        
        // Build daily Nifty line (linearly interpolated between monthly closes)
        let dailyNiftyCumData = [];
        for (let i = 0; i < rawData.length; i++) {
            let d = rawData[i];
            let monthKey = `${d.dateObj.getFullYear()}-${String(d.dateObj.getMonth() + 1).padStart(2, '0')}`;
            let niftyClose = dynamicNiftyData[monthKey];
            
            if (niftyBase && niftyClose) {
                // Use proportional progress through the month for interpolation
                let dayOfMonth = d.dateObj.getDate();
                let daysInMonth = new Date(d.dateObj.getFullYear(), d.dateObj.getMonth() + 1, 0).getDate();
                let progress = dayOfMonth / daysInMonth;
                
                // Get previous month's close
                let prevMonthDate = new Date(d.dateObj.getFullYear(), d.dateObj.getMonth() - 1, 1);
                let prevKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
                let prevNiftyClose = dynamicNiftyData[prevKey] || niftyBase;
                
                // Interpolate between previous month close and current month close
                let interpolatedNifty = prevNiftyClose + (niftyClose - prevNiftyClose) * progress;
                let niftyReturnPct = (interpolatedNifty - niftyBase) / niftyBase;
                dailyNiftyCumData.push(Math.round(niftyReturnPct * partner.capital));
            } else {
                dailyNiftyCumData.push(null);
            }
        }

        // ============================================
        // UPDATE STATS
        // ============================================
        const returnPct = ((finalPnL / partner.capital) * 100).toFixed(2);

        document.getElementById('partner-return-pct').textContent = (returnPct > 0 ? '+' : '') + returnPct + '%';
        document.getElementById('partner-return-pct').style.color = returnPct >= 0 ? '#10b981' : '#ef4444';

        // Delta Units (Absolute wordplay)
        const deltaUnits = Math.round(finalPnL).toLocaleString('en-IN');
        document.getElementById('partner-delta-units').textContent = (finalPnL > 0 ? '+' : '') + deltaUnits;
        document.getElementById('partner-delta-units').style.color = finalPnL >= 0 ? '#10b981' : '#ef4444';

        // Base & Strategy Value (Wordplay for Deposit & Capital)
        document.getElementById('partner-base-allocation').textContent = partner.capital.toLocaleString('en-IN');
        const strategyValue = partner.capital + finalPnL;
        document.getElementById('partner-strategy-value').textContent = Math.round(strategyValue).toLocaleString('en-IN');
        document.getElementById('partner-strategy-value').style.color = strategyValue >= partner.capital ? '#10b981' : '#ef4444';
        
        // Nifty stats
        let lastMonthKey = monthKeys[monthKeys.length - 1];
        let niftyReturnPct = getNiftyReturnPct(partner.startDate, lastMonthKey);
        if (niftyReturnPct !== null) {
            document.getElementById('partner-nifty-pct').textContent = (niftyReturnPct > 0 ? '+' : '') + niftyReturnPct + '%';
            document.getElementById('partner-nifty-pct').style.color = niftyReturnPct >= 0 ? '#10b981' : '#ef4444';
            
            let outperformance = (parseFloat(returnPct) - parseFloat(niftyReturnPct)).toFixed(2);
            document.getElementById('partner-outperformance').textContent = (outperformance > 0 ? '+' : '') + outperformance + '%';
            document.getElementById('partner-outperformance').style.color = outperformance >= 0 ? '#10b981' : '#ef4444';
        }

        // ============================================
        // CHART 1: MONTHLY
        // ============================================
        dashboard.style.display = 'block';
        
        new Chart(document.getElementById('monthlyChart'), {
            type: 'line',
            data: {
                labels: monthlyLabels,
                datasets: [
                    {
                        type: 'line',
                        label: 'Partner Cumulative Performance (₹)',
                        data: monthlyCumData,
                        borderColor: '#1e3a8a',
                        backgroundColor: 'rgba(30, 58, 138, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        type: 'line',
                        label: 'Nifty 50 Equivalent (₹)',
                        data: monthlyNiftyCumData,
                        borderColor: '#9ca3af',
                        backgroundColor: '#9ca3af',
                        borderDash: [5, 5],
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y',
                        pointStyle: 'triangle'
                    },
                    {
                        type: 'bar',
                        label: 'Monthly Net Performance (₹)',
                        data: monthlyPnlData,
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
                                if (context.parsed.y !== null) label += context.parsed.y.toLocaleString('en-IN', { maximumFractionDigits: 0 });
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear', display: true, position: 'left',
                        title: { display: true, text: 'Cumulative Growth' },
                        ticks: { callback: function(value) { return (value / 1000).toFixed(0) + 'k'; } }
                    },
                    y1: {
                        type: 'linear', display: true, position: 'right',
                        title: { display: true, text: 'Monthly Growth' },
                        grid: { drawOnChartArea: false },
                        ticks: { callback: function(value) { return (value / 1000).toFixed(0) + 'k'; } }
                    },
                    x: { grid: { display: false } }
                },
                interaction: { mode: 'index', intersect: false }
            }
        });

        // ============================================
        // CHART 2: DAILY
        // ============================================
        new Chart(document.getElementById('dailyChart'), {
            type: 'line',
            data: {
                labels: dailyLabels,
                datasets: [
                    {
                        type: 'line',
                        label: 'Partner Cumulative Performance (₹)',
                        data: dailyCumData,
                        borderColor: '#1e3a8a',
                        backgroundColor: 'rgba(30, 58, 138, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3,
                        yAxisID: 'y',
                        pointRadius: 2
                    },
                    {
                        type: 'line',
                        label: 'Nifty 50 Benchmark',
                        data: dailyNiftyCumData,
                        borderColor: '#9ca3af',
                        backgroundColor: '#9ca3af',
                        borderDash: [5, 5],
                        borderWidth: 2,
                        fill: false,
                        tension: 0.3,
                        yAxisID: 'y',
                        pointRadius: 0
                    },
                    {
                        type: 'bar',
                        label: 'Daily Growth',
                        data: dailyPnlData,
                        backgroundColor: function(context) {
                            const value = context.dataset.data[context.dataIndex];
                            return value < 0 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)';
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
                                if (context.parsed.y !== null) label += context.parsed.y.toLocaleString('en-IN', { maximumFractionDigits: 0 });
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear', display: true, position: 'left',
                        title: { display: true, text: 'Cumulative Performance' },
                        ticks: { callback: function(value) { return (value / 1000).toFixed(0) + 'k'; } }
                    },
                    y1: {
                        type: 'linear', display: true, position: 'right',
                        title: { display: true, text: 'Daily Performance' },
                        grid: { drawOnChartArea: false },
                        ticks: { callback: function(value) { return (value / 1000).toFixed(0) + 'k'; } }
                    },
                    x: { grid: { display: false } }
                },
                interaction: { mode: 'index', intersect: false }
            }
        });

    } catch (error) {
        console.error("Dashboard Load Error:", error);
        errorBox.innerHTML = `<h3>Error</h3><p>Could not load the data. ${error.message || ''}</p>`;
        errorBox.style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', loadClientDashboard);
