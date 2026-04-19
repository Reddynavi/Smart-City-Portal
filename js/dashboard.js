document.addEventListener('DOMContentLoaded', () => {
    // Pie Chart
    const pieCanvas = document.getElementById('pieChart');
    if (pieCanvas) {
        const ctxPie = pieCanvas.getContext('2d');
        new Chart(ctxPie, {
            type: 'doughnut',
            data: {
                labels: ['Garbage', 'Water', 'Road Damage', 'Street Light', 'Other'],
                datasets: [{
                    data: [35, 25, 20, 10, 10],
                    backgroundColor: ['#ef4444', '#3b82f6', '#f59e0b', '#eab308', '#94a3b8'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                },
                cutout: '70%'
            }
        });
    }

    // Bar Chart
    const barCanvas = document.getElementById('barChart');
    if (barCanvas) {
        const ctxBar = barCanvas.getContext('2d');
        new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Payments Collected (in Millions ₹)',
                    data: [4.2, 5.1, 4.8, 6.2, 5.9, 8.4],
                    backgroundColor: '#3b82f6',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // Line Chart
    const lineCanvas = document.getElementById('lineChart');
    if (lineCanvas) {
        const ctxLine = lineCanvas.getContext('2d');
        new Chart(ctxLine, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Visitors',
                    data: [1200, 1900, 1500, 2200, 1800, 2800, 3100],
                    borderColor: '#10b981',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(16, 185, 129, 0.1)'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // Login Success Alert
    if (window.location.search.includes('login=success')) {
        const alertDiv = document.createElement('div');
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.background = '#10b981';
        alertDiv.style.color = 'white';
        alertDiv.style.padding = '15px 25px';
        alertDiv.style.borderRadius = '8px';
        alertDiv.style.zIndex = '10000';
        alertDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        alertDiv.innerHTML = '<i class="fa-solid fa-check-circle" style="margin-right:8px;"></i> Admin Login Successful!';
        document.body.appendChild(alertDiv);
        
        setTimeout(() => alertDiv.remove(), 4000);
        window.history.replaceState({}, document.title, window.location.pathname);
    }




    // Load Complaints from MongoDB
    const loadComplaints = () => {
        const tableBody = document.getElementById('complaintsTableBody');
        if (!tableBody) return;

        // Global function for the onclick handler (now with API)
        window.toggleStatus = async (id, currentStatus) => {
            const newStatus = currentStatus === 'Pending' ? 'Resolved' : 'Pending';
            
            try {
                const res = await fetch(`http://localhost:5000/api/complaints/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });
                
                if (res.ok) {
                    renderTable();
                    updateStats();
                    if (window.showToast) window.showToast(`Updated status for ${id}`, 'success');
                }
            } catch (err) {
                console.error('Update error:', err);
                if (window.showToast) window.showToast("Failed to update status in DB.", "error");
            }
        };

        const renderTable = async () => {
            let dataToRender = [];
            
            try {
                const res = await fetch('http://localhost:5000/api/complaints');
                dataToRender = await res.json();
            } catch (err) {
                console.error('Fetch error:', err);
                // Fallback to demo data
                dataToRender = [
                    { id: '#CMP-1024', name: 'Rahul Sharma', type: 'Garbage', area: 'Ward 4', date: '10/04/2026', status: 'Resolved' },
                    { id: '#CMP-1025', name: 'Priya Patel', type: 'Street Light', area: 'Area 12', date: '11/04/2026', status: 'Pending' }
                ];
            }

            tableBody.innerHTML = '';
            
            dataToRender.forEach(cmp => {
                const row = document.createElement('tr');
                const badgeClass = cmp.status.toLowerCase() === 'resolved' ? 'status-resolved' : 'status-pending';
                const btnText = cmp.status.toLowerCase() === 'resolved' ? 'Reopen' : 'Resolve';
                const btnIcon = cmp.status.toLowerCase() === 'resolved' ? 'fa-rotate-left' : 'fa-check';

                row.innerHTML = `
                    <td>${cmp.id}</td>
                    <td>${cmp.name}</td>
                    <td>${cmp.type.charAt(0).toUpperCase() + cmp.type.slice(1)}</td>
                    <td>${cmp.area}</td>
                    <td>${cmp.date}</td>
                    <td><span class="status-badge ${badgeClass}">${cmp.status}</span></td>
                    <td>
                        <button class="btn ${cmp.status.toLowerCase() === 'resolved' ? 'btn-outline' : 'btn-primary'}" 
                                style="padding: 5px 10px; font-size: 0.7rem; display: flex; align-items: center; gap: 5px;"
                                onclick="toggleStatus('${cmp.id}', '${cmp.status}')">
                            <i class="fa-solid ${btnIcon}"></i> ${btnText}
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        };

        renderTable();
    };

    // Live Security Log Simulation
    const initSecurityLogs = () => {
        const logContainer = document.getElementById('securityLogs');
        if (!logContainer) return;

        const logTypes = [
            { msg: 'User login attempted from 192.168.1.45', type: 'info' },
            { msg: 'Unauthorized access blocked at /admin/config', type: 'warning' },
            { msg: 'System integrity check completed', type: 'success' },
            { msg: 'SQL injection attempt sanitized', type: 'warning' },
            { msg: 'Backup completed successfully', type: 'success' },
            { msg: 'New complaint received and encrypted', type: 'info' },
            { msg: 'SSL certificate validated', type: 'success' }
        ];

        const addLog = () => {
            const log = logTypes[Math.floor(Math.random() * logTypes.length)];
            const time = new Date().toLocaleTimeString();
            
            const logEl = document.createElement('div');
            logEl.className = 'log-entry';
            
            let statusClass = '';
            if (log.type === 'success') statusClass = 'log-success';
            if (log.type === 'warning') statusClass = 'log-warning';

            logEl.innerHTML = `
                <span class="log-time">[${time}]</span>
                <span class="${statusClass}">${log.msg}</span>
            `;

            logContainer.prepend(logEl);

            // Limit logs to 10
            if (logContainer.children.length > 10) {
                logContainer.lastElementChild.remove();
            }
        };

        // Initial logs
        for(let i=0; i<4; i++) setTimeout(addLog, i * 500);
        
        // Random intervals
        const scheduleNext = () => {
            const delay = 2000 + Math.random() * 5000;
            setTimeout(() => {
                addLog();
                scheduleNext();
            }, delay);
        };
        scheduleNext();
    };

    // Update Dashboard Stats with real data
    const updateStats = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/complaints');
            const data = await res.json();
            
            const totalComplaints = data.length;
            const pendingComplaints = data.filter(c => c.status === 'Pending').length;
            const resolvedComplaints = data.filter(c => c.status === 'Resolved').length;

            // Update UI elements
            const stats = document.querySelectorAll('.stat-details h3');
            if (stats.length >= 3) {
                stats[0].innerText = totalComplaints.toLocaleString();
                stats[1].innerText = pendingComplaints.toLocaleString();
                stats[2].innerText = resolvedComplaints.toLocaleString();
            }
        } catch (err) {
            console.error('Stats update error:', err);
        }
    };

    loadComplaints();
    updateStats();
    initSecurityLogs();
});
