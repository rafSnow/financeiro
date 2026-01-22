/* eslint-disable no-unused-vars */
import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Wrapper para animar um único item
 * Animação de fade + slide
 */
export const AnimatedItem = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -100 }}
    transition={{ duration: 0.3, delay }}
    whileHover={{ scale: 1.02 }}
  >
    {children}
  </motion.div>
);

AnimatedItem.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
};

/**
 * Container para lista com animação stagger
 * Anima os filhos em sequência
 */
export const AnimatedList = ({ children }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
        },
      },
    }}
    initial="hidden"
    animate="show"
  >
    {children}
  </motion.div>
);

AnimatedList.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Wrapper para animar cards individuais em uma lista
 */
export const AnimatedCard = ({ children }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      show: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.3,
        },
      },
    }}
    whileHover={{
      scale: 1.02,
      transition: { duration: 0.2 },
    }}
    whileTap={{ scale: 0.98 }}
  >
    {children}
  </motion.div>
);

AnimatedCard.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Wrapper para modais com animação de fade + scale
 */
export const AnimatedModal = ({ children, isOpen }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
        >
          {children}
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

AnimatedModal.propTypes = {
  children: PropTypes.node.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

/**
 * Componente para transição de páginas
 */
export const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

PageTransition.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Animação de fade simples
 */
export const FadeIn = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3, delay }}
  >
    {children}
  </motion.div>
);

FadeIn.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
};

/**
 * Animação de slide from left
 */
export const SlideFromLeft = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3, delay }}
  >
    {children}
  </motion.div>
);

SlideFromLeft.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
};

/**
 * Animação de slide from right
 */
export const SlideFromRight = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.3, delay }}
  >
    {children}
  </motion.div>
);

SlideFromRight.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
};
