import { ArrowRight, MessageCircle, ShieldCheck } from 'lucide-react';

const Helpdesk = () => {
  return (
    <div className="min-h-screen bg-[#E8E04A] pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-[#1a1a1a] mb-8">Helpdesk</h1>
          <p className="text-xl text-[#1a1a1a]/80 mb-8">
            Chat 1-on-1 to provide personalised, real-time support, coaching and telehealth. Scale effortlessly with quick replies and AI.
          </p>
          <button className="bg-[#1a1a1a] text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition-colors cursor-pointer">
            Start free trial
          </button>
        </div>

        {/* App Mockup */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          <div className="bg-gray-100 border-b px-4 py-2 flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="grid md:grid-cols-3 h-[500px]">
            <div className="border-r bg-gray-50 p-4 hidden md:block">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-2 bg-white rounded-lg shadow-sm border-l-4 border-green-500">
                  <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                  <div>
                    <div className="text-xs font-bold">Sarah M.</div>
                    <div className="text-[10px] text-gray-500">Appointment request...</div>
                  </div>
                </div>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center space-x-2 p-2 hover:bg-white rounded-lg opacity-60">
                    <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                    <div>
                      <div className="text-xs font-bold">User {i}</div>
                      <div className="text-[10px] text-gray-500">Previous message...</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 bg-white flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <MessageCircle size={16} />
                  </div>
                  <span className="font-bold text-sm">Sarah M.</span>
                </div>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">AI Assist On</span>
              </div>
              <div className="flex-1 p-6 bg-gray-50 space-y-4 overflow-y-auto">
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm text-sm text-gray-700 max-w-[80%]">
                    Hi, I need to reschedule my appointment for tomorrow.
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-[#D4F542] p-3 rounded-lg rounded-tr-none shadow-sm text-sm text-[#0B3B2C] font-medium max-w-[80%]">
                    No problem, Sarah. I see you have a checkup at 10am. Would 2pm work for you?
                  </div>
                </div>
              </div>
              <div className="p-4 border-t bg-white">
                <div className="flex space-x-2">
                  <input type="text" placeholder="Type a message..." className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none" />
                  <button className="bg-[#0B3B2C] text-white p-2 rounded-full cursor-pointer">
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[#3E2723] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">With the Helpdesk, scale effortlessly from 1 to 1,000,000 chats.</h2>
            <p className="text-gray-300 mb-8">
              Have personalised, impactful conversations, triage urgent questions, escalate issues, hand off tasks seamlessly, and leverage AI for real-time suggestions and translations.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-4xl font-bold text-[#D4F542]">5M+</div>
                <div className="text-sm text-gray-400">Conversations handled</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#D4F542]">40k</div>
                <div className="text-sm text-gray-400">Operators supported</div>
              </div>
            </div>
          </div>
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
            <div className="flex items-start space-x-4">
              <div className="bg-[#D4F542] p-2 rounded-lg text-[#0B3B2C]">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-bold text-lg">Protect sensitive data</h4>
                <p className="text-sm text-gray-400">Hide personal identifiers to keep conversations private.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Helpdesk;
