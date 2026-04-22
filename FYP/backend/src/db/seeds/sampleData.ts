import { TrainingModule, TrainingEmail, Email } from '../../models/types';

/** Sample phishing emails for training and testing */
export const sampleEmails: Email[] = [
    {
        id: 'email-001',
        subject: 'Your PayPal account has been limited',
        sender: 'security@paypa1-support.com',
        body: `Dear Customer,

We have noticed suspicious activity on your PayPal account. Your account access has been limited until you verify your identity.

Click here to verify your account: http://paypa1-secure.com/verify

If you do not verify within 24 hours, your account will be permanently suspended and all funds will be frozen.

PayPal Security Team`,
        isPhishing: true,
        category: 'credential-theft',
        difficulty: 'beginner',
        createdAt: new Date(),
    },
    {
        id: 'email-002',
        subject: 'Action Required: Update your Microsoft 365 password',
        sender: 'admin@microsft-365.com',
        body: `Dear Employee,

Your Microsoft 365 password will expire in 2 hours. To avoid losing access to your email, files, and Teams, please update your password immediately by clicking the link below:

Update Password Now: http://ms365-update.com/reset

This is an automated message from your IT department. Failure to update your password will result in account lockout.

IT Support`,
        isPhishing: true,
        category: 'credential-theft',
        difficulty: 'beginner',
        createdAt: new Date(),
    },
    {
        id: 'email-003',
        subject: 'Congratulations! You have won a $500 Amazon Gift Card',
        sender: 'rewards@amazn-gifts.net',
        body: `Dear Lucky Winner,

You have been randomly selected to receive a $500 Amazon Gift Card! 

To claim your prize, simply verify your shipping address and provide your credit card information for a small $4.99 processing fee.

Claim your prize here: http://amazn-rewards.net/claim

This offer expires today!

Amazon Rewards Team`,
        isPhishing: true,
        category: 'financial-fraud',
        difficulty: 'beginner',
        createdAt: new Date(),
    },
    {
        id: 'email-004',
        subject: 'Q3 Team Building Event - Please RSVP',
        sender: 'sarah.johnson@company.com',
        body: `Hi everyone,

We're planning our Q3 team building event and wanted to gauge interest. We're thinking of either a cooking class or an escape room experience.

Date: Friday, October 15th
Time: 2:00 PM - 5:00 PM
Location: TBD based on activity chosen

Please reply with your preference by end of day Wednesday so we can make reservations.

Looking forward to it!
Sarah`,
        isPhishing: false,
        category: 'social-engineering',
        difficulty: 'beginner',
        createdAt: new Date(),
    },
    {
        id: 'email-005',
        subject: 'Meeting notes from yesterday\'s product sync',
        sender: 'james.chen@company.com',
        body: `Team,

Here are the key takeaways from yesterday's product sync:

1. Sprint deadline extended to next Friday
2. New QA process starts next month (details to follow)
3. Client feedback on the dashboard feature was positive
4. Need volunteers for the user testing sessions - talk to Maria

Full notes are in the shared Google Drive folder as usual.

Best,
James`,
        isPhishing: false,
        category: 'social-engineering',
        difficulty: 'beginner',
        createdAt: new Date(),
    },
    {
        id: 'email-006',
        subject: 'URGENT: CEO Wire Transfer Request',
        sender: 'ceo.office@company-corp.com',
        body: `Hi,

I need you to process an urgent wire transfer of $45,000 to a new vendor. This is time-sensitive and must be completed before end of day.

Account Name: Global Solutions LLC
Account Number: 8847291034
Routing Number: 021000089

Please do not discuss this with anyone as it relates to a confidential acquisition. I am in meetings all day so just process it and confirm via email.

Thanks,
Robert Mitchell
CEO`,
        isPhishing: true,
        category: 'financial-fraud',
        difficulty: 'intermediate',
        createdAt: new Date(),
    },
    {
        id: 'email-007',
        subject: 'Your Netflix subscription payment failed',
        sender: 'billing@netflix-account-update.com',
        body: `Dear Valued Member,

We were unable to process your payment for your Netflix subscription. To avoid interruption of your service, please update your billing information within 48 hours.

Update Billing: http://netflix-billing-update.com/account

If your payment information is not updated, your account will be downgraded to the free plan and your viewing history and preferences will be lost.

Netflix Billing Department`,
        isPhishing: true,
        category: 'credential-theft',
        difficulty: 'intermediate',
        createdAt: new Date(),
    },
    {
        id: 'email-008',
        subject: 'New shared document: "Project Budget 2024.xlsx"',
        sender: 'drive-sharing-noreply@google.com',
        body: `A document has been shared with you on Google Drive.

"Project Budget 2024.xlsx" was shared by your organization administrator.

You have been granted edit access. Click below to open the document:

Open Document: https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nF...

This email was sent by Google Drive. If you no longer wish to receive these notifications, visit your Google Drive settings.`,
        isPhishing: false,
        category: 'social-engineering',
        difficulty: 'intermediate',
        createdAt: new Date(),
    },
    {
        id: 'email-009',
        subject: 'Invoice #2024-0892 - Payment Overdue',
        sender: 'ap@legitsupplier.com',
        body: `Dear Accounts Payable,

This is a reminder that Invoice #2024-0892 dated September 1, 2024, in the amount of $3,750.00 is now 15 days past due.

Original payment terms: Net 30
Amount due: $3,750.00
Late fee (if applicable): $62.50

Please remit payment at your earliest convenience. If you have already sent payment, please disregard this notice.

For questions about this invoice, please contact our billing department at billing@legitsupplier.com or call (555) 123-4567.

Thank you,
Accounts Receivable
LegitSupplier Co.`,
        isPhishing: false,
        category: 'financial-fraud',
        difficulty: 'intermediate',
        createdAt: new Date(),
    },
    {
        id: 'email-010',
        subject: 'IT Security: Required software update for all employees',
        sender: 'itsecurity@company-internal.net',
        body: `Dear Employee,

As part of our quarterly security maintenance, all employees are required to install the latest security patch for their workstations.

Please download and run the update from the link below:
http://company-updates.net/security-patch-Q3.exe

IMPORTANT: This update must be installed by end of day Friday. Systems without the update will be disconnected from the network on Monday.

Note: Your antivirus may flag this file as it modifies system security settings. If prompted, please select "Allow" to continue the installation.

IT Security Department`,
        isPhishing: true,
        category: 'malware-delivery',
        difficulty: 'advanced',
        createdAt: new Date(),
    },
    {
        id: 'email-011',
        subject: 'Re: Lunch tomorrow?',
        sender: 'mike.wilson@company.com',
        body: `Hey!

Yeah, that new Thai place on 5th Street sounds great. I've heard their pad thai is amazing.

Does 12:30 work for you? I have a meeting until noon.

Also, did you see the email about the parking lot construction? Looks like we'll need to park on the street next week.

Mike`,
        isPhishing: false,
        category: 'social-engineering',
        difficulty: 'beginner',
        createdAt: new Date(),
    },
    {
        id: 'email-012',
        subject: 'Important: Tax refund notification from IRS',
        sender: 'refunds@irs-gov-refund.com',
        body: `Dear Taxpayer,

After review of your tax filing for the fiscal year 2023, we have determined that you are eligible for a tax refund of $2,847.00.

To receive your refund, you must verify your identity and banking information through our secure portal:

Verify Now: http://irs-refund-portal.com/verify

Please have the following ready:
- Social Security Number
- Date of Birth
- Bank Account Number
- Routing Number

This refund must be claimed within 5 business days or it will be forfeited.

Internal Revenue Service
U.S. Department of the Treasury`,
        isPhishing: true,
        category: 'credential-theft',
        difficulty: 'intermediate',
        createdAt: new Date(),
    },
    {
        id: 'email-013',
        subject: 'Your recent order #AMZ-7824913',
        sender: 'order-update@amazon.com',
        body: `Hello,

Your order #AMZ-7824913 has shipped!

Items ordered:
- Wireless Bluetooth Headphones (Black) x1

Estimated delivery: October 18-20, 2024
Tracking number: 1Z999AA10123456784

Track your package: https://www.amazon.com/gp/your-account/order-history

Thank you for shopping with us!
Amazon.com`,
        isPhishing: false,
        category: 'social-engineering',
        difficulty: 'intermediate',
        createdAt: new Date(),
    },
    {
        id: 'email-014',
        subject: 'LinkedIn: You appeared in 47 searches this week',
        sender: 'notifications-noreply@linkedin.com',
        body: `Hi,

You appeared in 47 searches this week.

Your profile is getting noticed! Here's a summary:
- 12 recruiters viewed your profile
- 8 people from your industry searched for your skills
- Your profile rank improved by 15%

See who's viewing your profile: https://www.linkedin.com/me/profile-views

Premium members see all their viewers. Try LinkedIn Premium free for 1 month.

The LinkedIn Team`,
        isPhishing: false,
        category: 'social-engineering',
        difficulty: 'advanced',
        createdAt: new Date(),
    },
    {
        id: 'email-015',
        subject: 'Shared Document: "Employee_Performance_Reviews_2024"',
        sender: 'hr-documents@company-sharepoint.co',
        body: `Hello,

A new document has been shared with you via SharePoint:

"Employee_Performance_Reviews_2024.docx"

This file contains confidential performance review data. Please sign in with your company credentials to access:

Sign In: http://sharepoint-company.co/signin?doc=perf_reviews

This link will expire in 24 hours for security purposes.

SharePoint Notification Service`,
        isPhishing: true,
        category: 'spear-phishing',
        difficulty: 'advanced',
        createdAt: new Date(),
    },
    {
        id: 'email-016',
        subject: 'FYI: Updated vendor contact information',
        sender: 'procurement@company.com',
        body: `Team,

Quick update - our primary office supplies vendor (OfficePro Inc.) has changed their contact information:

New phone: (555) 987-6543
New email: orders@officepro-inc.com
New account rep: David Martinez

Please update your records accordingly. All open POs remain valid with the same terms.

Let me know if you have any questions.

Best,
Linda Torres
Procurement Manager`,
        isPhishing: false,
        category: 'social-engineering',
        difficulty: 'advanced',
        createdAt: new Date(),
    },
    {
        id: 'email-017',
        subject: 'Apple ID: Unauthorized sign-in attempt detected',
        sender: 'support@apple-id-security.net',
        body: `Dear Apple Customer,

We detected an unauthorized sign-in attempt to your Apple ID from a device in Moscow, Russia.

Date: October 14, 2024 at 3:47 AM EST
Device: Unknown Windows PC
Location: Moscow, Russia

If this wasn't you, your account may be compromised. Secure your account immediately:

Secure My Account: http://apple-id-protect.net/secure

If you don't take action within 12 hours, we will temporarily lock your Apple ID for your protection.

Apple Support`,
        isPhishing: true,
        category: 'credential-theft',
        difficulty: 'intermediate',
        createdAt: new Date(),
    },
    {
        id: 'email-018',
        subject: 'Reminder: Annual compliance training due by October 31',
        sender: 'compliance@company.com',
        body: `Dear Employee,

This is a reminder that your annual compliance training is due by October 31, 2024.

Modules to complete:
1. Anti-harassment and discrimination (30 min)
2. Data privacy and security (20 min)
3. Code of conduct review (15 min)

Access the training portal: https://company.learningplatform.com/compliance

If you have already completed all modules, please disregard this message.

Questions? Contact HR at hr@company.com or ext. 4500.

Compliance Department`,
        isPhishing: false,
        category: 'social-engineering',
        difficulty: 'advanced',
        createdAt: new Date(),
    },
    {
        id: 'email-019',
        subject: 'Voicemail from Unknown Caller - Please Review',
        sender: 'voicemail@phone-messaging-system.com',
        body: `You have a new voicemail message.

From: Unknown Caller
Duration: 0:47
Date: October 14, 2024 2:15 PM

Click below to listen to your voicemail:
Listen Now: http://voicemail-playback.com/msg?id=VM-8294

Or download the audio: voicemail_10142024.mp3.exe

This is an automated message from your unified messaging system.`,
        isPhishing: true,
        category: 'malware-delivery',
        difficulty: 'intermediate',
        createdAt: new Date(),
    },
    {
        id: 'email-020',
        subject: 'Board Meeting Materials - Q3 Financial Review',
        sender: 'exec-assistant@company.com',
        body: `Dear Board Members,

Attached please find the materials for our upcoming Q3 financial review meeting:

Meeting: Q3 Financial Review
Date: October 21, 2024
Time: 9:00 AM - 12:00 PM
Location: Conference Room A / Zoom (link in calendar invite)

Agenda:
1. Q3 Revenue Summary
2. Expense Analysis
3. 2025 Budget Projections
4. Risk Assessment Update

Please review the attached documents prior to the meeting. A hard copy will also be available in the conference room.

Best regards,
Jennifer Park
Executive Assistant to the CEO`,
        isPhishing: false,
        category: 'social-engineering',
        difficulty: 'advanced',
        createdAt: new Date(),
    },
];

/** Training modules organized by category and difficulty */
export const trainingModules: TrainingModule[] = [
    {
        id: 'module-1',
        title: 'Phishing Basics: Recognizing Common Red Flags',
        description: 'Learn to identify the most common indicators of phishing emails, including suspicious senders, urgency tactics, and fake links.',
        category: 'credential-theft',
        difficulty: 'beginner',
        order: 1,
        emails: sampleEmails.filter(e => e.difficulty === 'beginner').map(e => ({
            id: e.id,
            moduleId: 'module-1',
            subject: e.subject,
            sender: e.sender,
            body: e.body,
            isPhishing: e.isPhishing!,
            category: e.category!,
            difficulty: e.difficulty!,
            explanation: '',
            indicators: [],
        })),
    },
    {
        id: 'module-2',
        title: 'Intermediate Threats: Spotting Sophisticated Attacks',
        description: 'Practice identifying more sophisticated phishing attempts that use brand impersonation, business email compromise, and social engineering.',
        category: 'financial-fraud',
        difficulty: 'intermediate',
        order: 2,
        emails: sampleEmails.filter(e => e.difficulty === 'intermediate').map(e => ({
            id: e.id,
            moduleId: 'module-2',
            subject: e.subject,
            sender: e.sender,
            body: e.body,
            isPhishing: e.isPhishing!,
            category: e.category!,
            difficulty: e.difficulty!,
            explanation: '',
            indicators: [],
        })),
    },
    {
        id: 'module-3',
        title: 'Advanced Detection: Expert-Level Challenges',
        description: 'Test your skills against the most subtle and convincing phishing attempts, including spear phishing and carefully crafted social engineering.',
        category: 'spear-phishing',
        difficulty: 'advanced',
        order: 3,
        emails: sampleEmails.filter(e => e.difficulty === 'advanced').map(e => ({
            id: e.id,
            moduleId: 'module-3',
            subject: e.subject,
            sender: e.sender,
            body: e.body,
            isPhishing: e.isPhishing!,
            category: e.category!,
            difficulty: e.difficulty!,
            explanation: '',
            indicators: [],
        })),
    },
];
