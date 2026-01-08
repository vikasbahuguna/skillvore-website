// Google Sheets Integration for SkillVore Contact Forms
// This script can be deployed as a Google Apps Script or used with Google Sheets API

// Configuration - Replace with your actual values
const SPREADSHEET_ID = 'YOUR_GOOGLE_SPREADSHEET_ID'; // Get this from your Google Sheets URL
const SHEET_NAME = 'Leads'; // Name of the sheet tab
const WEBHOOK_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEBHOOK_URL'; // Apps Script web app URL

// Google Apps Script Version (deploy this as a web app)
function doPost(e) {
    try {
        const formData = JSON.parse(e.postData.contents);
        
        // Add to Google Sheets
        const result = addToSheet(formData);
        
        // Send email notification
        sendEmailNotification(formData);
        
        return ContentService
            .createTextOutput(JSON.stringify({
                success: true,
                message: 'Form submitted successfully',
                rowNumber: result.rowNumber
            }))
            .setMimeType(ContentService.MimeType.JSON);
            
    } catch (error) {
        console.error('Error processing form:', error);
        return ContentService
            .createTextOutput(JSON.stringify({
                success: false,
                error: error.toString()
            }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function addToSheet(formData) {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    // Create headers if this is the first row
    if (sheet.getLastRow() === 0) {
        const headers = [
            'Timestamp',
            'Name', 
            'Email', 
            'Phone', 
            'Company',
            'Service Interest',
            'Budget Range',
            'Timeline',
            'Message',
            'Lead Score',
            'Priority',
            'Status',
            'Source',
            'Submission Date'
        ];
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        
        // Format header row
        const headerRange = sheet.getRange(1, 1, 1, headers.length);
        headerRange.setBackground('#1a365d');
        headerRange.setFontColor('white');
        headerRange.setFontWeight('bold');
    }
    
    // Calculate lead score and priority
    const leadScore = calculateLeadScore(formData);
    const priority = calculatePriority(formData);
    
    // Prepare row data
    const rowData = [
        new Date(), // Timestamp
        formData.name,
        formData.email,
        formData.phone || '',
        formData.company || '',
        formData.service || '',
        formData.budget || '',
        formData.timeline || '',
        formData.message,
        leadScore,
        priority,
        'New Lead',
        'SkillVore Website',
        formData.submission_time || new Date().toISOString()
    ];
    
    // Add the row
    const newRow = sheet.getLastRow() + 1;
    sheet.getRange(newRow, 1, 1, rowData.length).setValues([rowData]);
    
    // Format the new row based on priority
    const rowRange = sheet.getRange(newRow, 1, 1, rowData.length);
    if (priority === 'High') {
        rowRange.setBackground('#fed7d7'); // Light red for high priority
    } else if (priority === 'Medium') {
        rowRange.setBackground('#fef5e7'); // Light yellow for medium priority
    } else {
        rowRange.setBackground('#f0fff4'); // Light green for low priority
    }
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, rowData.length);
    
    return { rowNumber: newRow };
}

function calculateLeadScore(formData) {
    let score = 0;
    
    // Budget scoring
    const budgetScores = {
        'under-1lakh': 20,
        '1-5lakh': 40,
        '5-10lakh': 60,
        '10-25lakh': 80,
        '25lakh-plus': 100,
        'consultation-only': 10
    };
    score += budgetScores[formData.budget] || 0;
    
    // Timeline scoring
    const timelineScores = {
        'immediate': 100,
        '1-month': 80,
        '1-3months': 60,
        '3-6months': 40,
        '6months-plus': 20,
        'exploring': 10
    };
    score += timelineScores[formData.timeline] || 0;
    
    // Service scoring
    const serviceScores = {
        'ai-product-building': 90,
        'ai-agents': 80,
        'rag-mcp': 85,
        'ai-automation': 70,
        'corporate-training': 75,
        'content-strategy': 50,
        'brand-commercials': 45,
        'visual-storytelling': 40,
        'consultation': 30,
        'other': 20
    };
    score += serviceScores[formData.service] || 0;
    
    // Company field adds points
    if (formData.company && formData.company.trim()) {
        score += 20;
    }
    
    // Phone number adds points
    if (formData.phone && formData.phone.trim()) {
        score += 15;
    }
    
    return Math.min(score, 300);
}

function calculatePriority(formData) {
    const score = calculateLeadScore(formData);
    
    if (score >= 200) return 'High';
    if (score >= 120) return 'Medium';
    return 'Low';
}

function sendEmailNotification(formData) {
    const subject = `New Lead from SkillVore Website - ${formData.name}`;
    const htmlBody = generateEmailTemplate(formData);
    
    // Send to your email
    GmailApp.sendEmail(
        'vikas.aistudio@gmail.com',
        subject,
        '', // Plain text body (empty since we're using HTML)
        {
            htmlBody: htmlBody,
            replyTo: formData.email
        }
    );
}

function generateEmailTemplate(formData) {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #00d4ff 0%, #1a365d 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Lead - SkillVore</h1>
        </div>
        
        <div style="padding: 20px; background: #f7fafc;">
            <h2 style="color: #1a365d;">Contact Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Name:</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${formData.name}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Email:</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${formData.email}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Phone:</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${formData.phone || 'Not provided'}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Company:</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${formData.company || 'Not provided'}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Service Interest:</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${formData.service || 'Not specified'}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Budget Range:</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${formData.budget || 'Not specified'}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Timeline:</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${formData.timeline || 'Not specified'}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Lead Score:</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${calculateLeadScore(formData)}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Priority:</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${calculatePriority(formData)}</td>
                </tr>
            </table>
            
            <h3 style="color: #1a365d; margin-top: 20px;">Message:</h3>
            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #00d4ff;">
                ${formData.message}
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
                <a href="mailto:${formData.email}" style="background: #00d4ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reply to Lead</a>
                <a href="https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}" style="background: #1a365d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-left: 10px;">View in Sheets</a>
            </div>
        </div>
        
        <div style="background: #1a365d; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p>This email was generated automatically from the SkillVore website contact form.</p>
            <p>Submission Time: ${formData.submission_time || new Date().toISOString()}</p>
        </div>
    </div>
    `;
}

// Client-side JavaScript for submitting to Google Sheets
if (typeof window !== 'undefined') {
    window.SkillVoreGoogleSheets = {
        submitToGoogleSheets: async function(formData) {
            try {
                const response = await fetch(WEBHOOK_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                return await response.json();
            } catch (error) {
                console.error('Error submitting to Google Sheets:', error);
                throw error;
            }
        }
    };
}

// Zapier/Make.com webhook integration
function submitToZapier(formData) {
    const zapierWebhookUrl = 'YOUR_ZAPIER_WEBHOOK_URL'; // Replace with your Zapier webhook URL
    
    return fetch(zapierWebhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...formData,
            leadScore: calculateLeadScore(formData),
            priority: calculatePriority(formData),
            source: 'SkillVore Website',
            timestamp: new Date().toISOString()
        })
    });
}
