import React from 'react';
import { motion } from 'framer-motion';

// Container to stagger logos
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.8,
    },
  },
};

// Each logo wrapper animation
const logoItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  },
  hover: { scale: 1.1, transition: { type: 'spring', stiffness: 300, damping: 15 } }
};

// Icon bounce/drop animation
const iconDropVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 250, damping: 15 }
  },
  bounce: {
    y: [0, -8], // subtle bounce (only 2 keyframes for spring)
    transition: {
      type: 'spring',
      stiffness: 250,
      damping: 12,
      repeat: Infinity,
      repeatType: 'mirror',
      repeatDelay: 2
    }
  }
};

// Text slide up
const textSlideVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
};

const LogoSection = () => {
 const logos = [
  { name: 'EduPlus', subtitle: 'Online Learning', color: 'text-blue-800', bg: 'bg-blue-200 rounded-full' },
  { name: 'TutorHub', subtitle: null, color: 'text-green-800' },
  { name: 'SmartLearn', subtitle: null, color: 'text-purple-800', bg: 'bg-purple-300 rounded-lg' },
  { name: 'StudyMate', subtitle: null, color: 'text-red-700' },
  { name: 'Brainy', subtitle: 'Tutoring Services', color: 'text-yellow-800', bg: 'bg-yellow-300 rounded-md' },


];


  return (
   <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4 z-20">
  <motion.div
    variants={containerVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    className="bg-white rounded-2xl shadow-xl py-6 px-4 flex flex-wrap justify-center items-center gap-20 border-t border-gray-100"
  >
    {logos.map((logo, index) => (
      <motion.div
        key={index}
        variants={logoItemVariants}
        whileHover={{ scale: 1.1 }}
        className="flex flex-col items-center justify-center opacity-70 hover:opacity-100 cursor-pointer transition-all duration-300"
      >
        {logo.bg && (
          <motion.div
            variants={iconDropVariants}
            animate="visible"
            className={`w-8 h-8 mb-2 flex items-center justify-center ${logo.bg}`}
          >
            {logo.bg.includes('rotate-45') && <div className="w-4 h-4 bg-white"></div>}
          </motion.div>
        )}

        <motion.h3 variants={textSlideVariants} className={`text-lg font-bold ${logo.color}`}>
          {logo.name}
        </motion.h3>

        {logo.subtitle && (
          <motion.span variants={textSlideVariants} className="text-[0.6rem] text-gray-500 uppercase mt-1">
            {logo.subtitle}
          </motion.span>
        )}
      </motion.div>
    ))}
  </motion.div>
</div>

  );
};

export default LogoSection;
