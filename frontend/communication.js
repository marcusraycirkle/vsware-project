// COMMUNICATION SYSTEM - Messages, Emails, Announcements
// Complete implementation for internal messaging, bulk emails, and announcements

let currentCommTab = 'incoming';
let currentCommType = 'messages'; // 'messages', 'emails', 'announcements'
let composeDraft = null;

// Mock data
const mockMessages = {
    incoming: [
        { id: 1, from: 'Mary Kilmartin', subject: 'Re: Cory\'s Progress', body: 'Thank you for the update on Cory\'s progress...', time: '10:30 AM', unread: true },
        { id: 2, from: 'John Murphy', subject: 'Parent-Teacher Meeting', body: 'I would like to schedule a meeting...', time: '9:15 AM', unread: true },
        { id: 3, from: 'Eimear McMahon', subject: 'Class Materials', body: 'Please find attached the reading materials...', time: 'Yesterday', unread: false }
    ],
    sent: [
        { id: 4, to: 'Mary Kilmartin', subject: 'Cory\'s Progress Report', body: 'I wanted to update you on Cory\'s excellent progress...', time: '2 days ago' }
    ],
    drafts: [],
    deleted: []
};

// Initialize communication system
function initCommunicationSystem() {
    loadMessagesTab(currentCommTab);
}

// Switch between Messages/Emails/Announcements
function switchCommType(type) {
    currentCommType = type;
    currentCommTab = type === 'announcements' ? 'all' : 'incoming';
    
    if (type === 'messages') {
        loadMessagesTab(currentCommTab);
    } else if (type === 'emails') {
        loadEmailsTab(currentCommTab);
    } else if (type === 'announcements') {
        loadAnnouncementsTab();
    }
}

// Switch tabs within each comm type
function switchCommTab(tab) {
    currentCommTab = tab;
    
    if (currentCommType === 'messages') {
        loadMessagesTab(tab);
    } else if (currentCommType === 'emails') {
        loadEmailsTab(tab);
    }
}

// MESSAGES SYSTEM
function loadMessagesTab(tab) {
    const container = document.getElementById('comm-content');
    const messages = mockMessages[tab] || [];
    
    let html = '<div class="message-list">';
    
    if (messages.length === 0) {
        html += `
            <div style="padding: 4rem; text-align: center; color: #6b7280;">
                <i class="fas fa-inbox" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p style="font-size: 1.1rem; font-weight: 600;">No messages in ${tab}</p>
            </div>
        `;
    } else {
        messages.forEach(msg => {
            const initials = (msg.from || msg.to || 'U').split(' ').map(n => n[0]).join('');
            html += `
                <div class="message-list-item ${msg.unread ? 'unread' : ''}" onclick="viewMessage(${msg.id}, '${tab}')">
                    <div class="message-avatar">${initials}</div>
                    <div class="message-details">
                        <div class="message-header">
                            <span class="message-sender">${msg.from || msg.to || 'Unknown'}</span>
                            <span class="message-time">${msg.time}</span>
                        </div>
                        <div class="message-subject">${msg.subject}</div>
                        <div class="message-preview">${msg.body.substring(0, 100)}...</div>
                    </div>
                </div>
            `;
        });
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// EMAILS SYSTEM (same as messages but with bulk options)
function loadEmailsTab(tab) {
    loadMessagesTab(tab); // Reuse message display for now
}

// ANNOUNCEMENTS SYSTEM
function loadAnnouncementsTab() {
    const container = document.getElementById('comm-content');
    
    const mockAnnouncements = [
        {
            id: 1,
            title: 'School Closure - Weather Warning',
            body: 'Due to Status Red weather warning, the school will be closed tomorrow, February 7th, 2026. All classes are cancelled and students should remain at home.',
            author: 'Schoolware Admin',
            date: 'Today at 2:30 PM',
            sentTo: ['parents', 'students'],
            repliesEnabled: false,
            reactionsEnabled: true,
            reactions: { like: 12, helpful: 8 }
        },
        {
            id: 2,
            title: 'Parent-Teacher Meetings - March 2026',
            body: 'Parent-teacher meetings will be held on March 15th and 16th. Booking system will open next week. Please ensure you book your slot early.',
            author: 'Principal Murphy',
            date: 'Yesterday at 10:00 AM',
            sentTo: ['parents'],
            repliesEnabled: true,
            reactionsEnabled: true,
            reactions: { like: 45, helpful: 23 }
        }
    ];
    
    let html = '<div style="max-width: 900px; margin: 0 auto;">';
    
    mockAnnouncements.forEach(announcement => {
        html += `
            <div class="announcement-card">
                <div class="announcement-header">
                    <div>
                        <h3 class="announcement-title">${announcement.title}</h3>
                        <div class="announcement-meta">
                            Posted by ${announcement.author} • ${announcement.date} • 
                            Sent to: ${announcement.sentTo.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}
                        </div>
                    </div>
                </div>
                <div class="announcement-body">
                    ${announcement.body}
                </div>
                ${announcement.reactionsEnabled || announcement.repliesEnabled ? `
                    <div class="announcement-actions">
                        ${announcement.reactionsEnabled ? `
                            <button class="announcement-action-btn">
                                <i class="fas fa-thumbs-up"></i> Like (${announcement.reactions.like})
                            </button>
                            <button class="announcement-action-btn">
                                <i class="fas fa-check-circle"></i> Helpful (${announcement.reactions.helpful})
                            </button>
                        ` : ''}
                        ${announcement.repliesEnabled ? `
                            <button class="announcement-action-btn">
                                <i class="fas fa-comment"></i> Reply
                            </button>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// VIEW MESSAGE
function viewMessage(id, tab) {
    const message = mockMessages[tab].find(m => m.id === id);
    if (!message) return;
    
    // Mark as read
    message.unread = false;
    
    const container = document.getElementById('comm-content');
    container.innerHTML = `
        <div class="message-view-container">
            <button class="btn-secondary" onclick="switchCommTab('${tab}')" style="margin-bottom: 1rem;">
                <i class="fas fa-arrow-left"></i> Back to ${tab}
            </button>
            
            <div class="message-view-header">
                <h2 class="message-view-subject">${message.subject}</h2>
                <div class="message-view-meta">
                    <div class="message-avatar">${(message.from || message.to || 'U').split(' ').map(n => n[0]).join('')}</div>
                    <div>
                        <div style="font-weight: 600; color: #1f2937;">${message.from || message.to || 'Unknown'}</div>
                        <div style="font-size: 0.875rem; color: #6b7280;">${message.time}</div>
                    </div>
                </div>
            </div>
            
            <div class="message-view-body">
                ${message.body}
            </div>
            
            <div style="padding: 2rem; border-top: 2px solid #e5e7eb; display: flex; gap: 1rem;">
                <button class="btn-primary" onclick="replyToMessage(${id})">
                    <i class="fas fa-reply"></i> Reply
                </button>
                <button class="btn-secondary" onclick="forwardMessage(${id})">
                    <i class="fas fa-share"></i> Forward
                </button>
                <button class="btn-secondary" onclick="deleteMessage(${id}, '${tab}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
}

// COMPOSE MESSAGE
function openComposeModal(type = 'message') {
    const modal = document.createElement('div');
    modal.id = 'compose-modal';
    modal.className = 'compose-modal';
    
    const isEmail = type === 'email';
    const isAnnouncement = type === 'announcement';
    
    modal.innerHTML = `
        <div class="compose-container">
            <div class="compose-header">
                <h3><i class="fas fa-${isAnnouncement ? 'bullhorn' : 'envelope'}"></i> ${isAnnouncement ? 'New Announcement' : isEmail ? 'New Email' : 'New Message'}</h3>
                <button onclick="closeComposeModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="compose-body">
                ${isEmail ? `
                    <div class="compose-field">
                        <label>Send To</label>
                        <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <button class="btn-secondary" onclick="toggleEmailGroup('parents')" style="font-size: 0.875rem; padding: 0.5rem 1rem;">
                                <i class="fas fa-users"></i> All Parents
                            </button>
                            <button class="btn-secondary" onclick="toggleEmailGroup('students')" style="font-size: 0.875rem; padding: 0.5rem 1rem;">
                                <i class="fas fa-user-graduate"></i> All Students
                            </button>
                            <button class="btn-secondary" onclick="toggleEmailGroup('teachers')" style="font-size: 0.875rem; padding: 0.5rem 1rem;">
                                <i class="fas fa-chalkboard-teacher"></i> All Teachers
                            </button>
                            <button class="btn-secondary" onclick="toggleEmailGroup('staff')" style="font-size: 0.875rem; padding: 0.5rem 1rem;">
                                <i class="fas fa-user-tie"></i> All Staff
                            </button>
                        </div>
                        <input type="text" id="compose-to" placeholder="Or enter email address..." />
                        <div id="email-recipients" class="recipient-chips"></div>
                    </div>
                ` : isAnnouncement ? `
                    <div class="compose-field">
                        <label>Send To</label>
                        <div class="checkbox-group">
                            <label class="checkbox-item">
                                <input type="checkbox" id="announce-parents" value="parents" /> Parents
                            </label>
                            <label class="checkbox-item">
                                <input type="checkbox" id="announce-students" value="students" /> Students
                            </label>
                        </div>
                    </div>
                ` : `
                    <div class="compose-field">
                        <label>Recipient</label>
                        <select id="compose-to">
                            <option value="">Select recipient...</option>
                            <optgroup label="Parents">
                                <option value="mary.kilmartin@email.com">Mary Kilmartin</option>
                                <option value="john.murphy@email.com">John Murphy</option>
                            </optgroup>
                            <optgroup label="Teachers">
                                <option value="eimear.mcmahon@shannoncomp.ie">Eimear McMahon</option>
                                <option value="finola.butler@shannoncomp.ie">Finola Butler</option>
                            </optgroup>
                            <optgroup label="Staff">
                                <option value="admin@shannoncomp.ie">School Administrator</option>
                            </optgroup>
                        </select>
                    </div>
                `}
                
                ${!isAnnouncement ? `
                    <div class="compose-field">
                        <label>CC</label>
                        <input type="text" id="compose-cc" placeholder="Carbon copy..." />
                    </div>
                    
                    <div class="compose-field">
                        <label>BCC</label>
                        <input type="text" id="compose-bcc" placeholder="Blind carbon copy..." />
                    </div>
                ` : ''}
                
                <div class="compose-field">
                    <label>Subject</label>
                    <input type="text" id="compose-subject" placeholder="Enter subject..." />
                </div>
                
                <div class="compose-field">
                    <label>Message</label>
                    <div class="markdown-toolbar">
                        <button class="md-btn" onclick="insertMarkdown('**', '**')" title="Bold"><i class="fas fa-bold"></i></button>
                        <button class="md-btn" onclick="insertMarkdown('*', '*')" title="Italic"><i class="fas fa-italic"></i></button>
                        <button class="md-btn" onclick="insertMarkdown('- ', '')" title="Bullet List"><i class="fas fa-list-ul"></i></button>
                        <button class="md-btn" onclick="insertMarkdown('1. ', '')" title="Numbered List"><i class="fas fa-list-ol"></i></button>
                        <button class="md-btn" onclick="insertMarkdown('[', '](url)')" title="Link"><i class="fas fa-link"></i></button>
                    </div>
                    <textarea id="compose-body" placeholder="Type your message here... (Markdown supported)"></textarea>
                </div>
                
                ${isAnnouncement ? `
                    <div class="compose-field">
                        <div class="checkbox-group">
                            <label class="checkbox-item">
                                <input type="checkbox" id="enable-replies" checked /> Enable Replies
                            </label>
                            <label class="checkbox-item">
                                <input type="checkbox" id="enable-reactions" checked /> Enable Reactions
                            </label>
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <div class="compose-footer">
                <button class="btn-secondary" onclick="saveDraft()">
                    <i class="fas fa-save"></i> Save as Draft
                </button>
                <button class="btn-primary" onclick="sendMessage('${type}')">
                    <i class="fas fa-paper-plane"></i> Send
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeComposeModal() {
    const modal = document.getElementById('compose-modal');
    if (modal) modal.remove();
}

// MARKDOWN INSERTION
function insertMarkdown(before, after) {
    const textarea = document.getElementById('compose-body');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    textarea.value = newText;
    textarea.focus();
    textarea.setSelectionRange(start + before.length, end + before.length);
}

// SEND MESSAGE
function sendMessage(type) {
    const subject = document.getElementById('compose-subject')?.value;
    const body = document.getElementById('compose-body')?.value;
    
    if (!subject || !body) {
        showToast('Please fill in subject and message', 'error');
        return;
    }
    
    showLoading('Sending...');
    
    setTimeout(() => {
        hideLoading();
        closeComposeModal();
        showToast(`${type === 'announcement' ? 'Announcement' : type === 'email' ? 'Email' : 'Message'} sent successfully!`, 'success');
        
        if (currentCommType === type + 's' || (type === 'message' && currentCommType === 'messages')) {
            switchCommTab('sent');
        }
    }, 1500);
}

// SAVE DRAFT
function saveDraft() {
    showToast('Draft saved successfully!', 'success');
    closeComposeModal();
}

// Global functions
window.initCommunicationSystem = initCommunicationSystem;
window.switchCommType = switchCommType;
window.switchCommTab = switchCommTab;
window.viewMessage = viewMessage;
window.openComposeModal = openComposeModal;
window.closeComposeModal = closeComposeModal;
window.insertMarkdown = insertMarkdown;
window.sendMessage = sendMessage;
window.saveDraft = saveDraft;
