// Global Helper: Toast Notification System
window.showToast = function(message, type = 'success', duration = 4000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'warning') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('active'), 10);

    // Auto remove
    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => toast.remove(), 300);
    }, duration);
};

// Global Helper: Theme Management
const initTheme = () => {
    const savedTheme = localStorage.getItem('smartcity_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const updateToggleIcon = () => {
        const toggle = document.querySelector('.theme-toggle i');
        if (toggle) {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            toggle.className = currentTheme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        }
    };

    // Use event delegation for theme toggle
    document.addEventListener('click', (e) => {
        const toggle = e.target.closest('.theme-toggle');
        if (toggle) {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('smartcity_theme', newTheme);
            updateToggleIcon();
            
            window.showToast(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} Mode Enabled`, 'success', 2000);
        }
    });

    updateToggleIcon();
};

document.addEventListener('DOMContentLoaded', () => {
    initTheme();

    // LOAD ADMIN EDITS FIRST (so event listeners bind correctly)
    let pageName = window.location.pathname.split('/').pop() || 'index.html';
    if (pageName === '') pageName = 'index.html'; // Fallback for root
    const pageKey = 'smartcity_saved_' + pageName;
    
    const savedContent = localStorage.getItem(pageKey);
    if (savedContent) {
        const nav = document.querySelector('nav.navbar');
        const footer = document.querySelector('footer.footer');
        
        if (nav && footer) {
            // Remove current elements between nav and footer
            let el = nav.nextElementSibling;
            while (el && el !== footer) {
                const next = el.nextElementSibling;
                if (el.tagName !== 'SCRIPT' && !el.classList?.contains('modal-overlay')) {
                    el.remove();
                }
                el = next;
            }
            // Insert saved content
            nav.insertAdjacentHTML('afterend', savedContent);
        }
    }

    const userRole = sessionStorage.getItem('role');
    
    // Hide all links to dashboard.html if not admin
    const adminLinks = document.querySelectorAll('a[href="dashboard.html"]');
    adminLinks.forEach(link => {
        if (userRole !== 'admin') {
            link.style.display = 'none';
        }
    });

    // Protect Dashboard page
    if (window.location.pathname.endsWith('dashboard.html') && userRole !== 'admin') {
        window.location.href = 'login.html';
    }

    // Handle Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.removeAttribute('action');
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Explicit check for admin login credentials
            if (username.toLowerCase() === 'admin' && password === 'admin123') {
                sessionStorage.setItem('role', 'admin');
                window.location.href = 'dashboard.html?login=success';
            } else {
                sessionStorage.setItem('role', 'user');
                window.location.href = 'index.html';
            }
        });
    }

    // Handle Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Just sign them in as a regular user
            sessionStorage.setItem('role', 'user');
            window.location.href = 'index.html';
        });
    }

    // Toggle Login/Logout buttons
    const loginBtns = document.querySelectorAll('a[href="login.html"]');
    loginBtns.forEach(btn => {
        if (userRole === 'admin' || userRole === 'user') {
            btn.innerText = 'Logout';
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                sessionStorage.removeItem('role');
                window.location.href = 'login.html';
            });
        }
    });

    // Mobile Navbar Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Set Active Link in Navbar based on current URL
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-links a');
    
    navItems.forEach(link => {
        const linkPath = link.getAttribute('href');
        // Simple match, assuming flat structure like /index.html
        if (currentPath.endsWith(linkPath) || (currentPath.endsWith('/') && linkPath === 'index.html')) {
            link.classList.add('active');
        }
    });

    // Number Counter Animation
    const counters = document.querySelectorAll('.counter-num');
    
    if (counters.length > 0) {
        const speed = 200; // The lower the slower

        const runCounter = () => {
            counters.forEach(counter => {
                const updateCount = () => {
                    const target = +counter.getAttribute('data-target');
                    const count = +counter.innerText.replace(/,/g, '');
                    const inc = target / speed;

                    if (count < target) {
                        counter.innerText = Math.ceil(count + inc).toLocaleString();
                        setTimeout(updateCount, 10);
                    } else {
                        counter.innerText = target.toLocaleString() + (counter.getAttribute('data-plus') ? '+' : '');
                    }
                };
                updateCount();
            });
        };

        // Use Intersection Observer to run counter when in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    runCounter();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => {
            observer.observe(counter);
        });
    }

    // Password Visibility Toggle
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            }
        });
    });

    // Form Submission and Success Popups
    const genericForms = document.querySelectorAll('form[data-success-popup]');
    
    genericForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // Basic validation check
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const modalId = form.getAttribute('data-success-popup');
            const modal = document.getElementById(modalId);
            
            if (modal) {
                // Persistent data logic for complaints
                if (form.id === 'complaintForm') {
                    // MongoDB API persistence for complaints
                    const complaintData = {
                        id: 'CMP-' + Math.floor(1000 + Math.random() * 9000),
                        name: document.getElementById('fullName').value,
                        type: document.getElementById('complaintType').value,
                        area: document.getElementById('ward').value,
                        description: document.getElementById('description').value,
                        status: 'Pending',
                        date: new Date().toLocaleDateString()
                    };
                    
                    // Save to MongoDB
                    fetch('http://localhost:5000/api/complaints', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(complaintData)
                    })
                    .then(res => res.json())
                    .then(data => {
                        console.log('Saved to DB:', data);
                        window.showToast('Complaint Saved to Database', 'success');
                        
                        // Update reference ID in modal if it exists
                        const refIdEl = modal.querySelector('strong');
                        if (refIdEl) refIdEl.innerText = complaintData.id;
                    })
                    .catch(err => {
                        console.error('DB Save Error:', err);
                        window.showToast('Error saving to database. using fallback.', 'warning');
                        // Fallback to localStorage if server is down
                        const existing = JSON.parse(localStorage.getItem('smartcity_complaints') || '[]');
                        existing.push(complaintData);
                        localStorage.setItem('smartcity_complaints', JSON.stringify(existing));
                    });
                }

                // Persistent data logic for Bills
                if (form.id === 'billForm') {
                    const billData = {
                        id: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
                        type: document.getElementById('billType')?.value || 'General',
                        amount: parseFloat(document.getElementById('amount')?.value || 0),
                        date: new Date()
                    };

                    fetch('http://localhost:5000/api/bills', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(billData)
                    })
                    .then(res => res.json())
                    .then(data => {
                        console.log('Bill Paid and Saved to DB:', data);
                        window.showToast('Payment Successful & Recorded', 'success');
                    })
                    .catch(err => {
                        console.error('Bill Save Error:', err);
                        window.showToast('Payment successful (Offline Mode)', 'info');
                    });
                }

                modal.classList.add('active');
                
                // Add close functionality to modal buttons
                const closeBtn = modal.querySelector('.modal-close-btn');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        modal.classList.remove('active');
                        form.reset();
                    });
                }
            }
        });
    });

    // --- ADMIN EDIT MODE LOGIC ---
    if (userRole === 'admin') {
        let isEditMode = false;
        
        // Create Admin Toggle Button
        const toggleBtn = document.createElement('div');
        toggleBtn.className = 'admin-edit-toggle';
        toggleBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Enable Edit Mode';
        document.body.appendChild(toggleBtn);
        
        toggleBtn.addEventListener('click', () => {
            isEditMode = !isEditMode;
            document.body.classList.toggle('edit-mode-active', isEditMode);
            
            if (isEditMode) {
                toggleBtn.innerHTML = '<i class="fa-solid fa-save"></i> Save Changes';
                toggleBtn.style.background = '#10b981'; // Success green
                enableEditMode();
            } else {
                toggleBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Enable Edit Mode';
                toggleBtn.style.background = '';
                saveChanges();
            }
        });

        function enableEditMode() {
            // Make text editable - Broadened to include specific card titles and details
            const textElements = document.querySelectorAll('h1, h2, h3, h4, p, .parking-title, .parking-distance, .alert-title, .text-success, .text-danger, span:not(.devsecops-badge)');
            textElements.forEach(el => {
                // Don't make navbar or footer links editable here
                if (!el.closest('.navbar') && !el.closest('.footer') && !el.closest('.btn')) {
                    el.setAttribute('contenteditable', 'true');
                }
            });

            // Add delete buttons to cards
            const cards = document.querySelectorAll('.card, .service-card, .stat-card, .chart-card, .parking-card, .info-card');
            cards.forEach(card => {
                if (!card.querySelector('.admin-delete-btn')) {
                    const delBtn = document.createElement('button');
                    delBtn.className = 'admin-delete-btn';
                    delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
                    delBtn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if(confirm('Delete this element?')) {
                            card.remove();
                        }
                    };
                    card.appendChild(delBtn);
                }
            });
            
            // Add "Add Item" buttons to grids
            const grids = document.querySelectorAll('.services-grid, .stats-grid, .parking-grid, .traffic-grid');
            grids.forEach(grid => {
                if (!grid.querySelector('.admin-add-btn')) {
                    const addBtn = document.createElement('div');
                    addBtn.className = 'admin-add-btn';
                    addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add New Item';
                    addBtn.onclick = () => {
                        // Clone the first child that isn't the add button
                        const template = Array.from(grid.children).find(child => !child.classList.contains('admin-add-btn'));
                        if (template) {
                            const clone = template.cloneNode(true);
                            
                            // Initialize clone for editing
                            clone.querySelectorAll('h1, h2, h3, h4, p, .parking-title, .parking-distance, .alert-title, .text-success, .text-danger, span:not(.devsecops-badge)').forEach(el => {
                                el.setAttribute('contenteditable', 'true');
                            });
                            
                            // Add delete button to clone
                            if (!clone.querySelector('.admin-delete-btn')) {
                                const delBtn = document.createElement('button');
                                delBtn.className = 'admin-delete-btn';
                                delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
                                delBtn.onclick = (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if(confirm('Delete this element?')) {
                                        clone.remove();
                                    }
                                };
                                clone.appendChild(delBtn);
                            }
                            
                            grid.insertBefore(clone, addBtn);
                            clone.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            window.showToast('New item added! Click any text to edit.', 'success');
                        } else {
                            window.showToast('No template found to clone!', 'error');
                        }
                    };
                    grid.appendChild(addBtn);
                }
            });
        }

        function saveChanges() {
            // Remove edit UI
            document.querySelectorAll('[contenteditable="true"]').forEach(el => el.removeAttribute('contenteditable'));
            document.querySelectorAll('.admin-delete-btn, .admin-add-btn').forEach(el => el.remove());
            
            // Extract HTML between nav and footer
            const nav = document.querySelector('nav.navbar');
            const footer = document.querySelector('footer.footer');
            
            let htmlToSave = '';
            let el = nav.nextElementSibling;
            while (el && el !== footer) {
                if (el.tagName !== 'SCRIPT' && !el.classList?.contains('modal-overlay') && !el.classList?.contains('admin-edit-toggle')) {
                    htmlToSave += el.outerHTML;
                }
                el = el.nextElementSibling;
            }
            
            // Save to localStorage
            localStorage.setItem(pageKey, htmlToSave);
            
            // Show success alert
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
            alertDiv.innerHTML = '<i class="fa-solid fa-check-circle" style="margin-right:8px;"></i> Changes Saved Successfully!';
            document.body.appendChild(alertDiv);
            
            setTimeout(() => alertDiv.remove(), 3000);
        }
    }

    // Counter Animation & Real-time Parking Sync
    const initCounters = async () => {
        const counters = document.querySelectorAll('.counter-num');
        const realTimeParking = localStorage.getItem('smartcity_available_parking');
        
        // Fetch real complaints count from MongoDB
        let realComplaintsCount = 0;
        let realBillsCount = 0;
        try {
            const [complaintsRes, billsRes] = await Promise.all([
                fetch('http://localhost:5000/api/complaints'),
                fetch('http://localhost:5000/api/bills/stats')
            ]);
            
            const complaintsData = await complaintsRes.json();
            const billsData = await billsRes.json();
            
            realComplaintsCount = complaintsData.length;
            realBillsCount = billsData.count;
        } catch (err) {
            console.error('Error fetching statistics:', err);
        }

        counters.forEach(counter => {
            const label = counter.nextElementSibling?.innerText || '';
            let target = +counter.getAttribute('data-target');
            
            // If this is the parking counter and we have real-time data, use it
            if (label.includes('Parking Slots') && realTimeParking) {
                target = parseInt(realTimeParking);
                counter.setAttribute('data-target', target);
            }
            
            // If this is the complaints counter
            if (label.includes('Complaints Resolved') && realComplaintsCount > 0) {
                target = 15420 + realComplaintsCount; 
                counter.setAttribute('data-target', target);
            }

            // If this is the bills counter
            if (label.includes('Bills Paid Today') && realBillsCount > 0) {
                target = realBillsCount;
                counter.setAttribute('data-target', target);
            }

            const updateCount = () => {
                const countText = counter.innerText.replace(/,/g, '').replace('+', '');
                const count = isNaN(parseInt(countText)) ? 0 : parseInt(countText);
                const speed = 100; // Adjust for speed
                const inc = Math.max(1, target / speed);
                
                if (count < target) {
                    counter.innerText = Math.ceil(count + inc).toLocaleString();
                    setTimeout(updateCount, 20);
                } else {
                    counter.innerText = target.toLocaleString() + (counter.getAttribute('data-plus') ? '+' : '');
                }
            };
            updateCount();
        });
    };

    if (document.querySelector('.counter-num')) {
        initCounters();
    }
});
