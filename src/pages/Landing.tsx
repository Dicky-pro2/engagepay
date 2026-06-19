import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Megaphone, Coins, ArrowRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-12 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute w-[500px] h-[500px] bg-violet/20 rounded-full blur-[100px] -top-32 -left-32 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-blue-500/15 rounded-full blur-[100px] -bottom-24 -right-24 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 relative z-10"
      >
        <h1 className="font-sora font-extrabold text-3xl sm:text-4xl mb-2">
          Engage<span className="text-violet-light">Pay</span>
        </h1>
        <p className="text-slatec text-sm sm:text-base">
          Real social media engagement, powered by real people.
        </p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-5 relative z-10 w-full max-w-2xl justify-center">
        <RoleCard
          icon={<Megaphone size={32} />}
          title="I'm an Advertiser"
          desc="Post tasks for followers, likes & comments. Fund your wallet and watch engagement grow."
          color="violet"
          buttonLabel="Get Started"
          onClick={() => navigate('/signup?role=advertiser')}
        />
        <RoleCard
          icon={<Coins size={32} />}
          title="I'm an Earner"
          desc="Browse tasks, complete them, and earn coins instantly. Withdraw anytime."
          color="green"
          buttonLabel="Start Earning"
          onClick={() => navigate('/signup?role=earner')}
        />
      </div>

      {/* Already have account */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-slatec text-sm relative z-10"
      >
        Already have an account?{' '}
        <button
          onClick={() => navigate('/login')}
          className="text-violet-light font-semibold hover:underline"
        >
          Log in
        </button>
      </motion.p>
    </div>
  );
}

interface RoleCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: 'violet' | 'green';
  buttonLabel: string;
  onClick: () => void;
}

function RoleCard({ icon, title, desc, color, buttonLabel, onClick }: RoleCardProps) {
  const borderHover = {
    violet: 'hover:border-violet/40',
    green: 'hover:border-emerald2/40',
  };
  const iconBg = {
    violet: 'bg-violet/15 text-violet-light',
    green: 'bg-emerald2/15 text-emerald2',
  };
  const btnBg = {
    violet: 'bg-violet hover:bg-violet-dark',
    green: 'bg-emerald2 hover:bg-emerald-600',
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`card p-7 sm:p-8 w-full sm:w-72 text-center cursor-pointer transition-all ${borderHover[color]}`}
    >
      <div className={`w-16 h-16 rounded-2xl ${iconBg[color]} flex items-center justify-center mx-auto mb-4`}>
        {icon}
      </div>
      <h3 className="font-sora font-bold text-lg mb-2">{title}</h3>
      <p className="text-slatec text-sm leading-relaxed mb-5">{desc}</p>
      <span className={`inline-flex items-center gap-2 text-white font-bold text-sm rounded-full px-6 py-2.5 transition-all ${btnBg[color]}`}>
        {buttonLabel} <ArrowRight size={16} />
      </span>
    </motion.div>
  );
}