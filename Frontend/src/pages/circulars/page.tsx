import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import CircularCard from '../../component/common/CircularCard';
import CircularDialog from '../../component/common/CircularDialog';
import clsx from 'clsx';
import { getCirculars } from '../../service/circular.service';
import type { FormattedCircular } from '../../types';

const FILTER_TABS = ['RECENT', 'MAY', 'APRIL', 'CUSTOM'] as const;
type FilterTab = (typeof FILTER_TABS)[number];

export default function Circulars() {
  const [circulars, setCirculars] = useState<FormattedCircular[]>([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('RECENT');
  const [selectedCircular, setSelectedCircular] = useState<FormattedCircular | null>(null);

  const fetchCirculars = async () => {
    try {
      setLoading(true);

      const params: Record<string, unknown> = {};

      if (activeTab === 'MAY') params.month = 5;
      if (activeTab === 'APRIL') params.month = 4;
      if (activeTab === 'CUSTOM' && fromDate && toDate) {
        params.fromDate = fromDate;
        params.toDate = toDate;
      }

      const res = await getCirculars(params);

      const formattedCirculars: FormattedCircular[] = res.data.data.data.map(
        (item: {
          id: string;
          circularTitle: string;
          circularDescription: string;
          circularPostDate: string;
          circularPostTime: string;
        }) => ({
          id: item.id,
          title: item.circularTitle,
          date: `${item.circularPostTime}, ${new Date(item.circularPostDate).toLocaleDateString(
            'en-IN',
            { day: 'numeric', month: 'long', year: 'numeric' }
          )}`,
          body:
            item.circularDescription.length > 180
              ? item.circularDescription.substring(0, 180) + '...'
              : item.circularDescription,
          fullBody: item.circularDescription,
        })
      );

      setCirculars(formattedCirculars);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCirculars();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // suppress unused variable
  void loading;

  return (
    <div className="flex flex-col h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Page Header */}
      <div className="flex items-start gap-3 mb-6 shrink-0">
        <FileText className="text-indigo-500 mt-0.5" size={28} strokeWidth={2} />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Circulars</h1>
          <p className="text-slate-500 text-sm mt-1">
            View company circulars, official updates and announcements
          </p>
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
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-500 font-medium">To:</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
              <button
                onClick={fetchCirculars}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-1.5 rounded-lg text-sm font-semibold tracking-wide shadow-sm transition-colors ml-1"
              >
                Get
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Circular Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 relative">
        {circulars.map((circular) => (
          <div key={circular.id} className="relative">
            <div className="absolute top-0 left-5 right-5 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full z-10" />
            <CircularCard circular={circular} onViewMore={setSelectedCircular} />
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
