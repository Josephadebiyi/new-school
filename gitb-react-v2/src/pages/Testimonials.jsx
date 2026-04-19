import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const testimonialGroups = [
  {
    heading: 'Student voices',
    description: 'Learner stories help future students understand what growth, support, and progress can look like inside the GITB experience.',
    items: [
      {
        name: 'Amaka',
        role: 'Data Analytics Student',
        quote: 'I stopped feeling lost once the lessons became more practical. The structure helped me connect what I was learning to real opportunities.',
      },
      {
        name: 'David',
        role: 'Frontend Development Student',
        quote: 'The best part was how approachable the learning felt. I could actually follow the process and build things I was proud to show.',
      },
      {
        name: 'Favour',
        role: 'Virtual Assistant Student',
        quote: 'The support system made a huge difference. I felt like I was learning with people, not struggling alone.',
      },
    ],
  },
  {
    heading: 'Growth and momentum',
    description: 'These reflections highlight the kinds of confidence, clarity, and practical development that strong learning environments can create.',
    items: [
      {
        name: 'Samuel',
        role: 'AI & Automation Student',
        quote: 'The program made modern tools feel practical instead of abstract. I left with a clearer sense of where these skills fit in real work.',
      },
      {
        name: 'Esther',
        role: 'Product Design Student',
        quote: 'I loved that the teaching balanced clarity with challenge. It pushed me forward without making the process feel overwhelming.',
      },
      {
        name: 'Mariam',
        role: 'Product & Digital Marketing Student',
        quote: 'The new message of the site fits the experience better now. It feels more honest about support, progress, and what learners are actually trying to achieve.',
      },
    ],
  },
];

const Testimonials = () => {
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
            <p className="text-sm font-bold tracking-[0.25em] uppercase text-[#D4F542] mb-5">Testimonials</p>
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              What learners say matters.
            </h1>
            <p className="text-white/65 text-lg leading-relaxed">
              At GITB, student experience is central to how we think about quality, support, and outcomes. These stories reflect the kind of progress learners are working toward.
            </p>
          </motion.div>
        </div>
      </section>

      {testimonialGroups.map((group, groupIndex) => (
        <section key={group.heading} className={groupIndex % 2 === 0 ? 'bg-white py-20' : 'bg-[#F5F3EA] py-20'}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4">{group.heading}</h2>
              <p className="text-gray-600 leading-relaxed">{group.description}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {group.items.map((item) => (
                <div key={item.name} className="rounded-[2rem] bg-white p-8 border border-black/5 shadow-sm">
                  <div className="flex items-center gap-1 text-[#6B5B4F] mb-5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-6">"{item.quote}"</p>
                  <div>
                    <p className="font-bold text-[#1a1a1a]">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="bg-[#8B7355] py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-5">Ready to start your own story?</h2>
          <p className="text-white/80 max-w-2xl mx-auto leading-relaxed mb-8">
            Explore our programs and begin your journey with an institution focused on practical learning, guided support, and stronger professional readiness.
          </p>
          <button
            onClick={() => navigate('/apply')}
            className="bg-white text-[#8B7355] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#F5F3EA] transition-colors cursor-pointer"
          >
            Apply Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default Testimonials;
