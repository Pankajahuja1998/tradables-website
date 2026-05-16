// Navbar scroll effect
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle (basic implementation)
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    // Basic toggle for mobile - in a real app, you'd animate this properly
    if (navLinks.style.display === 'flex') {
        navLinks.style.display = 'none';
    } else {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = 'rgba(255, 255, 255, 0.95)';
        navLinks.style.padding = '2rem 0';
        navLinks.style.borderBottom = '1px solid rgba(255, 255, 255, 0.08)';
        navLinks.style.backdropFilter = 'blur(12px)';
    }
});

// Form is handled by FormSubmit.co — no JS needed

// Chart.js Performance Benchmark
const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRwFWLZUJVjdm7ftMb2NZ3ceheF-nqOQynDJnCCZUAPir83aJc__pDEgqEZEH8GcGwZDdMkP9bjf7eh/pub?gid=0&single=true&output=csv";

async function renderPerformanceChart() {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;

    let labels = ['Nov 24', 'Dec 24', 'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25', 'Jul 25', 'Aug 25', 'Sep 25', 'Oct 25', 'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26'];
    let cumulativeData = [52665, 143169, 156517, 219963, 235835, 223478, 307998, 320843, 352496, 432979, 493106, 445239, 510080, 559851, 589015, 611352, 596852];
    let niftyData = [10000, 20000, 15000, 35000, 50000, 45000, 75000, 95000, 105000, 90000, 125000, 140000, 155000, 180000, 195000, 210000, 200000];
    let monthlyData = [52665, 90504, 13348, 63446, 15872, -12357, 84520, 12845, 31653, 80483, 60127, -47867, 64841, 49771, 29164, 22337, -14500];

    if (GOOGLE_SHEET_CSV_URL) {
        try {
            const response = await fetch(GOOGLE_SHEET_CSV_URL);
            const csvText = await response.text();

            const rows = csvText.split('\n').map(row => row.split(','));

            if (rows.length > 1) {
                labels = [];
                monthlyData = [];
                cumulativeData = [];
                niftyData = [];

                for (let i = 1; i < rows.length; i++) {
                    if (!rows[i][0]) continue;
                    labels.push(rows[i][0].trim());
                    monthlyData.push(parseFloat(rows[i][1]) || 0);
                    cumulativeData.push(parseFloat(rows[i][2]) || 0);
                    niftyData.push(parseFloat(rows[i][3]) || 0);
                }
            }
        } catch (error) {
            console.error("Failed to load Google Sheet data, using fallback data.", error);
        }
    }
    // Update HTML Stats dynamically based on the final data
    if (cumulativeData.length > 0) {
        const lastTradables = cumulativeData[cumulativeData.length - 1];
        const lastNifty = niftyData[niftyData.length - 1];
        const baseCapital = 1000000; // 10 Lacs base
        
        const tradablesPct = ((lastTradables / baseCapital) * 100).toFixed(2);
        const niftyPct = ((lastNifty / baseCapital) * 100).toFixed(2);
        const outperformance = (tradablesPct - niftyPct).toFixed(2);
        
        const formatINR = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);

        const elOutval = document.getElementById('outperformance-val');
        if (elOutval) elOutval.textContent = (outperformance > 0 ? '+' : '') + outperformance + '%';
        
        const elTradPct = document.getElementById('tradables-return-pct');
        if (elTradPct) elTradPct.textContent = tradablesPct + '%';
        
        const elTradAbs = document.getElementById('tradables-return-abs');
        if (elTradAbs) elTradAbs.textContent = formatINR(lastTradables);
        
        const elNiftyPct = document.getElementById('nifty-return-pct');
        if (elNiftyPct) elNiftyPct.textContent = niftyPct + '%';
        
        const elNiftyAbs = document.getElementById('nifty-return-abs');
        if (elNiftyAbs) elNiftyAbs.textContent = formatINR(lastNifty);
    }

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
                    type: 'line',
                    label: 'Nifty 50 (₹10L Base)',
                    data: niftyData,
                    borderColor: '#9ca3af',
                    backgroundColor: '#9ca3af',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    type: 'bar',
                    label: 'Monthly P&L (₹)',
                    data: monthlyData,
                    backgroundColor: function (context) {
                        const value = context.dataset.data[context.dataIndex];
                        return value < 0 ? 'rgba(239, 68, 68, 0.5)' : 'rgba(16, 185, 129, 0.5)';
                    },
                    borderColor: function (context) {
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
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: { family: "'Outfit', sans-serif" }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Cumulative P&L'
                    },
                    ticks: {
                        callback: function (value) {
                            return '₹' + (value / 100000).toFixed(1) + 'L';
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Monthly P&L'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        callback: function (value) {
                            return '₹' + (value / 1000).toFixed(0) + 'k';
                        }
                    }
                },
                x: {
                    grid: { display: false }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', renderPerformanceChart);
