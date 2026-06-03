import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import CircularCard from '../../component/common/CircularCard';
import CircularDialog from '../../component/common/CircularDialog';
import clsx from 'clsx';

const CIRCULARS_DATA = [
    {
        id: 1,
        title: 'Diwali Celebration & Office Holidays',
        date: '09:51 PM, 11th May 2026',
        body: 'Dear Team, We would like to wish you and your families a very Happy Diwali! Please note that the office will remain closed on November 12th and 13th for the festival celebrations. Normal operations will resume on Tuesday, November 14th. Enjoy the festivities and have a safe, wonderful time! Warm regards, HR Department',
        fullBody: `Dear Team,\n\nWe would like to wish you and your families a very Happy Diwali! Please note that the office will remain closed on November 12th and 13th for the festival celebrations. Normal operations will resume on Tuesday, November 14th.\n\nEnjoy the festivities and have a safe, wonderful time!\n\nWarm regards,\nHR Department`,
    },
    {
        id: 2,
        title: 'Quarterly Town Hall Meeting – Q2',
        date: '10:51 PM, 7th May 2026',
        body: 'Hi Everyone, Our Q2 Quarterly Town Hall is scheduled for next Thursday, May 14th, 2026, at 03:00 PM in the main cafeteria and streamable online. We will review our financial updates, milestone achievements, and upcoming initiatives. Your attendance is highly encouraged.',
        fullBody: `Hi Everyone,\n\nOur Q2 Quarterly Town Hall is scheduled for next Thursday, May 14th, 2026, at 03:00 PM in the main cafeteria and streamable online.\n\nWe will review our financial updates, milestone achievements, and upcoming initiatives. Your attendance is highly encouraged.\n\nPlease confirm your attendance by May 12th.\n\nBest regards,\nManagement Team`,
    },
    {
        id: 3,
        title: 'New Work From Home Policy – Effective June 1st',
        date: '08:30 AM, 2nd May 2026',
        body: 'Dear Employees, We are pleased to announce an updated Work From Home policy effective June 1st, 2026. Employees are now permitted to work remotely up to 2 days per week, subject to manager approval. Please review the updated policy document attached for full guidelines and eligibility criteria.',
        fullBody: `Dear Employees,\n\nWe are pleased to announce an updated Work From Home policy effective June 1st, 2026. Employees are now permitted to work remotely up to 2 days per week, subject to manager approval.\n\nPlease review the updated policy document attached for full guidelines and eligibility criteria.\n\nFor any questions, please contact HR at hr@minehr.com.\n\nBest regards,\nHR Department`,
    },
    {
        id: 4,
        title: 'Annual Health & Wellness Check-Up Drive',
        date: '11:00 AM, 28th April 2026',
        body: 'Dear Team, We are organizing an Annual Health & Wellness Check-Up Drive for all employees on May 20th and 21st, 2026. The check-up will be conducted on-site at the company clinic from 9:00 AM to 5:00 PM. Participation is voluntary but strongly encouraged as part of our employee well-being initiative.',
        fullBody: `Dear Team,\n\nWe are organizing an Annual Health & Wellness Check-Up Drive for all employees on May 20th and 21st, 2026.\n\nThe check-up will be conducted on-site at the company clinic from 9:00 AM to 5:00 PM. Services include:\n- Blood pressure & sugar check\n- BMI assessment\n- Eye check-up\n- General physician consultation\n\nParticipation is voluntary but strongly encouraged as part of our employee well-being initiative.\n\nKindly register by May 15th via the HR portal.\n\nBest wishes,\nHR & Admin Team`,
    },
    {
        id: 5,
        title: 'Office Relocation – New Address Effective May 15th',
        date: '09:00 AM, 20th April 2026',
        body: 'Dear All, We are excited to inform you that our office will be relocating to a new premises effective May 15th, 2026. The new office is situated at Block B, 4th Floor, Sunrise Business Park, Ahmedabad. Detailed directions and parking information will be shared separately.',
        fullBody: `Dear All,\n\nWe are excited to inform you that our office will be relocating to a new premises effective May 15th, 2026.\n\nNew Address:\nBlock B, 4th Floor,\nSunrise Business Park,\nAhmedabad – 380015\n\nDetailed directions and parking information will be shared separately. The last day at the current office is May 14th, 2026.\n\nThank you for your cooperation during this transition.\n\nBest regards,\nAdmin Team`,
    },
    {
        id: 6,
        title: 'Updated Leave Policy for 2026',
        date: '03:15 PM, 10th April 2026',
        body: 'Dear Employees, Please be informed that the company leave policy has been revised for the year 2026. Key changes include an increase in casual leave from 8 to 10 days, introduction of 2 days of volunteer leave, and clarification on carry-forward rules. The full updated policy is available on the HR portal.',
        fullBody: `Dear Employees,\n\nPlease be informed that the company leave policy has been revised for the year 2026. Key changes include:\n\n1. Casual Leave increased from 8 to 10 days.\n2. Introduction of 2 days of Volunteer Leave per year.\n3. Carry-forward of up to 5 unused CL days to the next year.\n4. Medical leave now requires a doctor's certificate for leaves exceeding 2 days.\n\nThe full updated policy document is available on the HR portal under "Policies & Guidelines".\n\nFor clarifications, please reach out to HR.\n\nWarm regards,\nHR Department`,
    },
];

const FILTER_TABS = ['RECENT', 'MAY', 'APRIL', 'CUSTOM'];

export default function Circulars() {
    const [activeTab, setActiveTab] = useState('RECENT');
    const [selectedCircular, setSelectedCircular] = useState(null);

    return (
        <div className="flex flex-col h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Page Header */}
            <div className="flex items-start gap-3 mb-6 shrink-0">
                <FileText className="text-indigo-500 mt-0.5" size={28} strokeWidth={2} />
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Circulars</h1>
                    <p className="text-slate-500 text-sm mt-1">View company circulars, official updates and announcements</p>
                </div>
            </div>

            {/* Filter Strip */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 mb-6 shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                        {FILTER_TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={clsx(
                                    'px-5 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all',
                                    activeTab === tab
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'CUSTOM' && (
                        <div className="flex flex-wrap items-center gap-3 sm:ml-4 sm:pl-4">
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-slate-500 font-medium">From:</label>
                                <input
                                    type="date"
                                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-slate-500 font-medium">To:</label>
                                <input
                                    type="date"
                                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                                />
                            </div>
                            <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-1.5 rounded-lg text-sm font-semibold tracking-wide shadow-sm transition-colors ml-1">
                                Get
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Circular Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 relative">
                {CIRCULARS_DATA.map((circular) => (
                    <div key={circular.id} className="relative">
                        {/* Top gradient accent line on each card */}
                        <div className="absolute top-0 left-5 right-5 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full z-10" />
                        <CircularCard
                            circular={circular}
                            onViewMore={setSelectedCircular}
                        />
                    </div>
                ))}
            </div>

            {/* Dialog */}
            {selectedCircular && (
                <CircularDialog
                    circular={selectedCircular}
                    onClose={() => setSelectedCircular(null)}
                />
            )}
        </div>
    );
}
