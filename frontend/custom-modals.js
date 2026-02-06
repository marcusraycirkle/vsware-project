// CUSTOM MODAL SYSTEM - Replaces all browser alert/prompt/confirm

// Toast notification
function showToast(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `custom-toast ${type}`;
    
    const iconMap = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    toast.innerHTML = `
        <div class="toast-icon ${type}">
            <i class="fas ${iconMap[type]}"></i>
        </div>
        <div class="toast-content">
            <p>${message}</p>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Show loading overlay
function showLoading(message = 'Loading...') {
    const overlay = document.createElement('div');
    overlay.className = 'loading-spinner-overlay';
    overlay.id = 'loading-overlay';
    
    overlay.innerHTML = `
        <div class="loading-spinner-content">
            <div class="spinner"></div>
            <p style="margin: 0; color: #6b7280; font-weight: 500;">${message}</p>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

// Hide loading overlay
function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.animation = 'fadeOut 0.2s ease forwards';
        setTimeout(() => overlay.remove(), 200);
    }
}

// Confirm dialog (replaces window.confirm)
function showConfirm(title, message, onConfirm, onCancel) {
    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';
    
    dialog.innerHTML = `
        <div class="confirm-dialog-overlay"></div>
        <div class="confirm-dialog-content">
            <div class="confirm-dialog-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3 class="confirm-dialog-title">${title}</h3>
            <p class="confirm-dialog-message">${message}</p>
            <div class="confirm-dialog-actions">
                <button class="confirm-btn-cancel">Cancel</button>
                <button class="confirm-btn-confirm">Confirm</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    const overlay = dialog.querySelector('.confirm-dialog-overlay');
    const cancelBtn = dialog.querySelector('.confirm-btn-cancel');
    const confirmBtn = dialog.querySelector('.confirm-btn-confirm');
    
    const closeDialog = () => {
        dialog.style.animation = 'fadeOut 0.2s ease forwards';
        setTimeout(() => dialog.remove(), 200);
    };
    
    overlay.addEventListener('click', () => {
        closeDialog();
        if (onCancel) onCancel();
    });
    
    cancelBtn.addEventListener('click', () => {
        closeDialog();
        if (onCancel) onCancel();
    });
    
    confirmBtn.addEventListener('click', () => {
        closeDialog();
        if (onConfirm) onConfirm();
    });
}

// Prompt dialog (replaces window.prompt)
function showPrompt(title, fields, onSubmit, onCancel) {
    const dialog = document.createElement('div');
    dialog.className = 'prompt-dialog';
    
    // Generate form fields HTML
    const fieldsHTML = fields.map((field, index) => `
        <div class="form-group" style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">
                ${field.label}
                ${field.required ? '<span style="color: #ef4444;">*</span>' : ''}
            </label>
            ${field.type === 'select' ? `
                <select id="prompt-field-${index}" class="form-control" ${field.required ? 'required' : ''}>
                    <option value="">Select ${field.label}</option>
                    ${field.options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
                </select>
            ` : `
                <input 
                    type="${field.type || 'text'}" 
                    id="prompt-field-${index}" 
                    class="form-control" 
                    placeholder="${field.placeholder || ''}"
                    value="${field.value || ''}"
                    ${field.required ? 'required' : ''}
                />
            `}
        </div>
    `).join('');
    
    dialog.innerHTML = `
        <div class="prompt-dialog-overlay"></div>
        <div class="prompt-dialog-content">
            <h3 class="prompt-dialog-title">${title}</h3>
            <div class="prompt-dialog-body">
                ${fieldsHTML}
            </div>
            <div class="prompt-dialog-actions">
                <button class="btn-secondary" id="prompt-cancel">Cancel</button>
                <button class="btn-primary" id="prompt-submit">Submit</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    const overlay = dialog.querySelector('.prompt-dialog-overlay');
    const cancelBtn = dialog.querySelector('#prompt-cancel');
    const submitBtn = dialog.querySelector('#prompt-submit');
    
    const closeDialog = () => {
        dialog.style.animation = 'fadeOut 0.2s ease forwards';
        setTimeout(() => dialog.remove(), 200);
    };
    
    overlay.addEventListener('click', () => {
        closeDialog();
        if (onCancel) onCancel();
    });
    
    cancelBtn.addEventListener('click', () => {
        closeDialog();
        if (onCancel) onCancel();
    });
    
    submitBtn.addEventListener('click', () => {
        const values = {};
        let allValid = true;
        
        fields.forEach((field, index) => {
            const input = document.querySelector(`#prompt-field-${index}`);
            const value = input.value.trim();
            
            if (field.required && !value) {
                allValid = false;
                input.style.borderColor = '#ef4444';
                input.style.animation = 'shake 0.3s ease';
            } else {
                input.style.borderColor = '';
                values[field.name] = value;
            }
        });
        
        if (allValid) {
            closeDialog();
            if (onSubmit) onSubmit(values);
        }
    });
    
    // Focus first input
    const firstInput = dialog.querySelector('input, select');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
}

// Show success overlay
function showSuccessOverlay(message = 'Success!', duration = 2000) {
    const overlay = document.createElement('div');
    overlay.className = 'success-overlay';
    
    overlay.innerHTML = `
        <div class="success-overlay-content">
            <i class="fas fa-check-circle"></i>
            <h2>${message}</h2>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        overlay.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => overlay.remove(), 300);
    }, duration);
}

// Alert dialog (replaces window.alert)
function showAlert(title, message, type = 'info') {
    const iconMap = {
        info: { icon: 'fa-info-circle', color: '#3b82f6' },
        success: { icon: 'fa-check-circle', color: '#10b981' },
        warning: { icon: 'fa-exclamation-triangle', color: '#f59e0b' },
        error: { icon: 'fa-exclamation-circle', color: '#ef4444' }
    };
    
    const config = iconMap[type] || iconMap.info;
    
    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';
    
    dialog.innerHTML = `
        <div class="confirm-dialog-overlay"></div>
        <div class="confirm-dialog-content">
            <div class="confirm-dialog-icon" style="background: ${config.color}15; color: ${config.color};">
                <i class="fas ${config.icon}"></i>
            </div>
            <h3 class="confirm-dialog-title">${title}</h3>
            <p class="confirm-dialog-message">${message}</p>
            <div class="confirm-dialog-actions">
                <button class="btn-primary" style="flex: 1;">OK</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    const overlay = dialog.querySelector('.confirm-dialog-overlay');
    const okBtn = dialog.querySelector('button');
    
    const closeDialog = () => {
        dialog.style.animation = 'fadeOut 0.2s ease forwards';
        setTimeout(() => dialog.remove(), 200);
    };
    
    overlay.addEventListener('click', closeDialog);
    okBtn.addEventListener('click', closeDialog);
}

// Add shake animation to CSS dynamically
if (!document.getElementById('custom-modal-animations')) {
    const style = document.createElement('style');
    style.id = 'custom-modal-animations';
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
        @keyframes fadeOut {
            to {
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Export functions for use in other files
window.showToast = showToast;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showConfirm = showConfirm;
window.showPrompt = showPrompt;
window.showSuccessOverlay = showSuccessOverlay;
window.showAlert = showAlert;
