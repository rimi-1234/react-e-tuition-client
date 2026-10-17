import React from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import LogoSection from "../LogoSection/LogoSection";

const Hero = () => {
  const heading = "Find the Perfect Tutor for You";
  const words = heading.split(" ");

  // Container variant to stagger word animations
  const containerVariant = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };

  // Animation for each word
  const wordVariant = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 15 },
    },
    bounce: {
      y: [0, -10, 0],
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10,
        repeat: Infinity,
        repeatDelay: 2,
      },
    },
  };

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: (customDelay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay: customDelay, duration: 0.8, ease: [0.22, 0.03, 0.26, 1] },
    }),
  };

  const imageVariant = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { delay: 0.4, duration: 1.2, ease: "easeOut" },
    },
  };

  return (
    <>
      {/* --- Hero Section --- */}
      <section className="relative mx-auto mt-2 flex min-h-[70vh] w-full max-w-[99%] items-center overflow-hidden rounded-b-[3rem] bg-gradient-to-br from-violet-50 via-white to-rose-50 px-6 pb-16 pt-16 text-base-content shadow-2xl dark:from-[#0B0B24] dark:via-[#14142e] dark:to-[#241433] dark:text-white md:px-12 md:pt-20 lg:px-24">

        {/* --- Background Elements --- */}
        <div className="absolute top-20 left-10 w-4 h-4 border-2 border-primary rotate-45 opacity-60 animate-pulse"></div>
        <div className="absolute bottom-40 left-[40%] w-0 h-0 border-l-[10px] border-l-transparent border-t-[15px] border-t-yellow-400 border-r-[10px] border-r-transparent rotate-12 opacity-80 animate-bounce"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>

        {/* --- Main Grid --- */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10 max-w-7xl mx-auto w-full">

          {/* --- Left Column --- */}
          <div className="space-y-6">
            <motion.div variants={fadeUpVariant} initial="hidden" animate="visible" custom={0.1}>
              <span className="text-secondary font-bold tracking-wider text-xs md:text-sm uppercase bg-secondary/10 px-2 md:px-3 py-1 rounded-full">
                Tuition Platform
              </span>
            </motion.div>

            {/* --- Bouncy Heading --- */}
            <motion.h1
              variants={containerVariant}
              initial="hidden"
              animate="visible"
              className="text-3xl md:text-4xl lg:text-5xl font-bold leading-snug"
            >
              {words.map((word, index) => (
                <motion.span
  key={index}
  initial={{ opacity: 0, y: -20 }}
  animate={{
    opacity: 1,
    y: [-5, 0], // only 2 keyframes for spring
  }}
  transition={{
    type: "spring",
    stiffness: 300,
    damping: 12,
    delay: index * 0.15 + 0.2,
    repeat: Infinity,
    repeatType: "mirror", // bounce back and forth
    repeatDelay: 2,
  }}
  className={`inline-block mr-2 ${
    index >= words.length - 3
      ? "text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"
      : ""
  }`}
>
  {word}
</motion.span>
              ))}
            </motion.h1>

            {/* --- Steps --- */}
            <motion.div variants={fadeUpVariant} initial="hidden" animate="visible" custom={0.3} className="space-y-3 text-sm text-base-content/80 dark:text-gray-200 md:space-y-4 md:text-base">
              <p className="flex items-center gap-2 md:gap-3">
                <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary flex items-center justify-center text-[0.6rem] md:text-sm font-bold shadow-md">1</span>
                Student posts a tuition requirement.
              </p>
              <p className="flex items-center gap-2 md:gap-3">
                <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-secondary flex items-center justify-center text-[0.6rem] md:text-sm font-bold shadow-md">2</span>
                Qualified tutors apply for the job.
              </p>
              <p className="flex items-center gap-2 md:gap-3">
                <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-tertiary text-black flex items-center justify-center text-[0.6rem] md:text-sm font-bold shadow-md">3</span>
                Admin reviews and connects you.
              </p>
            </motion.div>

            {/* --- Buttons --- */}
            <motion.div variants={fadeUpVariant} initial="hidden" animate="visible" custom={0.4} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 pt-4 md:pt-6">
            <Link 
    to="/tuitions" 
    className="px-6 md:px-8 py-3 md:py-4 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition shadow-lg transform hover:-translate-y-1 text-sm md:text-base text-center w-full sm:w-auto"
  >
    Find a Tuition
  </Link>
              <Link to="/about" className="group flex items-center gap-1 text-sm font-medium text-base-content transition hover:text-primary dark:text-white md:gap-2 md:text-base">
                How it Works <span className="group-hover:translate-x-1 transition">→</span>
              </Link>
            </motion.div>
          </div>

          {/* --- Right Column: Image --- */}
          <div className="relative flex justify-center lg:justify-end mt-12 lg:mt-0">
            <div className="absolute top-10 right-0 w-[400px] h-[400px] bg-secondary rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="relative z-10 w-full max-w-md">
              <div className="relative">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute bottom-10 -left-8 w-20 h-20 bg-tertiary rounded-full opacity-90 z-0"></div>

                <motion.div
                  variants={imageVariant}
                  initial="hidden"
                  animate="visible"
                  className="relative z-10 flex h-[280px] items-end justify-center overflow-hidden rounded-bl-[4rem] rounded-br-3xl rounded-tl-3xl rounded-tr-[4rem] border-[6px] border-base-100/40 bg-[#FDF6E9] shadow-2xl lg:h-[380px]"
                >
                  <img
                    alt="Students collaborating during a study session"
                    className="h-full w-full object-cover"
                    src="/images/students-collab.jpg"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Logo Section --- */}
      <LogoSection />
    </>
  );
};

export default Hero;
