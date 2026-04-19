// Set current date in receipt
document.addEventListener('DOMContentLoaded', () => {
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        dateEl.innerText = new Date().toLocaleDateString();
    }

    // Add dynamic amount generation just for demonstration if ID is entered
    const consumerIdEl = document.getElementById('consumerId');
    if (consumerIdEl) {
        consumerIdEl.addEventListener('blur', function() {
            if(this.value.length > 5) {
                const randomAmount = Math.floor(Math.random() * 5000) + 100;
                document.getElementById('amount').value = randomAmount;
            }
        });
    }
});

// Payment method selection logic
function selectPayment(element) {
    document.querySelectorAll('.payment-card').forEach(card => card.classList.remove('active'));
    element.classList.add('active');
}
