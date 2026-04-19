// Search Logic
document.addEventListener('DOMContentLoaded', () => {
    const parkingSearch = document.getElementById('parkingSearch');
    if (parkingSearch) {
        parkingSearch.addEventListener('input', function(e) {
            const term = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.parking-card');
            
            cards.forEach(card => {
                const title = card.querySelector('.parking-title').innerText.toLowerCase();
                if (title.includes(term)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
    // Helper to update button state based on available slots
    const updateButtonState = (card) => {
        const stats = card.querySelectorAll('.slot-stat span');
        const availableEl = stats[1]; // 0:Total, 1:Available, 2:Occupied
        const btn = card.querySelector('.btn');
        if (!availableEl || !btn) return;

        let available = parseInt(availableEl.innerText || 0);
        
        // Dynamic Color Toggle
        if (available > 0) {
            availableEl.className = 'text-success';
        } else {
            availableEl.className = 'text-danger';
        }

        if (available === 0) {
            btn.innerText = 'Full';
            btn.className = 'btn btn-outline btn-block';
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        } else {
            // Preserve the price if possible
            const priceMatch = btn.innerText.match(/₹\d+/);
            const price = priceMatch ? priceMatch[0] : '₹50';
            btn.innerText = `Book Slot (${price}/hr)`;
            btn.className = 'btn btn-primary btn-block';
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
    };

    // Real-time Slot Simulation
    const simulateSlots = () => {
        // PAUSE SIMULATION IN EDIT MODE to avoid overwriting user changes
        if (document.body.classList.contains('edit-mode-active')) return;

        const cards = document.querySelectorAll('.parking-card');
        cards.forEach(card => {
            const stats = card.querySelectorAll('.slot-stat span');
            const availableEl = stats[1];
            const occupiedEl = stats[2];
            
            if (availableEl && occupiedEl) {
                let available = parseInt(availableEl.innerText || 0);
                let occupied = parseInt(occupiedEl.innerText || 0);
                const total = available + occupied;
                
                // Randomly change slots
                const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
                available = Math.max(0, Math.min(total, available + change));
                occupied = total - available;
                
                availableEl.innerText = available;
                occupiedEl.innerText = occupied;

                updateButtonState(card);
            }
        });
    };

    // Fetch and Render Parking Slots from MongoDB
    const loadParkingSlots = async () => {
        const grid = document.getElementById('parkingGrid');
        if (!grid) return;

        try {
            const res = await fetch('http://localhost:5000/api/parking');
            const slots = await res.json();

            if (slots.length > 0) {
                grid.innerHTML = '';
                slots.forEach(slot => {
                    const card = document.createElement('div');
                    card.className = 'card glass parking-card';
                    card.setAttribute('data-id', slot.id);
                    
                    const isFull = slot.available === 0;
                    const btnClass = isFull ? 'btn btn-outline btn-block' : 'btn btn-primary btn-block';
                    const btnStyle = isFull ? 'opacity: 0.5; cursor: not-allowed;' : '';
                    const btnText = isFull ? 'Full' : `Book Slot (₹${slot.price}/hr)`;
                    const availClass = isFull ? 'text-danger' : 'text-success';

                    card.innerHTML = `
                        <div class="parking-header">
                            <div class="parking-title">${slot.title}</div>
                            <div class="parking-distance"><i class="fa-solid fa-location-arrow"></i> ${slot.distance}</div>
                        </div>
                        <div class="slots-container">
                            <div class="slot-stat">
                                <span style="color: var(--primary-blue);">${slot.total}</span>
                                <p>Total</p>
                            </div>
                            <div class="slot-stat">
                                <span class="${availClass}">${slot.available}</span>
                                <p>Available</p>
                            </div>
                            <div class="slot-stat">
                                <span class="text-danger">${slot.occupied}</span>
                                <p>Occupied</p>
                            </div>
                        </div>
                        <button class="${btnClass}" ${isFull ? 'disabled' : ''} style="${btnStyle}">${btnText}</button>
                    `;
                    grid.appendChild(card);
                });
            }
        } catch (err) {
            console.error('Error loading parking:', err);
            // Fallback to static HTML if API fails
        }
    };

    // Listen for manual edits to update buttons immediately
    const grid = document.getElementById('parkingGrid');
    if (grid) {
        grid.addEventListener('input', (e) => {
            if (e.target.classList.contains('text-success') || e.target.classList.contains('text-danger')) {
                const card = e.target.closest('.parking-card');
                if (card) updateButtonState(card);
            }
        });
    }

    // Booking Button Logic
    if (grid) {
        grid.addEventListener('click', async (e) => {
            const btn = e.target.closest('.btn');
            if (btn && btn.innerText.includes('Book')) {
                // If in Edit Mode, don't trigger booking
                if (document.body.classList.contains('edit-mode-active')) return;

                const card = btn.closest('.parking-card');
                const id = card.getAttribute('data-id');
                const title = card.querySelector('.parking-title').innerText;
                
                // Simulate a decrease in available slots in DB
                const stats = card.querySelectorAll('.slot-stat span');
                let a = parseInt(stats[1].innerText);
                let o = parseInt(stats[2].innerText);
                
                if (a > 0) {
                    try {
                        const res = await fetch(`http://localhost:5000/api/parking/${id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ available: a - 1, occupied: o + 1 })
                        });
                        
                        if (res.ok) {
                            stats[1].innerText = a - 1;
                            stats[2].innerText = o + 1;
                            updateButtonState(card);
                            window.showToast(`Success! Slot booked at ${title}.`, 'success');
                            syncDashboard();
                        }
                    } catch (err) {
                        console.error('Booking error:', err);
                        window.showToast('Booking failed. Try again.', 'error');
                    }
                }
            }
        });
    }

    // Sync with Dashboard (Real-time count of ALL available slots)
    const syncDashboard = () => {
        const availableSlots = document.querySelectorAll('.text-success, .text-danger');
        let total = 0;
        document.querySelectorAll('.parking-card').forEach(card => {
            const avail = parseInt(card.querySelectorAll('.slot-stat span')[1].innerText || 0);
            total += avail;
        });
        localStorage.setItem('smartcity_available_parking', total);
    };

    // Initial load
    loadParkingSlots().then(() => {
        syncDashboard();
        setInterval(() => {
            simulateSlots();
            syncDashboard();
        }, 5000);
    });
});
