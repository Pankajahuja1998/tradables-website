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

// Form submission prevention (demo only)
const form = document.querySelector('.contact-form');
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you for reaching out! We will contact you soon.');
        form.reset();
    });
}

// Chart.js Performance Benchmark
document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('performanceChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Nov 24', 'Dec 24', 'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25', 'Jul 25', 'Aug 25', 'Sep 25', 'Oct 25', 'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26'],
                datasets: [
                    {
                        type: 'line',
                        label: 'Cumulative P&L (₹)',
                        data: [52665, 143169, 156517, 219963, 235835, 223478, 307998, 320843, 352496, 432979, 493106, 445239, 510080, 559851, 589015, 611352, 596852],
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
                        data: [10000, 20000, 15000, 35000, 50000, 45000, 75000, 95000, 105000, 90000, 125000, 140000, 155000, 180000, 195000, 210000, 200000],
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
                        data: [52665, 90504, 13348, 63446, 15872, -12357, 84520, 12845, 31653, 80483, 60127, -47867, 64841, 49771, 29164, 22337, -14500],
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
                            label: function(context) {
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
                            callback: function(value) {
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
                            callback: function(value) {
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
});
