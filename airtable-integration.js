// Airtable Integration for SkillVore Contact Forms
// This can be deployed as a Netlify Function or Vercel Edge Function

const AIRTABLE_API_KEY = 'YOUR_AIRTABLE_API_KEY'; // Replace with your Airtable API key
const AIRTABLE_BASE_ID = 'YOUR_AIRTABLE_BASE_ID'; // Replace with your Airtable base ID
const AIRTABLE_TABLE_NAME = 'Leads'; // Replace with your table name

// For Netlify Functions
exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const formData = JSON.parse(event.body);
        
        // Create record in Airtable
        const airtableRecord = await createAirtableRecord(formData);
        
        // Send email notification (optional)
        await sendEmailNotification(formData);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                success: true, 
                message: 'Contact form submitted successfully',
                recordId: airtableRecord.id 
            }),
        };
    } catch (error) {
        console.error('Error processing form submission:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                success: false, 
                error: 'Failed to process form submission' 
            }),
        };
    }
};

async function createAirtableRecord(formData) {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
    
    const record = {
        fields: {
            'Name': formData.name,
            'Email': formData.email,
            'Phone': formData.phone || '',
            'Company': formData.company || '',
            'Service Interest': formData.service || '',
            'Budget Range': formData.budget || '',
            'Timeline': formData.timeline || '',
            'Message': formData.message,
            'Submission Date': formData.submission_time || new Date().toISOString(),
            'Source': 'SkillVore Website',
            'Status': 'New Lead',
            'Lead Score': calculateLeadScore(formData),
            'Priority': calculatePriority(formData)
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records: [record] }),
    });

    if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status}`);
    }

    const result = await response.json();
    return result.records[0];
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
    
    // Service scoring (enterprise services get higher scores)
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
    
    return Math.min(score, 300); // Cap at 300
}

function calculatePriority(formData) {
    const score = calculateLeadScore(formData);
    
    if (score >= 200) return 'High';
    if (score >= 120) return 'Medium';
    return 'Low';
}

async function sendEmailNotification(formData) {
    // This function can integrate with EmailJS, SendGrid, or other email services
    // For now, we'll use a simple webhook to trigger email notifications
    
    const emailData = {
        to: 'vikas.aistudio@gmail.com',
        subject: `New Lead from SkillVore Website - ${formData.name}`,
        html: generateEmailTemplate(formData)
    };
    
    // You can integrate with your preferred email service here
    console.log('Email notification prepared:', emailData);
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
            </div>
        </div>
        
        <div style="background: #1a365d; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p>This email was generated automatically from the SkillVore website contact form.</p>
            <p>Submission Time: ${formData.submission_time || new Date().toISOString()}</p>
        </div>
    </div>
    `;
}

// For direct browser usage or client-side integration
if (typeof window !== 'undefined') {
    window.SkillVoreAirtable = {
        submitToAirtable: async function(formData) {
            try {
                const response = await fetch('/.netlify/functions/airtable-integration', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                return await response.json();
            } catch (error) {
                console.error('Error submitting to Airtable:', error);
                throw error;
            }
        }
    };
}
