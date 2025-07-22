// Calculator Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    
    // Check if mobile device
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // On mobile, redirect to calculator page directly
        let calculatorUrl;
        if (modalId === 'mspModal') {
            calculatorUrl = '/calculators/msp_cost_calculator.html';
        } else if (modalId === 'macModal') {
            calculatorUrl = '/calculators/mac_vs_pc_calculator.html';
        }
        
        // Open in new tab/window on mobile for better experience
        window.open(calculatorUrl, '_blank');
        
        // Close the modal immediately
        closeModal(modalId);
        return;
    }
    
    // Desktop behavior - load in iframe
    if (modalId === 'mspModal') {
        document.getElementById('mspFrame').src = '/calculators/msp_cost_calculator.html';
    } else if (modalId === 'macModal') {
        document.getElementById('macFrame').src = '/calculators/mac_vs_pc_calculator.html';
    }
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

// Bridge function for calculator cards (missing function)
// Fix Suggestion by Claude Sonnet 4
function openCalculator(type) {
    if (type === 'mac') {
        openModal('macModal');
    } else if (type === 'msp') {
        openModal('mspModal');
    }
}


function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
    
    // Clear iframe src to stop any ongoing processes
    if (modalId === 'mspModal') {
        document.getElementById('mspFrame').src = '';
    } else if (modalId === 'macModal') {
        document.getElementById('macFrame').src = '';
    }
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside of it (desktop only)
window.onclick = function(event) {
    const isMobile = window.innerWidth <= 768;
    
    // Skip this behavior on mobile since we redirect anyway
    if (isMobile) return;
    
    const mspModal = document.getElementById('mspModal');
    const macModal = document.getElementById('macModal');
    
    if (event.target == mspModal) {
        closeModal('mspModal');
    } else if (event.target == macModal) {
        closeModal('macModal');
    }
}

// Close modal with Escape key (desktop only)
document.addEventListener('keydown', function(event) {
    const isMobile = window.innerWidth <= 768;
    
    // Skip this behavior on mobile since we redirect anyway
    if (isMobile) return;
    
    if (event.key === 'Escape') {
        closeModal('mspModal');
        closeModal('macModal');
    }
});

// Handle window resize - if user resizes from desktop to mobile, close any open modals
window.addEventListener('resize', function() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        closeModal('mspModal');
        closeModal('macModal');
    }
});
