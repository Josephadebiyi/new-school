import { motion } from 'framer-motion';
import { CalendarDays, Clock3, MapPin, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const events = [
  {
    title: 'Open Day for Future Learners',
    date: 'May 2026',
    format: 'Online Information Session',
    location: 'Virtual',
    description: 'Meet the GITB team, explore programs, and learn how our admissions and student support experience works.',
  },
  {
    title: 'Career Readiness Workshop',
    date: 'June 2026',
    format: 'Live Workshop',
    location: 'Vilnius + Online',
    description: 'A focused session on positioning, portfolio readiness, communication, and preparing for digital opportunities.',
  },
  {
    title: 'Student Experience Q&A',
    date: 'July 2026',
    format: 'Interactive Panel',
    location: 'Virtual',
    description: 'Hear from mentors, staff, and learners about what growth, accountability, and practical training look like at GITB.',
  },
];

const Events = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-[#0B3B2C] pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#164E3E] to-transparent opacity-50" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <p className="text-sm font-bold tracking-[0.25em] uppercase text-[#D4F542] mb-5">Events</p>
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              Events that connect learning with opportunity.
            </h1>
            <p className="text-white/65 text-lg leading-relaxed">
              Join open days, workshops, and interactive sessions designed to help future learners understand GITB, explore programs, and prepare for their next steps.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#F5F3EA] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: CalendarDays, title: 'Open sessions', text: 'Discover upcoming events and introductions to the GITB learning experience.' },
              { icon: Users, title: 'Live interaction', text: 'Connect with staff, mentors, and prospective learners through guided sessions.' },
              { icon: Clock3, title: 'Practical value', text: 'Each event is designed to help participants make more informed learning and career decisions.' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-3xl bg-white p-6 shadow-sm border border-black/5">
                  <div className="w-12 h-12 rounded-2xl bg-[#0B3B2C] flex items-center justify-center mb-4">
                    <Icon size={20} className="text-[#D4F542]" />
                  </div>
                  <h2 className="text-lg font-bold text-[#1a1a1a] mb-2">{item.title}</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="text-sm font-bold tracking-[0.2em] uppercase text-[#6B5B4F] mb-4">Upcoming events</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4">Join the next GITB experience.</h2>
            <p className="text-gray-600 leading-relaxed">
              Our events create space for exploration, connection, and clarity, helping future learners understand how GITB supports academic growth and professional development.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-7">
            {events.map((event, index) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="rounded-[2rem] bg-white border border-black/5 shadow-sm p-7"
              >
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8B7355] mb-3">{event.date}</p>
                <h3 className="text-2xl font-bold text-[#1a1a1a] mb-3">{event.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{event.description}</p>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock3 size={15} className="text-[#0B3B2C]" />
                    <span>{event.format}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={15} className="text-[#0B3B2C]" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#8B7355] py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-5">Want to hear about future events?</h2>
          <p className="text-white/80 max-w-2xl mx-auto leading-relaxed mb-8">
            Explore our programs or contact the admissions team to learn about upcoming workshops, open days, and student sessions.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/courses')}
              className="bg-white text-[#8B7355] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#F5F3EA] transition-colors cursor-pointer"
            >
              Explore Courses
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="border border-white/25 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              Contact Admissions
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Events;
